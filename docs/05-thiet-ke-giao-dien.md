# 05 — Thiết kế giao diện (Frontend)

## 1. Sitemap

```
/                              Trang chủ
/san-pham                      Danh mục sản phẩm (bộ lọc: mùa, vùng, giá, tiêu chuẩn, xuất khẩu)
/san-pham/[slug]               Chi tiết sản phẩm + bảng giá bậc + thêm vào giỏ báo giá
/danh-muc/[slug]               Trang danh mục (lối tắt SEO của /san-pham?category=)
/mua-vu                        Lịch mùa vụ 12 tháng (sản phẩm nào đang/sắp vào vụ)
/bao-gia                       Giỏ báo giá → form gửi yêu cầu
/tin-tuc · /tin-tuc/[slug]     Tin tức (kỹ thuật trồng, mùa vụ, xuất khẩu, giá thị trường)
/gioi-thieu                    Nhà vườn, quy mô, hình ảnh, video, chứng nhận
/lien-he                       Form + Google Map + hotline/Zalo/Facebook
/dang-nhap · /dang-ky-dai-ly   Tài khoản
/tai-khoan/*                   Khu vực đại lý: đơn hàng, báo giá, công nợ, hồ sơ
/quan-tri/*                    Admin (GĐ1 dùng Swagger; GĐ2 xây UI — xem §6)
```

## 2. Trang chủ — thứ tự khối (theo spec)

| # | Khối | Nội dung |
|---|---|---|
| 1 | **Hero banner** | Ảnh vườn + thông điệp "Nguồn trái cây sỉ từ cao nguyên Sơn La" + 2 CTA: *Xem sản phẩm* / *Yêu cầu báo giá* |
| 2 | **USP strip** | 4 điểm mạnh: vùng trồng đạt chuẩn · giá sỉ tận vườn · giao xe tải/container toàn quốc · hỗ trợ hồ sơ xuất khẩu |
| 3 | **Sản phẩm nổi bật** | Grid 4–8 card (`isFeatured`) |
| 4 | **Hoa quả theo mùa** | Tự động theo tháng hiện tại: "Tháng 6 — đang rộ: Xoài, Mận hậu…" + link /mua-vu |
| 5 | **Quy trình thu hoạch** | 5 bước: Kiểm tra độ chín → Thu hái → Phân loại đóng gói → Kiểm định → Lên xe giao |
| 6 | **Video** | 1 video chính + 3 thumbnail (YouTube embed lazy-load) |
| 7 | **Khách hàng & đánh giá** | Logo đối tác + carousel cảm nhận (`reviews` đã duyệt) |
| 8 | **Tin tức mới** | 3 bài mới nhất |
| 9 | **CTA cuối trang** | "Cần báo giá số lượng lớn? Gửi yêu cầu — phản hồi trong 2 giờ làm việc" + hotline/Zalo |

## 3. Trang danh mục sản phẩm

- **Sidebar lọc** (mobile: bottom-sheet): danh mục · mùa (checkbox "Đang vào mùa" + chọn tháng) · vùng trồng (Yên Châu, Mộc Châu, Sông Mã…) · tiêu chuẩn (VietGAP/GlobalGAP/Organic) · "Đạt chuẩn xuất khẩu" · khoảng giá (chỉ hiện khi được xem giá).
- **Card sản phẩm**: ảnh · tên · vùng trồng · badge mùa (`Đang vào mùa` xanh / `Sắp vào vụ` vàng / `Hết mùa` xám) · badge tiêu chuẩn · **giá**: hiện `từ 25.000đ/kg` hoặc `Liên hệ báo giá` tùy quyền · nút *+ Thêm vào báo giá*.
- Bộ lọc đồng bộ lên URL (`?season=now&cert=VIETGAP`) để SEO + chia sẻ được.

## 4. Trang chi tiết sản phẩm (quan trọng nhất)

```
┌────────────────────────────┬──────────────────────────────────┐
│ Gallery ảnh + video         │ Tên SP · vùng trồng · mã SP       │
│ (ảnh lớn + thumbnails)      │ Badge: VietGAP · Xuất khẩu        │
│                             │ Mùa vụ: Tháng 5–8 (đang rộ)       │
│                             │ ┌──────────────────────────────┐ │
│                             │ │ BẢNG GIÁ THEO SỐ LƯỢNG        │ │
│                             │ │ 10kg+    35.000đ/kg           │ │
│                             │ │ 50kg+    32.000đ/kg           │ │
│                             │ │ 100kg+   30.000đ/kg           │ │
│                             │ │ 500kg+   27.000đ/kg           │ │
│                             │ │ 1 tấn+   25.000đ/kg           │ │
│                             │ │ (khách lẻ: "Liên hệ báo giá") │ │
│                             │ └──────────────────────────────┘ │
│                             │ [Khối lượng: 500 kg ▾] → tạm tính │
│                             │ [+ Thêm vào yêu cầu báo giá]      │
│                             │ [Đặt trước vụ này] · Zalo/Hotline │
├────────────────────────────┴──────────────────────────────────┤
│ Tabs: Mô tả | Nguồn gốc & vùng trồng | Thời gian thu hoạch |    │
│       Chứng nhận (xem/tải PDF) | Quy cách đóng gói             │
├────────────────────────────────────────────────────────────────┤
│ Sản phẩm cùng mùa / cùng danh mục                               │
└────────────────────────────────────────────────────────────────┘
```

