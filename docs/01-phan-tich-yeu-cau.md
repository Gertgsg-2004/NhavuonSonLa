# 01 — Phân tích yêu cầu

## 1. Mục tiêu dự án

Xây dựng website cho **Nhà Vườn Sơn La** phục vụ **bán buôn nông sản (B2B)**:

- Giới thiệu nhà vườn, vùng trồng, chứng nhận chất lượng → tạo uy tín với đối tác.
- Trưng bày sản phẩm theo **mùa vụ** với **giá bậc thang theo số lượng**.
- Tiếp nhận **yêu cầu báo giá** và **đặt hàng trước** thay vì "mua ngay" như bán lẻ.
- Quản trị toàn bộ vận hành: báo giá → đơn hàng → thu hoạch → kho → giao hàng → công nợ → báo cáo.
- Chuẩn SEO để tiếp cận khách tìm kiếm "mua sỉ xoài Sơn La", "nhãn Sông Mã xuất khẩu"…

**Không phải mục tiêu (Non-goals)**: giỏ hàng thanh toán tức thì kiểu B2C, chương trình điểm thưởng, sàn nhiều người bán (marketplace).

## 2. Đối tượng người dùng & vai trò

### 2.1. Khách hàng mục tiêu (7 nhóm)

| Nhóm | Nhu cầu chính | Khối lượng điển hình |
|---|---|---|
| Đại lý | Giá sỉ ổn định, công nợ, nguồn hàng đều | 100kg – 1 tấn/đơn |
| Cửa hàng trái cây | Hàng tươi, đơn nhỏ thường xuyên | 50 – 200kg/đơn |
| Siêu thị | Tiêu chuẩn VietGAP/GlobalGAP, hồ sơ pháp lý, hợp đồng | 500kg – vài tấn |
| Thương lái | Giá theo thời điểm, gom số lượng lớn nhanh | 1 – 10 tấn |
| Chợ đầu mối | Giá cạnh tranh, giao đêm/sớm | 1 – 5 tấn |
| Nhà hàng | Chất lượng chọn lọc, giao định kỳ | 20 – 100kg/tuần |
| Công ty xuất khẩu | GlobalGAP/Organic, truy xuất nguồn gốc, container | Theo container |

### 2.2. Vai trò hệ thống (4 loại tài khoản)

| Vai trò | Đăng nhập | Quyền chính |
|---|---|---|
| **Khách (Guest)** | Không cần | Xem sản phẩm (giá có thể bị ẩn), gửi yêu cầu báo giá, liên hệ |
| **Đại lý (Dealer)** | Đăng ký + admin duyệt | Xem giá sỉ/bậc số lượng, đặt hàng, lịch sử đơn & báo giá, công nợ |
| **Nhân viên (Staff)** | Admin cấp | Xử lý báo giá, quản lý đơn hàng, kho, khách hàng |
| **Admin** | — | Toàn quyền: sản phẩm, CMS, người dùng, cấu hình, báo cáo, 2FA bắt buộc |

## 3. Đặc thù nghiệp vụ B2B nông sản

1. **Giá theo mùa** — mỗi sản phẩm có mùa vụ (`fruit_seasons`); ngoài mùa hiển thị "Hết mùa — đặt trước vụ sau".
2. **Giá theo bậc số lượng** — ví dụ xoài: 10kg = 35.000đ/kg, 50kg = 32.000đ, 100kg = 30.000đ, 500kg = 27.000đ, 1 tấn = 25.000đ.
3. **Ẩn giá khách lẻ** — sản phẩm có thể đặt `isPriceVisible = false`: khách vãng lai chỉ thấy "Liên hệ báo giá"; đại lý đăng nhập thấy đủ bảng giá.
4. **Báo giá riêng** — nhân viên điều chỉnh đơn giá từng khách (chiết khấu riêng theo `customer.discountRate`), xuất PDF báo giá có logo.
5. **Đặt trước / đặt cọc mùa vụ** — khách sỉ giữ nguồn hàng trước vụ bằng đơn `PRE_ORDER` + tiền cọc.
6. **Thanh toán sau (công nợ)** — hạn mức `creditLimit`, số ngày nợ `paymentTermDays`, theo dõi `currentDebt`.
7. **Giao hàng xe tải/container** — không tích hợp GHN/GHTK kiểu B2C; quản lý chuyến xe: biển số, tài xế, quãng đường, chi phí theo km.
8. **Truy xuất nguồn gốc** — mỗi lô thu hoạch (`harvest_batches`) có mã lô, ngày hái, vùng trồng; gắn lô vào dòng đơn hàng.

