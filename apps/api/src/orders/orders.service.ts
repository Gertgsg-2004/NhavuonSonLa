import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  OrderPaymentStatus,
  OrderStatus,
  PaymentType,
  Prisma,
  UserRole,
} from '@prisma/client';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { paginationMeta } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import {
  AddPaymentDto,
  ChangeOrderStatusDto,
  CreateOrderDto,
  QueryOrdersDto,
} from './dto/order.dto';

/**
 * Máy trạng thái đơn hàng (docs/02 §4.3):
 * NEW → QUOTED → CONFIRMED → HARVESTING → PACKING → SHIPPING → COMPLETED
 * Các trạng thái trước SHIPPING đều có thể hủy; SHIPPING chỉ hủy khi giao thất bại.
 */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW: [OrderStatus.QUOTED, OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  QUOTED: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.HARVESTING, OrderStatus.PACKING, OrderStatus.CANCELLED],
  HARVESTING: [OrderStatus.PACKING, OrderStatus.CANCELLED],
  PACKING: [OrderStatus.SHIPPING, OrderStatus.CANCELLED],
  SHIPPING: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: [],
};

const orderInclude = {
  items: { include: { product: { select: { id: true, name: true, slug: true, unit: true } } } },
  customer: { select: { id: true, code: true, companyName: true, phone: true } },
  statusHistory: { orderBy: { createdAt: 'asc' as const } },
  payments: { orderBy: { createdAt: 'asc' as const } },
  shipment: true,
} satisfies Prisma.OrderInclude;

