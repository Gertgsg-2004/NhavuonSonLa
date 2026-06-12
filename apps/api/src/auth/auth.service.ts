import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { CustomerType, User, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDealerDto } from './dto/auth.dto';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** Đăng ký đại lý: tạo hồ sơ khách hàng + tài khoản PENDING chờ duyệt */
  async register(dto: RegisterDealerDto) {
    const existed = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existed) throw new ConflictException('Email đã được đăng ký');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const customerCount = await this.prisma.customer.count();
    const code = `KH-${String(customerCount + 1).padStart(4, '0')}`;

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        fullName: dto.fullName,
        role: UserRole.DEALER,
        status: UserStatus.PENDING,
        customer: {
          create: {
            code,
            companyName: dto.companyName,
            contactName: dto.fullName,
            phone: dto.phone,
            email: dto.email,
            taxCode: dto.taxCode,
            customerType: dto.customerType ?? CustomerType.DAI_LY,
            address: dto.address,
            province: dto.province,
          },
        },
      },
    });

    // TODO(GĐ2): thông báo cho staff duyệt qua email/Zalo (queue)
    return {
      userId: user.id,
      message:
        'Đăng ký thành công. Nhà vườn sẽ xác minh và kích hoạt tài khoản trong 24h làm việc.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { customer: true },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    if (user.status === UserStatus.PENDING) {
      throw new ForbiddenException('Tài khoản đang chờ nhà vườn duyệt');
    }
    if (user.status === UserStatus.LOCKED) {
      throw new ForbiddenException('Tài khoản đã bị khóa, vui lòng liên hệ hotline');
    }

    const tokens = await this.issueTokens(user);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10),
      },
    });
    return { user: this.toProfile(user), ...tokens };
  }

  /** Cấp lại access token + xoay vòng refresh token */
  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret',
      });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (
      !user ||
      !user.refreshTokenHash ||
      !(await bcrypt.compare(refreshToken, user.refreshTokenHash))
    ) {
      throw new UnauthorizedException('Refresh token đã bị thu hồi');
    }

    const tokens = await this.issueTokens(user);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10) },
    });
    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
    return { message: 'Đã đăng xuất' };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { customer: true },
    });
    if (!user) throw new UnauthorizedException();
    return this.toProfile(user);
  }

  private async issueTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      customerId: user.customerId,
    };
    const expiresIn = (key: string, fallback: string) =>
      (this.config.get<string>(key) ?? fallback) as JwtSignOptions['expiresIn'];
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET') ?? 'dev-access-secret',
        expiresIn: expiresIn('JWT_ACCESS_EXPIRES', '15m'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret',
        expiresIn: expiresIn('JWT_REFRESH_EXPIRES', '7d'),
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private toProfile<T extends User>(user: T) {
    const { passwordHash, refreshTokenHash, twoFactorSecret, ...profile } = user;
    void passwordHash;
    void refreshTokenHash;
    void twoFactorSecret;
    return profile;
  }
}
