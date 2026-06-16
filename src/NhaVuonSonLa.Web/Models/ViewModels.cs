using System.ComponentModel.DataAnnotations;

namespace NhaVuonSonLa.Web.Models;

/// <summary>Dữ liệu cho trang chủ.</summary>
public class HomeViewModel
{
    public List<Product> Featured { get; set; } = new();
    public List<Product> InSeason { get; set; } = new();
    public List<Review> Reviews { get; set; } = new();
    public List<Post> Posts { get; set; } = new();
    public int CurrentMonth { get; set; }
}

/// <summary>Dữ liệu + bộ lọc cho trang danh sách sản phẩm.</summary>
public class ProductListViewModel
{
    public List<Product> Products { get; set; } = new();
    public List<Category> Categories { get; set; } = new();
    public List<string> Regions { get; set; } = new();

    // Bộ lọc đang chọn
    public string? Category { get; set; }
    public string? Region { get; set; }
    public string? Certification { get; set; }
    public bool? ExportOnly { get; set; }
    public bool InSeasonOnly { get; set; }
}

/// <summary>Form thông tin gửi yêu cầu báo giá.</summary>
public class QuoteRequestForm
{
    public string FullName { get; set; } = "";
    public string? CompanyName { get; set; }
    public string Phone { get; set; } = "";
    public string? Email { get; set; }
    public string? DeliveryDate { get; set; }
    public string? DeliveryAddress { get; set; }
    public string? Note { get; set; }
}

// ============ Quản trị ============

/// <summary>Số liệu trang tổng quan quản trị.</summary>
public class DashboardViewModel
{
    public int ProductCount { get; set; }
    public int ActiveProductCount { get; set; }
    public int CategoryCount { get; set; }
    public int QuoteCount { get; set; }
    public int PendingQuoteCount { get; set; }
    public int InSeasonCount { get; set; }
    public List<Quote> RecentQuotes { get; set; } = new();
    public List<(string Name, int Count)> QuotesByProduct { get; set; } = new();
}

/// <summary>
/// Form thêm/sửa sản phẩm. Giá bậc nhập dạng văn bản nhiều dòng "khốilượng=giá"
/// cho dễ dùng (vd: 10=35000).
/// </summary>
public class ProductFormViewModel
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Nhập tên sản phẩm")]
    public string Name { get; set; } = "";

    public string? Slug { get; set; }
    public int CategoryId { get; set; }
    public string GrowingRegion { get; set; } = "";
    public string Origin { get; set; } = "";
    public string HarvestPeriod { get; set; } = "";
    public string ShortDescription { get; set; } = "";
    public string Description { get; set; } = "";
    public string Unit { get; set; } = "kg";
    public decimal MinOrderQuantity { get; set; } = 10;
    public decimal? RetailPrice { get; set; }
    public bool IsPriceVisible { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsExportQuality { get; set; }
    public ProductStatus Status { get; set; } = ProductStatus.Active;
    public int SeasonStartMonth { get; set; } = 1;
    public int SeasonEndMonth { get; set; } = 12;
    public int SeasonPeakMonth { get; set; } = 6;
    public string Certifications { get; set; } = "";
    public string Emoji { get; set; } = "🍃";
    public string Gradient { get; set; } = "linear-gradient(135deg,#bbf7d0,#ecfccb)";

    /// <summary>Mỗi dòng "minQuantity=price", vd "10=35000".</summary>
    public string PriceTiersText { get; set; } = "";

    public List<Category> Categories { get; set; } = new();
}