- Chọn khối lượng → highlight bậc giá tương ứng + tạm tính (đại lý thấy thêm dòng "chiết khấu riêng của bạn −3%").
- JSON-LD `Product` + breadcrumb.

## 5. Giỏ báo giá & luồng gửi yêu cầu

1. Nút *+ Thêm vào báo giá* ở mọi card/trang chi tiết → lưu `localStorage` (không cần đăng nhập), badge số lượng trên header.
2. `/bao-gia`: bảng items (sửa khối lượng, ghi chú từng dòng, xóa) + form: **họ tên · công ty · điện thoại · email · ngày giao mong muốn · địa điểm giao · ghi chú**.
3. Đại lý đăng nhập: form tự điền, sau khi gửi thấy yêu cầu trong */tai-khoan/bao-gia*.
4. Gửi xong → màn hình cảm ơn + mã `BG-2026-xxxxx` + hứa hẹn SLA phản hồi + nút Zalo.

## 6. Khu vực đại lý `/tai-khoan` và Admin `/quan-tri`

**Đại lý**: Tổng quan (đơn đang chạy, công nợ, hạn mức) · Đơn hàng (timeline 8 trạng thái trực quan) · Báo giá · Đặt trước mùa vụ · Hồ sơ công ty.

**Admin** (GĐ2 — ưu tiên theo thứ tự): Dashboard (4 thẻ số + 2 biểu đồ doanh thu/sản phẩm) → Báo giá (bàn làm việc: bảng PENDING, điền giá inline, nút gửi PDF) → Đơn hàng (kanban theo trạng thái hoặc bảng + timeline) → Sản phẩm (CRUD + bậc giá + mùa vụ + ẩn/hiện) → Kho (nhập lô, tồn, log) → Khách hàng (hồ sơ, công nợ, CRM) → CMS (banner, tin, video, FAQ, settings) → Báo cáo → Người dùng/phân quyền.

## 7. Design system

| Token | Giá trị | Ghi chú |
|---|---|---|
| Primary | Xanh lá `#16a34a` (green-600) | Nông nghiệp, tươi |
| Accent | Cam `#ea580c` (orange-600) | CTA, badge mùa |
| Nền | Trắng / `#f8faf8` | Sạch, nhiều ảnh |
| Chữ | `#1c1917` (stone-900) | |
| Font | Be Vietnam Pro / Inter | Hỗ trợ tiếng Việt tốt |
| Bo góc | `rounded-xl` card, `rounded-lg` nút | |

- Component nền tảng: shadcn/ui (Button, Card, Dialog, Table, Form, Toast, Badge, Tabs).
- **Mobile-first**: thương lái/đại lý dùng điện thoại là chính; nút gọi + Zalo nổi (floating) góc phải dưới ở mọi trang.
- Ảnh: `next/image` + Cloudinary transform; lazy-load video.

## 8. SEO checklist (đáp ứng spec mục 11)

- URL tiếng Việt không dấu (`/san-pham/xoai-tron-yen-chau`), canonical, breadcrumb (UI + JSON-LD).
- Meta title/description riêng từng SP/bài viết (field SEO trong CSDL); Open Graph + ảnh OG.
- JSON-LD: `Organization` (toàn site), `Product`, `Article`, `BreadcrumbList`, `FAQPage`.
- `sitemap.xml` động (sản phẩm + bài viết + danh mục) và `robots.txt` — đã scaffold trong `apps/web/src/app/sitemap.ts`, `robots.ts`.
- Blog chuẩn SEO theo 4 cụm chủ đề: kỹ thuật trồng · mùa vụ · xuất khẩu · giá thị trường (nội dung trả lời truy vấn "giá xoài sỉ hôm nay", "mùa nhãn Sông Mã tháng mấy"…).
- Core Web Vitals: SSR/ISR, ảnh tối ưu, font self-host, hạn chế JS client.
