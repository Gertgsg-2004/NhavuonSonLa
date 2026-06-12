import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { paginationMeta } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductDto,
  ReplacePriceTiersDto,
  UpdateProductDto,
} from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  farm: { select: { id: true, name: true, region: true } },
  media: { orderBy: { sortOrder: 'asc' as const } },
  priceTiers: { orderBy: { minQuantity: 'asc' as const } },
  seasons: { orderBy: { year: 'desc' as const }, take: 2 },
  certifications: true,
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // ----------------------------- Công khai ---------------------------------

  async findAll(query: QueryProductsDto, user?: AuthUser) {
    const where: Prisma.ProductWhereInput = {
      status: { not: 'HIDDEN' },
      ...(query.category && { category: { slug: query.category } }),
      ...(query.region && {
        growingRegion: { contains: query.region, mode: 'insensitive' as const },
      }),
      ...(query.featured !== undefined && { isFeatured: query.featured }),
      ...(query.export !== undefined && { isExportQuality: query.export }),
      ...(query.certification && {
        certifications: { some: { type: query.certification } },
      }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { shortDescription: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    // Lọc theo giá lẻ tham khảo (chỉ sản phẩm công khai giá để khách lẻ lọc được)
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.retailPrice = {
        ...(query.minPrice !== undefined && { gte: query.minPrice }),
        ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
      };
      if (!user) where.isPriceVisible = true;
    }

    // Lọc theo mùa: tháng thuộc khoảng [startMonth..endMonth], hỗ trợ vụ vắt năm (12 → 4)
    const month = query.season === 'now' ? new Date().getMonth() + 1 : Number(query.season);
    if (Number.isInteger(month) && month >= 1 && month <= 12) {
      const seasons = await this.prisma.fruitSeason.findMany({
        select: { productId: true, startMonth: true, endMonth: true },
      });
      const ids = [
        ...new Set(
          seasons
            .filter((s) =>
              s.startMonth <= s.endMonth
                ? month >= s.startMonth && month <= s.endMonth
                : month >= s.startMonth || month <= s.endMonth,
            )
            .map((s) => s.productId),
        ),
      ];
      where.id = { in: ids };
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      query.sort === 'price_asc'
        ? { retailPrice: 'asc' }
        : query.sort === 'price_desc'
          ? { retailPrice: 'desc' }
          : query.sort === 'name'
            ? { name: 'asc' }
            : { createdAt: 'desc' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: productInclude,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: items.map((p) => this.serialize(p, user)),
      meta: paginationMeta(query.page, query.limit, total),
    };
  }

  async findBySlug(slug: string, user?: AuthUser) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: productInclude,
    });
    if (!product || product.status === 'HIDDEN') {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    void this.prisma.product
      .update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } })
      .catch(() => undefined);
    return this.serialize(product, user);
  }

  /**
   * Đơn giá áp dụng cho một khối lượng cụ thể:
   * bậc giá cao nhất có minQuantity ≤ quantity → áp chiết khấu riêng của khách.
   */
  async resolvePricing(slug: string, quantity: number, user?: AuthUser) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { priceTiers: { orderBy: { minQuantity: 'asc' } } },
    });
    if (!product || product.status === 'HIDDEN') {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    if (!this.canSeePrices(product, user)) {
      return {
        productId: product.id,
        quantity,
        priceOnRequest: true,
        message: 'Vui lòng gửi yêu cầu báo giá hoặc đăng nhập tài khoản đại lý để xem giá',
      };
    }

    if (quantity < Number(product.minOrderQuantity)) {
      throw new UnprocessableEntityException(
        `Khối lượng đặt tối thiểu là ${Number(product.minOrderQuantity)}${product.unit}`,
      );
    }

    const tier = [...product.priceTiers]
      .reverse()
      .find((t) => Number(t.minQuantity) <= quantity);
    let unitPrice =
      Number(tier?.price ?? product.wholesalePrice ?? product.retailPrice ?? 0);

    let discountRate = 0;
    if (user?.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: user.customerId },
        select: { discountRate: true },
      });
      discountRate = Number(customer?.discountRate ?? 0);
      if (discountRate > 0) {
        unitPrice = Math.round((unitPrice * (1 - discountRate / 100)) / 100) * 100;
      }
    }

    return {
      productId: product.id,
      quantity,
      unit: product.unit,
      appliedTier: tier ? { minQuantity: Number(tier.minQuantity), label: tier.label } : null,
      discountRate,
      unitPrice,
      estimatedTotal: Math.round(unitPrice * quantity),
      priceOnRequest: false,
    };
  }

  // ------------------------------ Quản trị ---------------------------------

  async create(dto: CreateProductDto) {
    await this.ensureSlugFree(dto.slug);
    return this.prisma.product.create({ data: dto, include: productInclude });
  }

  async update(id: string, dto: UpdateProductDto) {
    const existed = await this.prisma.product.findUnique({ where: { id } });
    if (!existed) throw new NotFoundException('Không tìm thấy sản phẩm');
    if (dto.slug && dto.slug !== existed.slug) await this.ensureSlugFree(dto.slug);
    return this.prisma.product.update({ where: { id }, data: dto, include: productInclude });
  }

  /** Xóa mềm: chuyển HIDDEN để giữ vẹn toàn lịch sử đơn hàng/kho */
  async remove(id: string) {
    const existed = await this.prisma.product.findUnique({ where: { id } });
    if (!existed) throw new NotFoundException('Không tìm thấy sản phẩm');
    await this.prisma.product.update({ where: { id }, data: { status: 'HIDDEN' } });
    return { message: 'Đã ẩn sản phẩm' };
  }

  async replacePriceTiers(id: string, dto: ReplacePriceTiersDto) {
    const existed = await this.prisma.product.findUnique({ where: { id } });
    if (!existed) throw new NotFoundException('Không tìm thấy sản phẩm');

    const seen = new Set(dto.tiers.map((t) => t.minQuantity));
    if (seen.size !== dto.tiers.length) {
      throw new UnprocessableEntityException('Các bậc giá không được trùng khối lượng tối thiểu');
    }

    await this.prisma.$transaction([
      this.prisma.productPriceTier.deleteMany({ where: { productId: id } }),
      this.prisma.productPriceTier.createMany({
        data: dto.tiers.map((t) => ({ ...t, productId: id })),
      }),
    ]);
    return this.prisma.productPriceTier.findMany({
      where: { productId: id },
      orderBy: { minQuantity: 'asc' },
    });
  }

  // ------------------------------ Nội bộ -----------------------------------

  /** Đã đăng nhập (đại lý/nhân viên) → luôn xem được giá kể cả sản phẩm ẩn giá */
  private canSeeWholesale(user?: AuthUser | null): boolean {
    return !!user;
  }

  /** Khách vãng lai chỉ thấy giá khi sản phẩm bật isPriceVisible */
  private canSeePrices(product: { isPriceVisible: boolean }, user?: AuthUser | null): boolean {
    return this.canSeeWholesale(user) || product.isPriceVisible;
  }

  /** Lộ giá đúng theo vai trò — quy tắc trung tâm của hệ thống (docs/02 §4.1) */
  private serialize(product: ProductWithRelations, user?: AuthUser | null) {
    const seePrices = this.canSeePrices(product, user);
    const seeWholesale = this.canSeeWholesale(user);
    const seeInternal = user?.role === UserRole.STAFF || user?.role === UserRole.ADMIN;

    return {
      ...product,
      retailPrice: seePrices ? product.retailPrice : null,
      priceTiers: seePrices ? product.priceTiers : [],
      // Giá nền sỉ/đại lý chỉ cho tài khoản đăng nhập
      wholesalePrice: seeWholesale ? product.wholesalePrice : null,
      dealerPrice: seeWholesale ? product.dealerPrice : null,
      priceOnRequest: !seePrices,
      stockQuantity: seeInternal ? product.stockQuantity : undefined,
      lowStockThreshold: seeInternal ? product.lowStockThreshold : undefined,
    };
  }

  private async ensureSlugFree(slug: string) {
    const existed = await this.prisma.product.findUnique({ where: { slug } });
    if (existed) throw new UnprocessableEntityException(`Slug "${slug}" đã tồn tại`);
  }
}
