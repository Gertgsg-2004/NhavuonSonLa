import { Body, Controller, Delete, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CreateProductDto,
  ReplacePriceTiersDto,
  UpdateProductDto,
} from './dto/create-product.dto';
import { ProductsService } from './products.service';

@ApiTags('admin/products')
@ApiBearerAuth()
@Roles(UserRole.STAFF, UserRole.ADMIN)
@Controller('admin/products')
export class ProductsAdminController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  /** Xóa mềm (ẩn) — giữ lịch sử đơn hàng và kho */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  /** Thay toàn bộ bảng giá bậc số lượng */
  @Put(':id/price-tiers')
  replacePriceTiers(@Param('id') id: string, @Body() dto: ReplacePriceTiersDto) {
    return this.productsService.replacePriceTiers(id, dto);
  }
}