## 4. User stories chính

### Khách vãng lai
- *Là* chủ cửa hàng trái cây, *tôi muốn* lọc sản phẩm đang vào mùa theo vùng trồng và tiêu chuẩn, *để* chọn nguồn hàng phù hợp.
- *Tôi muốn* thêm nhiều sản phẩm + khối lượng vào **giỏ báo giá** và gửi 1 yêu cầu duy nhất kèm thông tin công ty.

### Đại lý
- *Tôi muốn* thấy ngay giá bậc thang và chiết khấu riêng của mình khi đăng nhập.
- *Tôi muốn* đặt trước 2 tấn xoài giao ngày 15/6 tại chợ đầu mối Long Biên, chọn thanh toán công nợ 15 ngày.
- *Tôi muốn* xem lịch sử đơn, trạng thái đơn đang giao và công nợ hiện tại.
- *Tôi muốn* đặt cọc giữ 5 tấn nhãn trước vụ tháng 8.

### Nhân viên
- *Tôi muốn* nhận thông báo (email/Zalo) khi có yêu cầu báo giá mới, điền đơn giá từng dòng rồi gửi PDF cho khách.
- *Tôi muốn* chuyển trạng thái đơn theo đúng quy trình và hệ thống tự trừ kho khi xuất hàng.

### Admin
- *Tôi muốn* cập nhật giá theo mùa cho hàng loạt sản phẩm.
- *Tôi muốn* xem dashboard: doanh thu tháng, đơn mới, top khách, top sản phẩm, tồn kho sắp hết.

## 5. Luồng nghiệp vụ trung tâm

```
Khách xem sản phẩm
   │  (thêm SP + khối lượng vào giỏ báo giá)
   ▼
Gửi YÊU CẦU BÁO GIÁ ──────────────► Quote: PENDING
   │   Nhân viên định giá từng dòng, đặt hạn hiệu lực, xuất PDF
   ▼
Quote: QUOTED ──(khách đồng ý)──► Quote: ACCEPTED ──► Chuyển thành ĐƠN HÀNG
                                                          │
   NEW → QUOTED → CONFIRMED → HARVESTING → PACKING → SHIPPING → COMPLETED
                     │ (đặt cọc/ghi nhận thanh toán, gắn lô hàng, lên chuyến xe)
                     └────────────────► CANCELLED (kèm lý do, hoàn cọc nếu có)
```

## 6. Yêu cầu phi chức năng

| Hạng mục | Yêu cầu |
|---|---|
| Hiệu năng | Trang danh mục < 1s (cache Redis + ISR Next.js); chịu được mùa cao điểm |
| SEO | SSR/SSG, schema.org Product/Organization, sitemap, URL tiếng Việt không dấu |
| Bảo mật | JWT + refresh rotation, bcrypt, 2FA admin, rate limit, HTTPS, audit log |
| Sẵn sàng | Backup CSDL hằng ngày, khôi phục ≤ 4h |
| Thiết bị | Responsive — thương lái chủ yếu dùng điện thoại |
| Ngôn ngữ | Tiếng Việt (giai đoạn sau: tiếng Anh + tiếng Trung cho khách xuất khẩu) |

## 7. Phạm vi từng giai đoạn

Xem chi tiết tại [08 — Lộ trình phát triển](08-lo-trinh-phat-trien.md). Tóm tắt:

- **GĐ1 (MVP)**: website giới thiệu + danh mục sản phẩm + giỏ báo giá + form liên hệ + quản trị sản phẩm/báo giá cơ bản.
- **GĐ2**: tài khoản đại lý, giá bậc thang theo vai trò, đơn hàng + trạng thái, kho + lô hàng.
- **GĐ3**: thanh toán online (VNPay/MoMo/ZaloPay), vận chuyển, thông báo đa kênh (Zalo OA/SMS), công nợ, báo cáo.
- **GĐ4**: đặt cọc mùa vụ, CRM, đa ngôn ngữ, ứng dụng nội bộ cho đội thu hoạch.