type Tx = Prisma.TransactionClient;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
  ) {}

  async create(dto: CreateOrderDto, user: AuthUser) {
    const customerId = user.role === UserRole.DEALER ? user.customerId : dto.customerId;
    if (!customerId) {
      throw new UnprocessableEntityException('Thiếu khách hàng cho đơn (customerId)');
    }
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer || !customer.isActive) {
      throw new UnprocessableEntityException('Khách hàng không tồn tại hoặc đã ngừng hợp tác');
    }
    if (dto.type === 'PRE_ORDER' && !dto.seasonId) {
      throw new UnprocessableEntityException('Đơn đặt trước mùa vụ phải gắn mùa vụ (seasonId)');
    }

    // Định giá từng dòng: staff được chốt tay; đại lý tính theo bậc + chiết khấu
    const items: { productId: string; quantity: number; unit: string; unitPrice: number; note?: string }[] = [];
    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, slug: true, unit: true, status: true, minOrderQuantity: true },
      });
      if (!product || product.status === 'HIDDEN') {
        throw new UnprocessableEntityException(`Sản phẩm ${item.productId} không khả dụng`);
      }
      let unitPrice = item.unitPrice;
      if (unitPrice === undefined || user.role === UserRole.DEALER) {
        const pricing = await this.productsService.resolvePricing(
          product.slug,
          item.quantity,
          user,
        );
        if (pricing.priceOnRequest || !pricing.unitPrice) {
          throw new UnprocessableEntityException(
            `Sản phẩm "${product.slug}" cần báo giá riêng — vui lòng gửi yêu cầu báo giá`,
          );
        }
        unitPrice = pricing.unitPrice;
      }
      items.push({
        productId: product.id,
        quantity: item.quantity,
        unit: product.unit,
        unitPrice,
        note: item.note,
      });
    }

    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const shippingFee = dto.shippingFee ?? 0;
    const totalAmount = subtotal + shippingFee;

    // Kiểm tra hạn mức công nợ khi khách chưa thanh toán trước
    const projectedDebt = Number(customer.currentDebt) + totalAmount;
    if (Number(customer.creditLimit) > 0 && projectedDebt > Number(customer.creditLimit)) {
      // Không chặn cứng — staff quyết định; đại lý tự đặt thì chặn
      if (user.role === UserRole.DEALER) {
        throw new UnprocessableEntityException(
          'Đơn hàng vượt hạn mức công nợ. Vui lòng liên hệ nhân viên kinh doanh.',
        );
      }
    }

    const code = await this.nextOrderCode();
    return this.prisma.order.create({
      data: {
        code,
        type: dto.type ?? 'STANDARD',
        seasonId: dto.seasonId,
        customerId,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
        deliveryAddress: dto.deliveryAddress,
        deliveryProvince: dto.deliveryProvince,
        receiverName: dto.receiverName ?? customer.contactName,
        receiverPhone: dto.receiverPhone ?? customer.phone,
        subtotal,
        shippingFee,
        totalAmount,
        depositAmount: dto.depositAmount ?? 0,
        customerNote: dto.customerNote,
        createdById: user.id,
        dueDate:
          customer.paymentTermDays > 0
            ? new Date(Date.now() + customer.paymentTermDays * 86_400_000)
            : undefined,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unit: i.unit,
            unitPrice: i.unitPrice,
            subtotal: i.unitPrice * i.quantity,
            note: i.note,
          })),
        },
        statusHistory: {
          create: { toStatus: OrderStatus.NEW, changedById: user.id, note: 'Tạo đơn' },
        },
      },
      include: orderInclude,
    });
  }

  async findAll(query: QueryOrdersDto, user: AuthUser) {
    const where: Prisma.OrderWhereInput = {
      ...(query.status && { status: query.status }),
      ...(user.role === UserRole.DEALER
        ? { customerId: user.customerId ?? '__none__' }
        : query.customerId && { customerId: query.customerId }),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data: items, meta: paginationMeta(query.page, query.limit, total) };
  }

  async findOne(id: string, user: AuthUser) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: orderInclude });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (user.role === UserRole.DEALER && order.customerId !== user.customerId) {
      throw new ForbiddenException('Bạn không có quyền xem đơn hàng này');
    }
    return order;
  }

  /** Chuyển trạng thái + side effect kho (giữ chỗ / trừ kho / hoàn giữ chỗ) */
  async changeStatus(id: string, dto: ChangeOrderStatusDto, user: AuthUser) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    const allowed = TRANSITIONS[order.status];
    if (!allowed.includes(dto.status)) {
      throw new UnprocessableEntityException(
        `Không thể chuyển từ ${order.status} sang ${dto.status}. ` +
          (allowed.length
            ? `Trạng thái hợp lệ tiếp theo: ${allowed.join(', ')}`
            : 'Đơn đã kết thúc.'),
      );
    }

    // Đại lý chỉ được hủy đơn của mình khi chưa thu hoạch
    if (user.role === UserRole.DEALER) {
      const cancellable: OrderStatus[] = [OrderStatus.NEW, OrderStatus.QUOTED, OrderStatus.CONFIRMED];
      if (
        dto.status !== OrderStatus.CANCELLED ||
        order.customerId !== user.customerId ||
        !cancellable.includes(order.status)
      ) {
        throw new ForbiddenException('Bạn chỉ có thể hủy đơn của mình trước khi thu hoạch');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.status === OrderStatus.CONFIRMED) {
        await this.reserveStock(tx, order.items);
      }
      if (dto.status === OrderStatus.SHIPPING) {
        await this.shipStock(tx, order.id, order.items, user);
      }
      if (
        dto.status === OrderStatus.CANCELLED &&
        ([OrderStatus.CONFIRMED, OrderStatus.HARVESTING, OrderStatus.PACKING] as OrderStatus[]).includes(
          order.status,
        )
      ) {
        await this.releaseStock(tx, order.items);
      }
      if (dto.status === OrderStatus.COMPLETED) {
        // Phần chưa thanh toán chuyển thành công nợ của khách
        const outstanding = Number(order.totalAmount) - Number(order.paidAmount);
        if (outstanding > 0) {
          await tx.customer.update({
            where: { id: order.customerId },
            data: { currentDebt: { increment: outstanding } },
          });
        }
      }

      return tx.order.update({
        where: { id },
        data: {
          status: dto.status,
          ...(dto.status === OrderStatus.CANCELLED && { cancelReason: dto.note }),
          statusHistory: {
            create: {
              fromStatus: order.status,
              toStatus: dto.status,
              note: dto.note,
              changedById: user.id,
            },
          },
        },
        include: orderInclude,
      });
    });
  }

  /** Ghi nhận thanh toán thủ công (COD/chuyển khoản); cổng online ở GĐ3 */
  async addPayment(id: string, dto: AddPaymentDto, user: AuthUser) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    // Trả công nợ chỉ áp dụng cho đơn đã hoàn thành (công nợ phát sinh lúc COMPLETED);
    // trước đó hãy dùng DEPOSIT/PARTIAL/FULL để tránh trừ nợ hai lần.
    if (dto.type === PaymentType.DEBT_PAYMENT && order.status !== OrderStatus.COMPLETED) {
      throw new UnprocessableEntityException(
        'Thanh toán công nợ chỉ áp dụng cho đơn đã hoàn thành — dùng loại DEPOSIT/PARTIAL/FULL',
      );
    }

    const code = `PT-${new Date().getFullYear()}-${String(
      (await this.prisma.payment.count()) + 1,
    ).padStart(5, '0')}`;

    return this.prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          code,
          orderId: order.id,
          customerId: order.customerId,
          amount: dto.amount,
          method: dto.method,
          type: dto.type,
          status: 'SUCCESS',
          transactionRef: dto.transactionRef,
          paidAt: new Date(),
          note: dto.note,
        },
      });

      const paidAmount = Number(order.paidAmount) + dto.amount;
      const total = Number(order.totalAmount);
      const paymentStatus: OrderPaymentStatus =
        paidAmount >= total
          ? OrderPaymentStatus.PAID
          : dto.type === PaymentType.DEPOSIT
            ? OrderPaymentStatus.DEPOSIT
            : OrderPaymentStatus.PARTIAL;

      // Trả nợ sau khi đơn đã hoàn thành → giảm công nợ khách
      if (dto.type === PaymentType.DEBT_PAYMENT) {
        await tx.customer.update({
          where: { id: order.customerId },
          data: { currentDebt: { decrement: dto.amount } },
        });
      }

      return tx.order.update({
        where: { id },
        data: { paidAmount, paymentStatus },
        include: orderInclude,
      });
    });
  }

  // ----------------------------- Kho ----------------------------------------
  // Ghi chú: giữ chỗ greedy trên các dòng tồn. GĐ2 nâng cấp bảng `reservations`
  // để hoàn trả chính xác từng đơn khi hủy (xem docs/03 §4).

  private async reserveStock(
    tx: Tx,
    items: { productId: string; quantity: Prisma.Decimal }[],
  ) {
    for (const item of items) {
      let remaining = Number(item.quantity);
      const inventories = await tx.inventory.findMany({
        where: { productId: item.productId },
        orderBy: { updatedAt: 'asc' },
      });
      for (const inv of inventories) {
        if (remaining <= 0) break;
        const available = Number(inv.quantity) - Number(inv.reservedQuantity);
        if (available <= 0) continue;
        const take = Math.min(available, remaining);
        await tx.inventory.update({
          where: { id: inv.id },
          data: { reservedQuantity: { increment: take } },
        });
        remaining -= take;
      }
      if (remaining > 0) {
        throw new UnprocessableEntityException(
          `Tồn kho khả dụng không đủ cho sản phẩm ${item.productId} (thiếu ${remaining}kg)`,
        );
      }
    }
  }

  private async releaseStock(
    tx: Tx,
    items: { productId: string; quantity: Prisma.Decimal }[],
  ) {
    for (const item of items) {
      let remaining = Number(item.quantity);
      const inventories = await tx.inventory.findMany({
        where: { productId: item.productId, reservedQuantity: { gt: 0 } },
        orderBy: { updatedAt: 'desc' },
      });
      for (const inv of inventories) {
        if (remaining <= 0) break;
        const release = Math.min(Number(inv.reservedQuantity), remaining);
        await tx.inventory.update({
          where: { id: inv.id },
          data: { reservedQuantity: { decrement: release } },
        });
        remaining -= release;
      }
    }
  }

  /** Xuất kho thật khi lên xe: trừ tồn + ghi sổ kho + trừ lô hàng */
  private async shipStock(
    tx: Tx,
    orderId: string,
    items: { productId: string; quantity: Prisma.Decimal }[],
    user: AuthUser,
  ) {
    for (const item of items) {
      let remaining = Number(item.quantity);
      const inventories = await tx.inventory.findMany({
        where: { productId: item.productId, quantity: { gt: 0 } },
        orderBy: { updatedAt: 'asc' },
      });
      for (const inv of inventories) {
        if (remaining <= 0) break;
        const take = Math.min(Number(inv.quantity), remaining);
        await tx.inventory.update({
          where: { id: inv.id },
          data: {
            quantity: { decrement: take },
            reservedQuantity: { decrement: Math.min(Number(inv.reservedQuantity), take) },
          },
        });
        if (inv.batchId) {
          await tx.harvestBatch.update({
            where: { id: inv.batchId },
            data: { remainingKg: { decrement: take } },
          });
        }
        await tx.inventoryLog.create({
          data: {
            inventoryId: inv.id,
            productId: item.productId,
            type: 'SALE_OUT',
            quantity: -take,
            orderId,
            createdById: user.id,
          },
        });
        remaining -= take;
      }
      if (remaining > 0) {
        throw new UnprocessableEntityException(
          `Tồn kho không đủ để xuất cho sản phẩm ${item.productId} (thiếu ${remaining}kg)`,
        );
      }
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: Number(item.quantity) } },
      });
    }
  }

  private async nextOrderCode(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.order.count({
      where: { createdAt: { gte: new Date(year, 0, 1) } },
    });
    return `DH-${year}-${String(count + 1).padStart(5, '0')}`;
  }
}
