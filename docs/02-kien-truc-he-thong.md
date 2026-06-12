# 02 — Kiến trúc hệ thống

## 1. Sơ đồ tổng thể

```
                         Internet
                            │
                            ▼
                      ┌───────────┐
                      │ Cloudflare │  DNS · CDN · WAF · chống DDoS
                      └─────┬─────┘
                            ▼
                      ┌───────────┐
                      │   Nginx    │  Reverse proxy · SSL · gzip · static cache
                      └─────┬─────┘
              ┌─────────────┴──────────────┐
              ▼                            ▼
   ┌─────────────────────┐      ┌─────────────────────┐
   │  Next.js (Frontend)  │      │  NestJS (Backend)    │
   │  SSR/ISR · SEO       │─────►│  REST API /api/v1    │
   │  cổng 3000           │ REST │  Swagger /docs       │
   └─────────────────────┘      │  cổng 3001           │
                                 └──────────┬──────────┘
          ┌──────────────┬──────────────────┼────────────────┬───────────────┐
          ▼              ▼                  ▼                ▼               ▼
   ┌────────────┐ ┌────────────┐  ┌──────────────┐  ┌─────────────┐ ┌──────────────┐
   │ PostgreSQL │ │   Redis    │  │  MinIO / S3   │  │ Cloudinary  │ │ SMTP·Zalo OA │
   │ (Prisma)   │ │ cache·queue│  │ file PDF, CN  │  │ ảnh sản phẩm│ │ SMS·Telegram │
   └────────────┘ └────────────┘  └──────────────┘  └─────────────┘ └──────────────┘
```

- **Socket.IO** (giai đoạn 3): kênh realtime từ NestJS → trình duyệt admin (đơn mới, báo giá mới).
- **Hàng đợi (BullMQ trên Redis)**: gửi email/Zalo/SMS, sinh PDF báo giá, xuất báo cáo — không chặn request.

## 2. Tech stack & lý do chọn

