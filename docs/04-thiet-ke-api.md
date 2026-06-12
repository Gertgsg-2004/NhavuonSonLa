# 04 — Thiết kế API

## 1. Chuẩn chung

- Base URL: `https://api.nhavuonsonla.vn/api/v1` — tài liệu tương tác: **Swagger tại `/docs`**.
- Xác thực: `Authorization: Bearer <access_token>` (JWT 15 phút). Refresh token đặt trong **cookie httpOnly** `refresh_token`, xoay vòng mỗi lần refresh.
- Phân trang: `?page=1&limit=20` → phản hồi dạng:

```json
{ "data": [...], "meta": { "page": 1, "limit": 20, "total": 132, "totalPages": 7 } }
```

- Lỗi thống nhất:

```json
{ "statusCode": 422, "message": ["quantity phải lớn hơn 0"], "error": "Unprocessable Entity" }
```

- Quyền trong bảng: 🌐 công khai · 🔑 đăng nhập · 🏪 đại lý · 👔 staff/admin · 🛡️ admin.

## 2. Auth API

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/auth/register` | 🌐 | Đăng ký đại lý (tạo `customer` + `user` trạng thái PENDING chờ duyệt) |
| POST | `/auth/login` | 🌐 | Đăng nhập → access token + cookie refresh |
| POST | `/auth/refresh` | 🌐(cookie) | Cấp lại access token, xoay refresh |
| POST | `/auth/logout` | 🔑 | Hủy refresh token |
| GET | `/auth/me` | 🔑 | Thông tin tài khoản + hồ sơ khách hàng |
| POST | `/auth/2fa/enable` · `/auth/2fa/verify` | 🛡️ | Bật/xác minh TOTP cho admin |
| GET | `/auth/google` → callback | 🌐 | OAuth Google (giai đoạn 2) |

## 3. Product & Category API

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/categories` | 🌐 | Cây danh mục |
| GET | `/products` | 🌐* | Danh sách + bộ lọc (bảng dưới) |
| GET | `/products/:slug` | 🌐* | Chi tiết: ảnh, mùa vụ, chứng nhận, bảng giá bậc |
| GET | `/products/:slug/pricing?quantity=500` | 🌐* | Đơn giá áp dụng cho khối lượng (kèm chiết khấu nếu là đại lý) |
| GET | `/seasons/calendar?year=2026` | 🌐 | Lịch mùa vụ 12 tháng (trang Mùa vụ) |
| POST/PATCH/DELETE | `/admin/products…` | 👔 | CRUD + ẩn/hiện + sắp xếp; cập nhật bậc giá `PUT /admin/products/:id/price-tiers` |
| POST/PATCH/DELETE | `/admin/categories…` | 👔 | CRUD danh mục |

\* *Công khai nhưng "nhận biết người dùng": cùng endpoint, mức lộ giá phụ thuộc vai trò (xem docs/02 §4.1).*

**Bộ lọc `GET /products`**: `category` (slug) · `season` (tháng 1–12 hoặc `now`) · `region` (vùng trồng) · `certification` (VIETGAP/GLOBALGAP/ORGANIC) · `export=true` · `minPrice/maxPrice` (chỉ tác dụng khi được xem giá) · `search` · `featured=true` · `sort` (`newest|price_asc|price_desc|name`) · `page/limit`.

Ví dụ phản hồi cho **khách vãng lai** với sản phẩm ẩn giá:

```json
{
  "id": "…", "name": "Xoài tròn Yên Châu", "slug": "xoai-tron-yen-chau",
  "unit": "kg", "minOrderQuantity": 50,
  "priceOnRequest": true, "retailPrice": null, "priceTiers": [],
  "season": { "status": "HARVESTING", "label": "Tháng 5 – 8" },
  "certifications": ["VIETGAP"], "isExportQuality": true
}
```

Cùng sản phẩm khi **đại lý** đăng nhập:

```json
{
  "priceOnRequest": false, "retailPrice": "35000",
  "priceTiers": [
    { "minQuantity": "10",   "price": "35000", "label": "10kg trở lên" },
    { "minQuantity": "100",  "price": "30000", "label": "100kg trở lên" },
    { "minQuantity": "1000", "price": "25000", "label": "Từ 1 tấn" }
  ],
  "yourDiscountRate": "3.00"
}
```

