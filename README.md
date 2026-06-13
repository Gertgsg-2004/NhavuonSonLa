# 🍊 Nhà Vườn Sơn La — Website bán sỉ nông sản (B2B)

Website thương mại **B2B (bán buôn/bán sỉ)** cho nhà vườn Sơn La, viết bằng **ASP.NET Core MVC (.NET 8) + Entity Framework Core + SQLite**.

Khác với web bán lẻ thông thường, hệ thống xoay quanh **yêu cầu báo giá** (thay cho "mua ngay"), **giá theo bậc số lượng** (10kg → 1 tấn), **ẩn giá với khách lẻ**, và phục vụ đại lý/siêu thị/chợ đầu mối/thương lái/nhà hàng/công ty xuất khẩu.

---

## ▶️ Cách chạy (rất đơn giản)

Dự án này chạy thẳng trong **Visual Studio** — không cần cài Docker, không cần cài database riêng (dùng SQLite dạng file, tự tạo khi chạy).

### Cách 1 — Visual Studio (khuyên dùng)
1. Mở file **`NhaVuonSonLa.sln`** bằng Visual Studio 2022.
2. Nếu báo thiếu **.NET 8**, bấm nút **Install** mà Visual Studio gợi ý (hoặc tải tại https://dotnet.microsoft.com/download/dotnet/8.0).
3. Bấm nút **▶ chạy** (màu xanh, hoặc phím **F5**).
4. Trình duyệt tự mở website. Xong!

### Cách 2 — Dòng lệnh
```bash
cd src/NhaVuonSonLa.Web
dotnet run
```
Rồi mở trình duyệt vào địa chỉ hiện trên màn hình (ví dụ `http://localhost:5025`).

> Lần đầu chạy, file `nhavuonsonla.db` (SQLite) được tạo tự động và nạp sẵn dữ liệu mẫu: 7 sản phẩm đặc sản Sơn La, danh mục, giá bậc, tin tức, đánh giá. Muốn nạp lại từ đầu: xóa file `nhavuonsonla.db` rồi chạy lại.

---

## 🧭 Các trang chính

| Đường dẫn | Nội dung |
|---|---|
| `/` | Trang chủ: hero, USP, sản phẩm nổi bật, hàng đang mùa, quy trình thu hoạch, đánh giá, tin tức |
| `/san-pham` | Danh sách sản phẩm + bộ lọc (mùa vụ, danh mục, vùng trồng, tiêu chuẩn, xuất khẩu) |
| `/san-pham/{slug}` | Chi tiết sản phẩm: **bảng giá theo số lượng** + chọn khối lượng + tạm tính + thêm vào báo giá |
| `/bao-gia` | **Giỏ báo giá** → form gửi yêu cầu (thay cho giỏ hàng "mua ngay") |
| `/tin-tuc`, `/tin-tuc/{slug}` | Tin tức (kỹ thuật trồng, mùa vụ, xuất khẩu, giá thị trường) |
| `/gioi-thieu`, `/lien-he` | Giới thiệu nhà vườn, liên hệ |
| `/quan-tri/bao-gia` | Trang quản trị: xem các yêu cầu báo giá khách gửi |

---

## 🗂️ Cấu trúc dự án

```
NhaVuonSonLa.sln              ← mở file này bằng Visual Studio
src/NhaVuonSonLa.Web/
├── Program.cs                ← khởi động: cấu hình EF Core SQLite, Session, nạp dữ liệu mẫu
├── appsettings.json          ← chuỗi kết nối SQLite
├── Models/                   ← các lớp dữ liệu: Product, PriceTier, Quote, Category...
├── Data/
│   ├── AppDbContext.cs       ← ngữ cảnh CSDL (EF Core)
│   └── DbSeeder.cs           ← dữ liệu mẫu đặc sản Sơn La
├── Services/
│   ├── PricingService.cs     ← tính giá theo bậc số lượng (logic B2B cốt lõi)
│   └── QuoteCart.cs          ← giỏ báo giá lưu trong Session
├── Controllers/              ← Home, Products, Quote, News, Admin
├── Views/                    ← giao diện Razor (.cshtml)
└── wwwroot/css/site.css      ← giao diện (chủ đề xanh nông nghiệp)

docs/                         ← tài liệu thiết kế (phân tích yêu cầu, CSDL, API, UI, lộ trình)
```

---

## 🌾 Đặc thù nghiệp vụ B2B đã có

| Đặc thù | Cách xử lý |
|---|---|
| Giá theo bậc số lượng | `PriceTier` + `PricingService` — chọn khối lượng tự ra đơn giá tương ứng |
| Ẩn giá với khách lẻ | `Product.IsPriceVisible = false` → hiện "Liên hệ báo giá" / "Giá theo thỏa thuận" |
| Yêu cầu báo giá | Giỏ báo giá (Session) → gửi 1 yêu cầu, lưu DB, sinh mã `BG-2026-00001` |
| Mùa vụ | `Product` có tháng bắt đầu/kết thúc/rộ vụ; badge "Đang vào mùa / Sắp vào vụ / Hết mùa" |
| Tiêu chuẩn & xuất khẩu | VietGAP/GlobalGAP/Organic + cờ "đạt chuẩn xuất khẩu", lọc được |

## 🔜 Hướng phát triển tiếp (giai đoạn sau)
Đăng nhập đại lý + giá riêng theo khách · định giá từng dòng báo giá + xuất PDF · chuyển báo giá thành đơn hàng + máy trạng thái · quản lý kho/lô hàng · báo cáo doanh thu. Phân tích thiết kế đầy đủ nằm trong thư mục [`docs/`](docs/).

> Ghi chú: bản thiết kế chi tiết trong `docs/` mô tả kiến trúc đầy đủ (gồm cả phương án Node.js/NestJS ban đầu). Bản chạy thực tế trong repo này là **.NET**, hiện thực phần lõi: catalog + giá bậc + báo giá. Bản mã nguồn Node.js cũ vẫn lưu trong lịch sử git nếu cần tham khảo.
