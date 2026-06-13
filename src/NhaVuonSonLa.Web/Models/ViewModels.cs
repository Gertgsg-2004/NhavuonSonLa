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
