import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('admin/dashboard')
@ApiBearerAuth()
@Roles(UserRole.STAFF, UserRole.ADMIN)
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  summary() {
    return this.dashboardService.summary();
  }

  @Get('revenue')
  revenue(@Query('year') year?: string) {
    const y = Number(year) || new Date().getFullYear();
    return this.dashboardService.revenueByMonth(y);
  }

  @Get('top-products')
  topProducts() {
    return this.dashboardService.topProducts();
  }

  @Get('top-customers')
  topCustomers() {
    return this.dashboardService.topCustomers();
  }
}
