# 08 — Lộ trình phát triển

> Nguyên tắc: **ra mắt sớm với luồng báo giá hoạt động thật** (giá trị kinh doanh cốt lõi), sau đó bồi đắp vận hành nội bộ, cuối cùng mới đến tự động hóa nâng cao. Mỗi giai đoạn đều ra sản phẩm dùng được.

## Giai đoạn 1 — MVP "Catalog + Báo giá" (4–6 tuần)

**Mục tiêu**: có website chuyên nghiệp nhận yêu cầu báo giá thay cho Zalo/giấy tờ.

| Hạng mục | Phạm vi |
|---|---|
| Trang công khai | Trang chủ (9 khối), danh mục + bộ lọc, chi tiết SP (bảng giá bậc, ẩn giá khách lẻ), mùa vụ, tin tức, giới thiệu, liên hệ |
| Giỏ báo giá | Thêm SP + khối lượng → gửi yêu cầu (không cần đăng nhập) |
| Backend | Auth (admin/staff), Product/Category/Quote/Contact API, upload ảnh |
| Quản trị | Swagger + seed; CRUD sản phẩm, xử lý báo giá ở mức API (UI admin sang GĐ2) |
| Thông báo | Email cho nhà vườn khi có báo giá/liên hệ mới |
| SEO | Meta, JSON-LD, sitemap, robots — đầy đủ từ đầu |
| Hạ tầng | VPS + Docker + CI/CD + backup + HTTPS |

**Tiêu chí nghiệm thu**: khách gửi được yêu cầu báo giá từ điện thoại < 2 phút; nhà vườn nhận email trong 1 phút; Lighthouse SEO ≥ 90.

## Giai đoạn 2 — Tài khoản đại lý & vận hành đơn hàng (4–6 tuần)

- Đăng ký đại lý + quy trình duyệt; đăng nhập thấy **giá bậc + chiết khấu riêng**.
- Admin UI (Next.js `/quan-tri`): dashboard, bàn báo giá (điền giá, **xuất PDF báo giá** có logo), đơn hàng với **máy trạng thái 8 bước**, CRUD sản phẩm/danh mục/CMS.
- Kho cơ bản: nhập **lô thu hoạch**, tồn kho, giữ chỗ khi xác nhận đơn, trừ kho khi giao, cảnh báo sắp hết.
- Khu vực đại lý `/tai-khoan`: đơn hàng (timeline), báo giá, hồ sơ.
- Khách hàng + CRM: hồ sơ, MST, ghi chú, lịch sử mua.

## Giai đoạn 3 — Thanh toán, công nợ & thông báo đa kênh (4–5 tuần)

- Ghi nhận thanh toán: COD/chuyển khoản (đối soát tay) + **VNPay → MoMo → ZaloPay** (cổng online cho đặt cọc).
- **Công nợ**: hạn mức, tuổi nợ, nhắc nợ tự động; chặn đơn vượt hạn mức (cảnh báo staff).
- Vận chuyển: chuyến xe tải/container, chi phí theo km, trạng thái giao, thông báo cho khách.
- Thông báo đa kênh qua queue: **Zalo OA** (ZNS), SMS, Telegram nội bộ, Web Push; realtime Socket.IO cho admin.
- Báo cáo: doanh thu theo tháng/sản phẩm/khách/vùng/mùa; top khách, top sản phẩm; xuất Excel.

## Giai đoạn 4 — Mùa vụ nâng cao & tăng trưởng (liên tục)

- **Đặt cọc trước mùa vụ** (PRE_ORDER + cọc online), lịch gieo trồng – dự kiến thu hoạch – sản lượng ước tính; báo cáo **kế hoạch vs thực tế** từng vụ.
- Truy xuất nguồn gốc công khai: quét QR trên thùng hàng → trang lô hàng (vùng trồng, ngày hái, chứng nhận).
- CRM nâng cao: phân hạng khách, chính sách giá theo nhóm, nhắc mùa vụ cho khách quen.
- Đa ngôn ngữ (EN/中文) cho khách xuất khẩu; OAuth Google; 2FA staff.
- Ứng dụng nội bộ (PWA) cho đội thu hoạch: nhập lô bằng điện thoại ngay tại vườn.

## Phân công & ước lượng tham khảo

| Vai trò | GĐ1 | GĐ2 | GĐ3 |
|---|---|---|---|
| Fullstack dev | 1–2 người | 2 người | 2 người |
| Thiết kế UI | 0.5 (theo design system có sẵn) | 0.5 | — |
| Nội dung/SEO | 1 (bài viết, ảnh, mô tả SP) | 0.5 | 0.5 |

**Việc cần phía nhà vườn chuẩn bị ngay từ GĐ1**: ảnh/video chất lượng từng sản phẩm và vùng trồng · bảng giá bậc theo mùa hiện tại · bản scan chứng nhận VietGAP/GlobalGAP · danh sách 7 nhóm khách mẫu để phỏng vấn nhanh · nội dung giới thiệu + quy trình thu hoạch.

## Rủi ro & ứng phó

| Rủi ro | Ứng phó |
|---|---|
| Giá biến động từng ngày trong vụ → admin cập nhật không kịp | Màn hình "cập nhật giá nhanh" theo danh mục; cho phép đặt giá hiệu lực theo khoảng ngày |
| Khách quen vẫn gọi điện/Zalo thay vì dùng web | Staff tạo hộ báo giá/đơn ngay trong admin — dữ liệu vẫn tập trung |
| Sóng yếu tại vườn khi nhập lô | PWA offline-first cho form nhập lô (GĐ4) |
| Tồn kho nông sản hao hụt tự nhiên | Loại điều chỉnh `DAMAGE/ADJUSTMENT` + kiểm kê định kỳ |
