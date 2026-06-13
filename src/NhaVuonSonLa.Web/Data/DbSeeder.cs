using Microsoft.EntityFrameworkCore;
using NhaVuonSonLa.Web.Models;

namespace NhaVuonSonLa.Web.Data;

/// <summary>Tạo dữ liệu mẫu (đặc sản Sơn La) lần đầu chạy nếu DB còn trống.</summary>
public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        db.Database.EnsureCreated();
        if (db.Products.Any()) return; // đã có dữ liệu → bỏ qua

        var cats = new Dictionary<string, Category>
        {
            ["xoai"] = new() { Name = "Xoài", Slug = "xoai", SortOrder = 0 },
            ["nhan"] = new() { Name = "Nhãn", Slug = "nhan", SortOrder = 1 },
            ["man"] = new() { Name = "Mận", Slug = "man", SortOrder = 2 },
            ["dau-tay"] = new() { Name = "Dâu tây", Slug = "dau-tay", SortOrder = 3 },
            ["chanh-leo"] = new() { Name = "Chanh leo", Slug = "chanh-leo", SortOrder = 4 },
            ["na"] = new() { Name = "Na", Slug = "na", SortOrder = 5 },
        };
        db.Categories.AddRange(cats.Values);

        PriceTier Tier(decimal min, decimal price) => new()
        {
            MinQuantity = min,
            Price = price,
            Label = min >= 1000 ? $"Từ {min / 1000:0.#} tấn" : $"Từ {min:0}kg",
        };

        var products = new List<Product>
        {
            new()
            {
                Name = "Xoài tròn Yên Châu", Slug = "xoai-tron-yen-chau", Category = cats["xoai"],
                GrowingRegion = "Yên Châu", Origin = "Giống bản địa Yên Châu (chỉ dẫn địa lý)",
                HarvestPeriod = "Tháng 5 – 8", ShortDescription = "Xoài tròn bản địa thơm đậm, vỏ xanh thịt vàng, được bảo hộ chỉ dẫn địa lý Yên Châu.",
                Description = "Xoài tròn Yên Châu là giống bản địa được bảo hộ chỉ dẫn địa lý, quả nhỏ 200–300g, vỏ xanh, thịt vàng óng, ngọt đậm và thơm đặc trưng. Vườn đạt chuẩn VietGAP, có mã số vùng trồng phục vụ xuất khẩu chính ngạch.\n\nQuy cách: thùng giấy 10kg hoặc sọt nhựa 20kg; hỗ trợ đóng hàng xuất khẩu theo yêu cầu.",
                RetailPrice = 35000, IsPriceVisible = true, IsFeatured = true, IsExportQuality = true,
                Certifications = "VietGAP", SeasonStartMonth = 5, SeasonEndMonth = 8, SeasonPeakMonth = 6,
                Emoji = "🥭", Gradient = "linear-gradient(135deg,#fde68a,#fef9c3)",
                PriceTiers = new() { Tier(10, 35000), Tier(50, 32000), Tier(100, 30000), Tier(500, 27000), Tier(1000, 25000) },
            },
            new()
            {
                Name = "Xoài tượng da xanh", Slug = "xoai-tuong-da-xanh", Category = cats["xoai"],
                GrowingRegion = "Yên Châu", Origin = "Giống Đài Loan ghép",
                HarvestPeriod = "Tháng 5 – 9", ShortDescription = "Quả to 0,8–1,2kg, ít xơ, chuyên hàng xuất khẩu Trung Quốc và chế biến.",
                Description = "Xoài tượng da xanh trồng theo tiêu chuẩn GlobalGAP, quả to đều, ít xơ, vị ngọt thanh, chịu vận chuyển tốt — lựa chọn hàng đầu cho đơn container xuất khẩu và chuỗi chế biến.",
                RetailPrice = 28000, IsPriceVisible = true, IsFeatured = false, IsExportQuality = true,
                Certifications = "GlobalGAP", SeasonStartMonth = 5, SeasonEndMonth = 9, SeasonPeakMonth = 7,
                Emoji = "🥭", Gradient = "linear-gradient(135deg,#bbf7d0,#ecfccb)",
                PriceTiers = new() { Tier(10, 28000), Tier(100, 24000), Tier(500, 21000), Tier(1000, 19000) },
            },
            new()
            {
                Name = "Nhãn Sông Mã", Slug = "nhan-song-ma", Category = cats["nhan"],
                GrowingRegion = "Sông Mã", Origin = "Nhãn miền thiết ghép cải tạo",
                HarvestPeriod = "Tháng 7 – 9", ShortDescription = "Cùi dày, hạt nhỏ, ngọt sắc — vùng trồng có mã số xuất khẩu chính ngạch.",
                Description = "Nhãn Sông Mã từ thủ phủ nhãn miền Bắc với hơn 7.500ha. Cùi dày giòn, hạt nhỏ, độ ngọt cao và đồng đều. Vùng trồng được cấp mã số xuất khẩu, đáp ứng kiểm dịch thực vật cho thị trường Trung Quốc, EU.",
                RetailPrice = 40000, IsPriceVisible = true, IsFeatured = true, IsExportQuality = true,
                Certifications = "VietGAP", SeasonStartMonth = 7, SeasonEndMonth = 9, SeasonPeakMonth = 8,
                Emoji = "🟤", Gradient = "linear-gradient(135deg,#fed7aa,#fef3c7)",
                PriceTiers = new() { Tier(10, 40000), Tier(50, 36000), Tier(100, 33000), Tier(500, 30000), Tier(1000, 27000) },
            },
            new()
            {
                Name = "Mận hậu Mộc Châu", Slug = "man-hau-moc-chau", Category = cats["man"],
                GrowingRegion = "Mộc Châu", Origin = "Mận hậu cao nguyên",
                HarvestPeriod = "Tháng 5 – 7", ShortDescription = "Mận hậu trái to giòn ngọt, hàng tuyển size 18–22 quả/kg.",
                Description = "Mận hậu trồng trên cao nguyên Mộc Châu 1.050m, biên độ nhiệt ngày đêm lớn cho quả giòn, ngọt thanh xen chua nhẹ. Hàng tuyển chọn size đều, chịu được vận chuyển xa.",
                RetailPrice = 45000, IsPriceVisible = true, IsFeatured = true, IsExportQuality = false,
                Certifications = "VietGAP", SeasonStartMonth = 5, SeasonEndMonth = 7, SeasonPeakMonth = 6,
                Emoji = "🍑", Gradient = "linear-gradient(135deg,#fecdd3,#fee2e2)",
                PriceTiers = new() { Tier(10, 45000), Tier(50, 40000), Tier(100, 36000), Tier(500, 32000) },
            },
            new()
            {
                Name = "Dâu tây Hana Mộc Châu", Slug = "dau-tay-hana-moc-chau", Category = cats["dau-tay"],
                GrowingRegion = "Mộc Châu", Origin = "Giống Hana Nhật Bản",
                HarvestPeriod = "Tháng 12 – 4", ShortDescription = "Dâu Hana trồng nhà màng hữu cơ, hái buổi sớm giao trong ngày.",
                Description = "Dâu tây giống Hana Nhật Bản trồng nhà màng theo hướng hữu cơ. Hái lúc sáng sớm, đóng hộp xốp lạnh giao trong ngày cho chuỗi cửa hàng và nhà hàng. Giá biến động theo ngày — vui lòng yêu cầu báo giá.",
                RetailPrice = null, IsPriceVisible = false, IsFeatured = true, IsExportQuality = false,
                Certifications = "Organic", SeasonStartMonth = 12, SeasonEndMonth = 4, SeasonPeakMonth = 2,
                Emoji = "🍓", Gradient = "linear-gradient(135deg,#fecaca,#fbcfe8)",
                PriceTiers = new(),
            },
            new()
            {
                Name = "Chanh leo tím Sơn La", Slug = "chanh-leo-tim-son-la", Category = cats["chanh-leo"],
                GrowingRegion = "Mộc Châu", Origin = "Giống Đài Nông 1",
                HarvestPeriod = "Quanh năm, rộ tháng 6 – 11", ShortDescription = "Chanh leo quả tím đạt chuẩn xuất khẩu châu Âu, độ chua ổn định.",
                Description = "Chanh leo tím giống Đài Nông 1 đạt GlobalGAP, vỏ dày chịu vận chuyển, dịch quả đạt chuẩn chế biến và xuất tươi sang EU. Cho thu quanh năm, rộ từ tháng 6 đến tháng 11.",
                RetailPrice = 25000, IsPriceVisible = true, IsFeatured = false, IsExportQuality = true,
                Certifications = "GlobalGAP", SeasonStartMonth = 6, SeasonEndMonth = 11, SeasonPeakMonth = 9,
                Emoji = "🟣", Gradient = "linear-gradient(135deg,#e9d5ff,#ede9fe)",
                PriceTiers = new() { Tier(10, 25000), Tier(100, 21000), Tier(500, 18000), Tier(1000, 16000) },
            },
            new()
            {
                Name = "Na sầu riêng Mai Sơn", Slug = "na-sau-rieng-mai-son", Category = cats["na"],
                GrowingRegion = "Mai Sơn", Origin = "Na sầu riêng (na Thái ghép)",
                HarvestPeriod = "Tháng 8 – 11", ShortDescription = "Quả 0,7–1,5kg, thịt dai ngọt thanh, hàng tuyển biếu tặng và siêu thị.",
                Description = "Na sầu riêng (na Thái ghép) quả to 0,7–1,5kg, ít hạt, thịt dai ngọt thanh. Phân khúc cao cấp cho siêu thị và giỏ quà biếu. Sản lượng giới hạn — giá báo theo tuần.",
                RetailPrice = null, IsPriceVisible = false, IsFeatured = true, IsExportQuality = false,
                Certifications = "VietGAP", SeasonStartMonth = 8, SeasonEndMonth = 11, SeasonPeakMonth = 9,
                Emoji = "🍈", Gradient = "linear-gradient(135deg,#a7f3d0,#d1fae5)",
                PriceTiers = new(),
            },
        };

        // Hết mùa thì đánh dấu OutOfSeason (vẫn hiển thị, cho đặt trước)
        var month = DateTime.Now.Month;
        foreach (var p in products)
            p.Status = p.IsInSeason(month) ? ProductStatus.Active : ProductStatus.OutOfSeason;
        db.Products.AddRange(products);

        db.Reviews.AddRange(
            new Review { AuthorName = "Anh Hùng", CompanyName = "Vựa trái cây chợ Long Biên", Rating = 5, SortOrder = 0,
                Content = "Hàng đều, đóng sọt chắc chắn, xe về đúng giờ hẹn 4h sáng. Làm với vườn 3 vụ xoài rồi." },
            new Review { AuthorName = "Chị Lan", CompanyName = "Chuỗi cửa hàng Fruit House", Rating = 5, SortOrder = 1,
                Content = "Nhãn Sông Mã cùi dày, khách phản hồi tốt. Có chứng từ VietGAP đầy đủ để vào siêu thị." },
            new Review { AuthorName = "Mr. Chen", CompanyName = "Công ty XNK Hoa Quả Việt-Trung", Rating = 5, SortOrder = 2,
                Content = "Đóng container chuẩn kiểm dịch, mã vùng trồng rõ ràng, thông quan thuận lợi." }
        );

        db.Posts.AddRange(
            new Post { Title = "Lịch mùa vụ trái cây Sơn La 2026: tháng nào có gì?", Slug = "lich-mua-vu-trai-cay-son-la-2026",
                CategoryLabel = "Mùa vụ", Excerpt = "Tổng hợp lịch thu hoạch xoài, nhãn, mận hậu, na, dâu tây... tại Sơn La để các đại lý chủ động kế hoạch nhập hàng.",
                Content = "Sơn La là vựa trái cây lớn nhất miền Bắc với hơn 80.000 ha cây ăn quả. Bài viết tổng hợp lịch thu hoạch từng loại để đại lý chủ động kế hoạch." },
            new Post { Title = "Quy trình xuất khẩu xoài Yên Châu sang Trung Quốc chính ngạch", Slug = "quy-trinh-xuat-khau-xoai-yen-chau",
                CategoryLabel = "Xuất khẩu", Excerpt = "Mã số vùng trồng, kiểm dịch thực vật, quy cách đóng thùng và những lưu ý khi xuất khẩu chính ngạch.",
                Content = "Từ 2022, xoài Yên Châu đã được cấp mã số vùng trồng xuất khẩu. Bài viết hướng dẫn quy trình và hồ sơ cần chuẩn bị." },
            new Post { Title = "Giá nhãn Sông Mã đầu vụ: nhận định thị trường tháng 7", Slug = "gia-nhan-song-ma-dau-vu",
                CategoryLabel = "Giá thị trường", Excerpt = "Phân tích cung cầu và dự báo giá nhãn sỉ tại vườn cho thương lái, chợ đầu mối.",
                Content = "Sản lượng nhãn Sông Mã năm nay ước đạt mức cao. Bài viết phân tích cung cầu và dự báo giá sỉ tại vườn." }
        );

        db.SaveChanges();
    }
}