| Tầng | Công nghệ | Lý do |
|---|---|---|
| Frontend | **Next.js 15 (App Router) + React 19 + TypeScript** | SSR/ISR cho SEO; React Server Components giảm JS; hệ sinh thái lớn |
| UI | **Tailwind CSS + shadcn/ui** | Dựng nhanh, đồng nhất; shadcn copy-in dễ tùy biến thương hiệu |
| Data fetching | **React Query** | Cache phía client cho khu vực đại lý/admin |
| Form & validate | **React Hook Form + Zod** | Schema dùng chung FE/BE, an toàn kiểu |
| Backend | **NestJS 11 + TypeScript** | Kiến trúc module rõ ràng, DI, guard/interceptor, Swagger tích hợp |
| ORM | **Prisma** | Schema declarative, migration an toàn, type-safe |
| CSDL | **PostgreSQL 16** | Giao dịch ACID (đơn hàng, kho, công nợ), JSON, full-text search |
| Cache | **Redis 7** | Cache danh mục/giá, session refresh token, BullMQ queue, rate limit |
| Ảnh | **Cloudinary** | Resize/optimize tự động, CDN |
| Tệp | **MinIO (dev) / AWS S3 (prod)** | PDF báo giá, chứng nhận VietGAP/GlobalGAP |
| Auth | **JWT access (15') + refresh rotation (7d) + OAuth Google** | Chuẩn SPA/API; refresh đặt trong cookie httpOnly |
| Realtime | **Socket.IO** | Thông báo admin tức thời |
| Triển khai | **Docker + Nginx + GitHub Actions → VPS/Cloud** | CI/CD tự động, dễ scale ngang |

## 3. Monorepo

```
NhavuonSonLa/
├── apps/
│   ├── api/                        # NestJS
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Toàn bộ thiết kế CSDL (≈30 bảng)
│   │   │   └── seed.ts             # Dữ liệu mẫu: user, SP Sơn La, giá bậc, mùa vụ
│   │   └── src/
│   │       ├── main.ts             # helmet, CORS, validation, swagger
│   │       ├── app.module.ts
│   │       ├── prisma/             # PrismaService (kết nối CSDL)
│   │       ├── common/             # decorators, guards (JWT, Roles), DTO chung
│   │       ├── auth/               # đăng ký đại lý, login, refresh, me
│   │       ├── products/           # danh mục + sản phẩm + giá bậc + ẩn giá
│   │       ├── quotes/             # yêu cầu báo giá → báo giá → chuyển đơn
│   │       ├── orders/             # đơn hàng + máy trạng thái + thanh toán
│   │       └── dashboard/          # số liệu tổng quan admin
│   └── web/                        # Next.js
│       └── src/
│           ├── app/                # (Xem docs/05) trang chủ, sản phẩm, báo giá…
│           ├── components/         # header, footer, product-card, bảng giá bậc…
│           └── lib/                # api client, giỏ báo giá (localStorage), mock
├── docs/                           # 08 tài liệu thiết kế
├── docker-compose.yml              # postgres + redis + minio
└── .github/workflows/ci.yml       # typecheck + build
```

**Nguyên tắc phân tầng backend**: Controller (HTTP, validate DTO) → Service (nghiệp vụ, transaction) → Prisma (dữ liệu). Mọi quy tắc nghiệp vụ (giá bậc, máy trạng thái đơn, trừ kho) nằm ở Service — không ở Controller, không ở frontend.

## 4. Các luồng dữ liệu quan trọng

### 4.1. Hiển thị giá theo vai trò (quy tắc trung tâm)

```
GET /products/:slug  (kèm access token nếu có)
  → ProductsService.serialize(product, user?)
      1. Khách vãng lai  + isPriceVisible=false → ẩn mọi giá, trả priceOnRequest=true
      2. Khách vãng lai  + isPriceVisible=true  → chỉ retailPrice (giá tham khảo)
      3. Đại lý          → retailPrice + bảng priceTiers + chiết khấu riêng (%)
      4. Staff/Admin     → tất cả (kèm giá vốn nếu khai báo)
```

### 4.2. Tính đơn giá khi báo giá/đặt hàng

```
resolvePrice(product, quantityKg, customer?):
  tier  = bậc có minQuantity lớn nhất mà minQuantity ≤ quantityKg
  price = tier?.price ?? product.wholesalePrice ?? product.retailPrice
  nếu customer.discountRate > 0 → price = price × (1 − discountRate/100)
  → làm tròn 100đ
```

### 4.3. Máy trạng thái đơn hàng (cố định, có log lịch sử)

```
NEW → QUOTED → CONFIRMED → HARVESTING → PACKING → SHIPPING → COMPLETED
 └──────┴─────────┴────────────┴───────────┴──────────┴──► CANCELLED
```
- Mỗi lần chuyển: ghi `order_status_history` (ai, lúc nào, ghi chú).
- `CONFIRMED` → giữ chỗ tồn kho (`reservedQuantity`); `SHIPPING` → trừ kho thật + ghi `inventory_logs`; `CANCELLED` → hoàn giữ chỗ.
- `COMPLETED` → cộng doanh thu, cập nhật công nợ khách nếu chưa thanh toán đủ.

### 4.4. Cache

| Dữ liệu | Cache | TTL / invalidate |
|---|---|---|
| Danh mục, settings, banner | Redis + ISR Next.js | 5–15 phút; xóa khi admin sửa |
| Danh sách sản phẩm (lọc phổ biến) | Redis theo khóa query | 60s |
| Trang tin tức, giới thiệu | ISR (revalidate 300s) | Webhook revalidate khi CMS sửa |
| Giá + tồn kho cho đại lý | Không cache (luôn tươi) | — |

## 5. Quy mô & mở rộng

- Bắt đầu: 1 VPS 4 vCPU/8GB chạy toàn bộ stack qua Docker Compose là đủ (lượng truy cập B2B không lớn, giá trị mỗi đơn cao).
- Khi tăng trưởng: tách CSDL sang managed PostgreSQL → đưa web lên Vercel hoặc thêm node sau Nginx → tách worker queue riêng.
