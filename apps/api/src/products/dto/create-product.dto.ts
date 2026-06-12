import { PartialType } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  slug: string;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  farmId?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  growingRegion?: string;

  @IsOptional()
  @IsString()
  harvestPeriod?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  minOrderQuantity?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  retailPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  wholesalePrice?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  dealerPrice?: number;

  @IsOptional()
  @IsBoolean()
  isPriceVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isExportQuality?: boolean;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class PriceTierDto {
  @Type(() => Number)
  @IsPositive()
  minQuantity: number;

  @Type(() => Number)
  @IsPositive()
  price: number;

  @IsOptional()
  @IsString()
  label?: string;
}

/** Thay toàn bộ bảng giá bậc của một sản phẩm */
export class ReplacePriceTiersDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PriceTierDto)
  tiers: PriceTierDto[];
}

export class PricingQueryDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number;
}
