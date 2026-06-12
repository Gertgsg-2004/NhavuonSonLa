import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // Route công khai: vẫn thử nhận diện user nếu có token,
      // để service lộ giá đúng theo vai trò (đại lý thấy giá sỉ).
      try {
        await super.canActivate(context);
      } catch {
        // token thiếu/sai → coi như khách vãng lai
      }
      return true;
    }

    return (await super.canActivate(context)) as boolean;
  }
}
