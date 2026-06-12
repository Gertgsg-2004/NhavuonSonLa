import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '@prisma/client';

/** Payload đã xác thực gắn vào request (từ JwtStrategy.validate) */
export interface AuthUser {
  id: string;
  role: UserRole;
  customerId: string | null;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | undefined =>
    ctx.switchToHttp().getRequest().user,
);
