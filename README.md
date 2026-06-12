# 🍊 Nhà Vườn Sơn La — Website bán sỉ nông sản B2B

Nền tảng thương mại **B2B (bán buôn/bán sỉ)** cho nhà vườn tại Sơn La. Khác với website bán lẻ thông thường, hệ thống xoay quanh **yêu cầu báo giá → báo giá → chốt đơn → thu hoạch → giao hàng xe tải/container**, với giá thay đổi theo **mùa vụ** và **bậc số lượng**, hỗ trợ **công nợ** và **đặt cọc trước mùa vụ**.

## Đối tượng khách hàng

Đại lý · Cửa hàng trái cây · Siêu thị · Thương lái · Chợ đầu mối · Nhà hàng · Công ty xuất khẩu

## Đặc thù nghiệp vụ (khác bán lẻ)

| Đặc thù | Cách hệ thống xử lý |
|---|---|
| Giá thay đổi theo mùa | Bảng `fruit_seasons` + giá cập nhật theo mùa vụ |
| Giá theo số lượng (10kg → 1 tấn) | Bảng `product_price_tiers` — giá bậc thang tự động |
| Ẩn giá với khách lẻ | Cờ `isPriceVisible` — khách vãng lai thấy "Liên hệ báo giá" |
| Báo giá riêng | Luồng Quote: khách gửi yêu cầu → nhân viên báo giá (PDF) |
| Đặt trước / đặt cọc mùa vụ | Đơn hàng `PRE_ORDER` gắn mùa vụ + thanh toán `DEPOSIT` |
| Thanh toán sau (công nợ) | `creditLimit`, `currentDebt`, `paymentTermDays` theo khách |
| Giao xe tải/container | `shipments`: biển số, tài xế, km, chi phí, trạng thái |
| Truy xuất nguồn gốc | Lô thu hoạch `harvest_batches` gắn vào từng dòng đơn |

## Tài liệu thiết kế

| Tài liệu | Nội dung |
|---|---|
| [01 — Phân tích yêu cầu](docs/01-phan-tich-yeu-cau.md) | Mục tiêu, đối tượng, user story, phạm vi |
| [02 — Kiến trúc hệ thống](docs/02-kien-truc-he-thong.md) | Sơ đồ kiến trúc, tech stack, monorepo |
| [03 — Thiết kế CSDL](docs/03-thiet-ke-co-so-du-lieu.md) | ERD, mô tả bảng, quyết định thiết kế |
| [04 — Thiết kế API](docs/04-thiet-ke-api.md) | Chuẩn REST, danh sách endpoint, ví dụ |
| [05 — Thiết kế giao diện](docs/05-thiet-ke-giao-dien.md) | Sitemap, wireframe, design system |
| [06 — Bảo mật & phân quyền](docs/06-bao-mat-phan-quyen.md) | RBAC, JWT, 2FA, rate limit, backup |
| [07 — Triển khai & vận hành](docs/07-trien-khai-van-hanh.md) | Docker, Nginx, CI/CD, monitoring |
| [08 — Lộ trình phát triển](docs/08-lo-trinh-phat-trien.md) | Các giai đoạn MVP → mở rộng |

## Cấu trúc dự án

```
NhavuonSonLa/
├── docs/                  # Tài liệu thiết kế (08 tài liệu)
├── apps/
│   ├── api/               # Backend NestJS + Prisma (PostgreSQL)
│   │   ├── prisma/        #   schema.prisma (toàn bộ CSDL) + seed
│   │   └── src/           #   auth, products, quotes, orders, dashboard...
│   └── web/               # Frontend Next.js (App Router) + Tailwind CSS
│       └── src/
│           ├── app/       #   Trang chủ, sản phẩm, báo giá, tin tức...
│           ├── components/
│           └── lib/       #   API client, giỏ báo giá, dữ liệu mẫu
├── docker-compose.yml     # PostgreSQL + Redis + MinIO (dev)
└── .env.example
```

## Khởi chạy nhanh (dev)

```bash
# 1. Hạ tầng: PostgreSQL + Redis + MinIO
docker compose up -d

# 2. Cài đặt
pnpm install
cp .env.example .env          # sửa biến môi trường nếu cần
cp .env.example apps/api/.env

# 3. Khởi tạo CSDL + dữ liệu mẫu
pnpm prisma:generate
pnpm prisma:migrate           # prisma migrate dev
pnpm prisma:seed

# 4. Chạy ứng dụng
pnpm dev:api                  # API:  http://localhost:3001  (Swagger: /docs)
pnpm dev:web                  # Web:  http://localhost:3000

# (Tùy chọn) Smoke test 43 bước toàn luồng nghiệp vụ trên CSDL vừa seed:
node apps/api/test/smoke.e2e.mjs
```

> Frontend tự fallback về dữ liệu mẫu (`apps/web/src/lib/mock-data.ts`) khi API chưa chạy — có thể xem demo giao diện chỉ với `pnpm dev:web`.

Tài khoản mẫu sau khi seed:

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@nhavuonsonla.vn` | `Admin@123` |
| Nhân viên | `nhanvien@nhavuonsonla.vn` | `Staff@123` |
| Đại lý | `daily@example.com` | `Dealer@123` |

## Công nghệ

**Frontend**: Next.js 15 · React 19 · TypeScript · Tailwind CSS — **Backend**: NestJS 11 · Prisma · PostgreSQL 16 · Redis — **Hạ tầng**: Docker · Nginx · GitHub Actions · MinIO/S3 · Cloudinary

> Lưu ý: sản phẩm mẫu trong seed dùng đặc sản thật của Sơn La (xoài Yên Châu, nhãn Sông Mã, mận hậu Mộc Châu, dâu tây, chanh leo, na Mai Sơn…) — quản trị viên có thể thêm danh mục bất kỳ (bưởi, cam, sầu riêng…) trong trang quản trị.
