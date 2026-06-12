import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateQuoteDto, QueryQuotesDto, UpdateQuoteDto } from './dto/quote.dto';
import { QuotesService } from './quotes.service';

@ApiTags('quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post()
  @ApiOperation({ summary: 'Gửi yêu cầu báo giá (không cần đăng nhập)' })
  create(@Body() dto: CreateQuoteDto, @CurrentUser() user?: AuthUser) {
    return this.quotesService.create(dto, user);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đại lý: báo giá của mình — Staff: tất cả' })
  findAll(@Query() query: QueryQuotesDto, @CurrentUser() user: AuthUser) {
    return this.quotesService.findAll(query, user);
  }

  @Get(':id')
  @ApiBearerAuth()
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.quotesService.findOne(id, user);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @ApiOperation({ summary: 'Nhân viên định giá từng dòng / đổi trạng thái' })
  update(@Param('id') id: string, @Body() dto: UpdateQuoteDto, @CurrentUser() user: AuthUser) {
    return this.quotesService.update(id, dto, user);
  }

  @Post(':id/convert')
  @ApiBearerAuth()
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @ApiOperation({ summary: 'Chuyển báo giá đã chốt thành đơn hàng' })
  convert(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.quotesService.convertToOrder(id, user);
  }
}
