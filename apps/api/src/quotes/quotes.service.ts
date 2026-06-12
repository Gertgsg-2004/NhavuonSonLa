import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { OrderStatus, Prisma, QuoteStatus, UserRole } from '@prisma/client';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { paginationMeta } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteDto, QueryQuotesDto, UpdateQuoteDto } from './dto/quote.dto';

const quoteInclude = {
  items: { include: { product: { select: { id: true, name: true, slug: true, unit: true } } } },
  customer: { select: { id: true, code: true, companyName: true, discountRate: true } },
  assignedTo: { select: { id: true, fullName: true } },
} satisfies Prisma.QuoteInclude;

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Khách (vãng lai hoặc đại lý) gửi yêu cầu báo giá */
  async create(dto: CreateQuoteDto, user?: AuthUser) {
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, status: { not: 'HIDDEN' } },
      select: { id: true, unit: true },
    });
    if (products.length !== new Set(productIds).size) {
      throw new UnprocessableEntityException('Có sản phẩm không tồn tại hoặc đã ngừng bán');
    }
    const unitOf = new Map(products.map((p) => [p.id, p.unit]));

    const code = await this.nextCode('BG');
    const quote = await this.prisma.quote.create({
      data: {
        code,
        fullName: dto.fullName,
        companyName: dto.companyName,
        phone: dto.phone,
        email: dto.email,
        note: dto.note,
        customerId: user?.customerId ?? null,
        items: {
          create: dto.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unit: i.unit ?? unitOf.get(i.productId) ?? 'kg',
            note: i.note,
          })),
        },
      },
      include: quoteInclude,
    });

    // TODO(GĐ2): đẩy thông báo email/Zalo cho nhân viên kinh doanh qua queue
    return quote;
  }

  /** Đại lý chỉ thấy báo giá của mình; staff/admin thấy tất cả */
  async findAll(query: QueryQuotesDto, user: AuthUser) {
    const where: Prisma.QuoteWhereInput = {
      ...(query.status && { status: query.status }),
      ...(user.role === UserRole.DEALER && { customerId: user.customerId ?? '__none__' }),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.quote.findMany({
        where,
        include: quoteInclude,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.quote.count({ where }),
    ]);
    return { data: items, meta: paginationMeta(query.page, query.limit, total) };
  }

  async findOne(id: string, user: AuthUser) {
    const quote = await this.prisma.quote.findUnique({ where: { id }, include: quoteInclude });
    if (!quote) throw new NotFoundException('Không tìm thấy báo giá');
    if (user.role === UserRole.DEALER && quote.customerId !== user.customerId) {
      throw new ForbiddenException('Bạn không có quyền xem báo giá này');
    }
    return quote;
  }

  /** Nhân viên định giá từng dòng + cập nhật trạng thái */
  async update(id: string, dto: UpdateQuoteDto, user: AuthUser) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!quote) throw new NotFoundException('Không tìm thấy báo giá');
    if (quote.status === QuoteStatus.CONVERTED) {
      throw new UnprocessableEntityException('Báo giá đã chuyển thành đơn hàng, không thể sửa');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.items?.length) {
        const itemIds = new Set(quote.items.map((i) => i.id));
        for (const item of dto.items) {
          if (!itemIds.has(item.id)) {
            throw new UnprocessableEntityException(`Dòng báo giá ${item.id} không thuộc báo giá này`);
          }
          await tx.quoteItem.update({
            where: { id: item.id },
            data: { quotedPrice: item.quotedPrice },
          });
        }
      }

      const items = await tx.quoteItem.findMany({ where: { quoteId: id } });
      const allPriced = items.every((i) => i.quotedPrice !== null);
      const totalQuoted = allPriced
        ? items.reduce((sum, i) => sum + Number(i.quotedPrice) * Number(i.quantity), 0)
        : null;

      return tx.quote.update({
        where: { id },
        data: {
          status: dto.status ?? (allPriced ? QuoteStatus.QUOTED : QuoteStatus.PROCESSING),
          validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
          internalNote: dto.internalNote,
          assignedToId: dto.assignedToId ?? user.id,
          totalQuoted,
          // TODO(GĐ2): sinh PDF báo giá có logo (queue) rồi cập nhật pdfUrl
        },
        include: quoteInclude,
      });
    });
  }

  /** Chuyển báo giá đã chốt thành đơn hàng */
  async convertToOrder(id: string, user: AuthUser) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: { items: true, order: true },
    });
    if (!quote) throw new NotFoundException('Không tìm thấy báo giá');
    if (quote.order) {
      throw new UnprocessableEntityException(`Báo giá đã được chuyển thành đơn ${quote.order.code}`);
    }
    if (!quote.customerId) {
      throw new UnprocessableEntityException(
        'Báo giá của khách vãng lai: hãy tạo hồ sơ khách hàng và gán vào báo giá trước khi chuyển đơn',
      );
    }
    if (quote.items.some((i) => i.quotedPrice === null)) {
      throw new UnprocessableEntityException('Tất cả các dòng phải có đơn giá trước khi chuyển đơn');
    }

    const subtotal = quote.items.reduce(
      (sum, i) => sum + Number(i.quotedPrice) * Number(i.quantity),
      0,
    );
    const orderCode = await this.nextCode('DH');

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          code: orderCode,
          customerId: quote.customerId!,
          quoteId: quote.id,
          status: OrderStatus.QUOTED, // giá đã thống nhất, chờ khách xác nhận
          subtotal,
          totalAmount: subtotal,
          customerNote: quote.note,
          createdById: user.id,
          items: {
            create: quote.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unit: i.unit,
              unitPrice: i.quotedPrice!,
              subtotal: Number(i.quotedPrice) * Number(i.quantity),
              note: i.note,
            })),
          },
          statusHistory: {
            create: {
              toStatus: OrderStatus.QUOTED,
              note: `Chuyển từ báo giá ${quote.code}`,
              changedById: user.id,
            },
          },
        },
        include: { items: true },
      });

      await tx.quote.update({
        where: { id },
        data: { status: QuoteStatus.CONVERTED },
      });

      return order;
    });
  }

  /** Mã tuần tự theo năm: BG-2026-00001 / DH-2026-00001 */
  private async nextCode(prefix: 'BG' | 'DH'): Promise<string> {
    const year = new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const count =
      prefix === 'BG'
        ? await this.prisma.quote.count({ where: { createdAt: { gte: startOfYear } } })
        : await this.prisma.order.count({ where: { createdAt: { gte: startOfYear } } });
    return `${prefix}-${year}-${String(count + 1).padStart(5, '0')}`;
  }
}
