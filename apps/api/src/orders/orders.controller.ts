import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import {
  AddPaymentDto,
  ChangeOrderStatusDto,
  CreateOrderDto,
  QueryOrdersDto,
} from './dto/order.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đơn (đại lý tự đặt hoặc staff tạo hộ); PRE_ORDER = đặt cọc mùa vụ' })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: AuthUser) {
    return this.ordersService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Đại lý: đơn của mình — Staff: tất cả' })
  findAll(@Query() query: QueryOrdersDto, @CurrentUser() user: AuthUser) {
    return this.ordersService.findAll(query, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.ordersService.findOne(id, user);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary:
      'Chuyển trạng thái theo máy trạng thái: NEW → QUOTED → CONFIRMED → HARVESTING → PACKING → SHIPPING → COMPLETED (CANCELLED kèm lý do). Đại lý chỉ được hủy đơn của mình trước thu hoạch.',
  })
  changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeOrderStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.changeStatus(id, dto, user);
  }

  @Post(':id/payments')
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @ApiOperation({ summary: 'Ghi nhận thanh toán: cọc / một phần / đủ / trả công nợ' })
  addPayment(
    @Param('id') id: string,
    @Body() dto: AddPaymentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.addPayment(id, dto, user);
  }
}
