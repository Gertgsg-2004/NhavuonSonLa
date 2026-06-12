import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { PricingQueryDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Danh sách sản phẩm + bộ lọc (mùa, vùng, tiêu chuẩn, xuất khẩu, giá)' })
  findAll(@Query() query: QueryProductsDto, @CurrentUser() user?: AuthUser) {
    return this.productsService.findAll(query, user);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Chi tiết sản phẩm — mức lộ giá phụ thuộc vai trò' })
  findBySlug(@Param('slug') slug: string, @CurrentUser() user?: AuthUser) {
    return this.productsService.findBySlug(slug, user);
  }

  @Public()
  @Get(':slug/pricing')
  @ApiOperation({ summary: 'Đơn giá áp dụng cho khối lượng (giá bậc + chiết khấu riêng)' })
  pricing(
    @Param('slug') slug: string,
    @Query() query: PricingQueryDto,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.productsService.resolvePricing(slug, query.quantity, user);
  }
}
