import { OrderStatus, OrderType, PaymentMethod, PaymentType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class OrderItemInputDto {
  @IsString()
  productId: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number;

  /** Staff có thể chốt giá tay; đại lý để trống → tự tính theo bậc + chiết khấu */
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  unitPrice?: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateOrderDto {
  /** Staff tạo hộ thì bắt buộc; đại lý tự đặt thì bỏ qua (lấy từ tài khoản) */
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsEnum(OrderType)
  type?: OrderType;

  /** Bắt buộc khi type = PRE_ORDER (đặt cọc giữ hàng theo mùa vụ) */
  @IsOptional()
  @IsString()
  seasonId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];

  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  deliveryProvince?: string;

  @IsOptional()
  @IsString()
  receiverName?: string;

  @IsOptional()
  @IsString()
  receiverPhone?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  shippingFee?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  depositAmount?: number;

  @IsOptional()
  @IsString()
  customerNote?: string;
}

export class ChangeOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

export class AddPaymentDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsEnum(PaymentType)
  type: PaymentType;

  @IsOptional()
  @IsString()
  transactionRef?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class QueryOrdersDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  customerId?: string;
}