## 4. Quote API (báo giá — trái tim của hệ thống)

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/quotes` | 🌐 | Gửi yêu cầu báo giá (giỏ báo giá): liên hệ + items[] |
| GET | `/quotes` | 🏪/👔 | Đại lý: của mình · Staff: tất cả, lọc theo `status`, `assignedTo` |
| GET | `/quotes/:id` | 🏪/👔 | Chi tiết |
| PATCH | `/quotes/:id` | 👔 | Điền đơn giá từng dòng, `validUntil`, ghi chú, đổi trạng thái |
| POST | `/quotes/:id/send` | 👔 | Sinh **PDF báo giá** (logo, thông tin công ty) + gửi email/Zalo |
| POST | `/quotes/:id/convert` | 👔 | Chuyển báo giá đã chốt thành đơn hàng |

`POST /quotes` — body:

```json
{
  "fullName": "Nguyễn Văn A", "companyName": "Cty TNHH Trái Cây Miền Bắc",
  "phone": "0912345678", "email": "a@traicay.vn",
  "note": "Cần giao tại chợ đầu mối Long Biên trước 5h sáng",
  "items": [
    { "productId": "…", "quantity": 500, "unit": "kg", "note": "Loại 1, size 3-4 quả/kg" },
    { "productId": "…", "quantity": 1000, "unit": "kg" }
  ]
}
```

## 5. Order API

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/orders` | 🏪/👔 | Tạo đơn (đại lý đặt trực tiếp hoặc staff tạo hộ); `type=PRE_ORDER` + `seasonId` cho đặt cọc vụ |
| GET | `/orders` | 🏪/👔 | Đại lý: đơn của mình · Staff: tất cả (lọc `status`, `customerId`, khoảng ngày) |
| GET | `/orders/:id` | 🏪/👔 | Chi tiết + lịch sử trạng thái + thanh toán + chuyến xe |
| PATCH | `/orders/:id/status` | 👔 | Chuyển trạng thái theo máy trạng thái; tự xử lý giữ chỗ/trừ kho |
| POST | `/orders/:id/payments` | 👔 | Ghi nhận thanh toán (cọc/một phần/đủ/trả nợ) → cập nhật công nợ |
| POST | `/orders/:id/shipment` | 👔 | Lên chuyến xe: biển số, tài xế, km, chi phí |
| PATCH | `/orders/:id/cancel` | 🏪/👔 | Hủy (đại lý chỉ hủy được khi ≤ CONFIRMED) |

`PATCH /orders/:id/status` trả 422 nếu chuyển sai luồng, ví dụ `NEW → SHIPPING`:

```json
{ "statusCode": 422, "message": ["Không thể chuyển từ NEW sang SHIPPING. Trạng thái hợp lệ tiếp theo: QUOTED, CONFIRMED, CANCELLED"] }
```

## 6. Các API khác

| Nhóm | Endpoints chính | Quyền |
|---|---|---|
| **Inventory** | `GET /admin/inventory` (tồn theo kho/lô, cờ sắp hết) · `POST /admin/inventory/harvest` (nhập lô thu hoạch) · `POST /admin/inventory/adjust` · `GET /admin/inventory/logs` | 👔 |
| **Customer** | `GET/POST/PATCH /admin/customers` · `GET /admin/customers/:id/debts` (công nợ) · `POST /admin/customers/:id/activities` (CRM) | 👔 |
| **Payment** | `POST /payments/vnpay/create` + `GET /payments/vnpay/callback` (tương tự MoMo/ZaloPay) — giai đoạn 3 | 🔑/🌐 |
| **News** | `GET /posts?category=mua-vu` · `GET /posts/:slug` · CRUD `/admin/posts` | 🌐/👔 |
| **CMS** | CRUD `/admin/banners`, `/admin/videos`, `/admin/reviews`(duyệt), `/admin/faqs`, `/admin/settings`, `/admin/gallery` · public: `GET /content/home` (gộp banner+nổi bật+review+post cho trang chủ, cache 5') | 🌐/👔 |
| **Upload** | `POST /admin/uploads/image` (Cloudinary) · `POST /admin/uploads/file` (S3 — PDF chứng nhận, báo giá) | 👔 |
| **Contact** | `POST /contacts` (form liên hệ) · `GET/PATCH /admin/contacts` | 🌐/👔 |
| **Notification** | `GET /notifications` (in-app) · `PATCH /notifications/:id/read` · worker gửi EMAIL/ZALO/SMS/TELEGRAM qua queue | 🔑 |
| **Dashboard** | `GET /admin/dashboard/summary` (doanh thu, đơn mới, đơn hôm nay, khách mới, tồn kho thấp) · `GET /admin/dashboard/revenue?year=` (12 tháng) · `GET /admin/dashboard/top-products` · `/top-customers` | 👔 |
| **Analytics** | `GET /admin/reports/revenue?groupBy=month|product|customer|region|season` · `GET /admin/reports/yield?seasonId=` (kế hoạch vs thực tế) · xuất `?format=xlsx` | 👔 |

## 7. Bảo vệ API

- **Rate limit** (Throttler + Redis): công khai 100 req/phút/IP; `POST /quotes`, `/contacts`, `/auth/*`: 5–10 req/phút/IP chống spam.
- **Validation**: mọi DTO qua `class-validator` (`whitelist: true` — loại field lạ).
- **Idempotency**: `POST /orders` chấp nhận header `Idempotency-Key` chống tạo trùng đơn khi mạng yếu.
- Webhook thanh toán: xác minh chữ ký (VNPay secure hash) trước khi ghi nhận.
