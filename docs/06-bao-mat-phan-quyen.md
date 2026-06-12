# 06 — Bảo mật & phân quyền

## 1. Mô hình phân quyền (RBAC)

4 vai trò: `GUEST` (không đăng nhập) · `DEALER` · `STAFF` · `ADMIN`. Triển khai bằng `@Roles()` decorator + `RolesGuard` toàn cục (NestJS); route công khai đánh dấu `@Public()` nhưng vẫn nhận diện user nếu có token (để lộ giá đúng mức).

### Ma trận quyền

| Chức năng | GUEST | DEALER | STAFF | ADMIN |
|---|:--:|:--:|:--:|:--:|
| Xem sản phẩm / tin tức | ✅ | ✅ | ✅ | ✅ |
| Xem giá bán lẻ tham khảo | Theo `isPriceVisible` | ✅ | ✅ | ✅ |
| Xem giá bậc số lượng + chiết khấu riêng | ❌ | ✅ | ✅ | ✅ |
| Gửi yêu cầu báo giá / liên hệ | ✅ | ✅ | ✅ | ✅ |
| Đặt hàng, xem lịch sử đơn & công nợ của mình | ❌ | ✅ | — | — |
| Xử lý báo giá (định giá, gửi PDF, chuyển đơn) | ❌ | ❌ | ✅ | ✅ |
| Quản lý đơn hàng (chuyển trạng thái, thanh toán, chuyến xe) | ❌ | ❌ | ✅ | ✅ |
| Quản lý kho, lô thu hoạch | ❌ | ❌ | ✅ | ✅ |
| Quản lý khách hàng + CRM + công nợ | ❌ | ❌ | ✅ | ✅ |
| Quản lý sản phẩm, giá, mùa vụ, CMS | ❌ | ❌ | ✅* | ✅ |
| Báo cáo doanh thu | ❌ | ❌ | 👁 xem | ✅ |
| Quản lý người dùng, phân quyền, settings, log | ❌ | ❌ | ❌ | ✅ |
| Duyệt tài khoản đại lý mới | ❌ | ❌ | ✅ | ✅ |

\* Tùy chính sách, có thể thu hẹp quyền sửa giá của STAFF bằng bảng `permissions` chi tiết (GĐ2 — schema đã chừa chỗ qua RBAC theo role; nâng cấp lên permission-based khi cần).

**Quy tắc dữ liệu hàng ngang (row-level)**: DEALER chỉ truy cập được `quotes/orders/payments` có `customerId` trùng với hồ sơ của mình — kiểm tra trong service, không tin tham số client.

## 2. Xác thực

| Cơ chế | Thiết kế |
|---|---|
| Mật khẩu | `bcrypt` cost 12; chính sách ≥ 8 ký tự có chữ + số; khóa 15' sau 5 lần sai (đếm trong Redis) |
| Access token | JWT HS256, hạn **15 phút**, payload tối thiểu: `sub`, `role`, `customerId` |
| Refresh token | Hạn 7 ngày, lưu **cookie httpOnly + Secure + SameSite=Lax**; DB chỉ lưu **hash** của token; **xoay vòng** mỗi lần dùng; phát hiện dùng lại → thu hồi cả chuỗi |
| 2FA Admin | TOTP (Google Authenticator) — **bắt buộc** với ADMIN, tùy chọn với STAFF |
| OAuth Google | Cho đại lý đăng ký nhanh (GĐ2); vẫn phải bổ sung hồ sơ công ty + chờ duyệt |
| Duyệt đại lý | Tài khoản mới = `PENDING` → staff xác minh (gọi điện/MST) → `ACTIVE` mới thấy giá sỉ |

## 3. Bảo vệ tầng ứng dụng

- **HTTPS** toàn bộ (Cloudflare Full Strict + Let's Encrypt tại Nginx); HSTS.
- **Helmet**: CSP, X-Frame-Options, nosniff…
- **CORS**: whitelist domain frontend chính thức.
- **CSRF**: API dùng Bearer token nên miễn nhiễm CSRF cổ điển; riêng endpoint `/auth/refresh` dựa cookie → bảo vệ bằng SameSite=Lax + kiểm tra `Origin`.
- **Rate limit**: Throttler + Redis — mặc định 100 req/phút/IP; `auth/*`, `quotes`, `contacts`: 5–10 req/phút; chặn brute-force.
- **Validation đầu vào**: `class-validator` + `whitelist: true, forbidNonWhitelisted: true`; Prisma tham số hóa → chống SQL injection; sanitize HTML rich-text (DOMPurify phía render).
- **Upload**: kiểm MIME + đuôi + dung lượng; ảnh qua Cloudinary; file PDF vào S3 bucket riêng, link ký hạn (signed URL) cho chứng nhận nội bộ.
- **Secrets**: chỉ qua biến môi trường / GitHub Actions Secrets; không commit `.env` (đã ignore).

## 4. Audit & giám sát

- `activity_logs`: mọi thao tác ghi (ai, hành động, entity, dữ liệu trước/sau, IP, user-agent) — đặc biệt: sửa giá, duyệt đại lý, chuyển trạng thái đơn, điều chỉnh kho, xóa nội dung.
- Log ứng dụng JSON (pino) → tập trung (Loki/CloudWatch); cảnh báo lỗi qua Telegram.
- Đăng nhập admin từ IP lạ → thông báo Telegram/email.

## 5. Sao lưu & khôi phục

| Hạng mục | Chính sách |
|---|---|
| PostgreSQL | `pg_dump` hằng đêm (cron) → đẩy lên S3 bucket riêng, mã hóa, giữ 30 bản; thử khôi phục mỗi tháng |
| File S3/MinIO | Versioning + replicate sang region/nhà cung cấp thứ 2 |
| Mã nguồn | GitHub (private) |
| RPO / RTO | Mất tối đa 24h dữ liệu / khôi phục trong 4h |

## 6. Tuân thủ dữ liệu

- Dữ liệu khách (MST, SĐT, công nợ) chỉ STAFF/ADMIN xem; không bán/chia sẻ.
- Nghị định 13/2023/NĐ-CP (bảo vệ dữ liệu cá nhân): có trang chính sách quyền riêng tư, cho phép khách yêu cầu xóa dữ liệu liên hệ.
