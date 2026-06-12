import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Route công khai — không bắt buộc đăng nhập, nhưng nếu request có token hợp lệ
 * thì user vẫn được gắn vào request (để hiển thị giá đúng theo vai trò).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
