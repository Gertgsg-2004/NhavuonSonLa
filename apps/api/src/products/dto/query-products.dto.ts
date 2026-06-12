import { CertificationType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

const toBoolean = ({ value }: { value: unknown }) =>
  value === true || value === 'true' || value === '1';

export class QueryProductsDto extends PaginationDto {
  /** Slug danh mục: xoai, nhan, man... */
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;

  /** Vùng trồng: Yên Châu, Mộc Châu, Sông Mã... */
  @IsOptional()
  @IsString()
  region?: string;

  /** 'now' hoặc tháng 1-12 — lọc sản phẩm có mùa vụ phủ tháng đó */
  @IsOptional()
  @IsString()
  season?: string;

  /** Tiêu chuẩn: VIETGAP | GLOBALGAP | ORGANIC | HACCP */
  @IsOptional()
  @IsEnum(CertificationType)
  certification?: CertificationType;

  /** Chỉ hàng đạt chuẩn xuất khẩu */
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  export?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  featured?: boolean;

  /** Lọc theo giá lẻ tham khảo — chỉ áp dụng với sản phẩm được phép xem giá */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsIn(['newest', 'price_asc', 'price_desc', 'name'])
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name';
}
