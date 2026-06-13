using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NhaVuonSonLa.Web.Models;

/// <summary>
/// Sản phẩm nông sản. Giữ các đặc thù B2B: giá bậc theo số lượng (PriceTiers),
/// ẩn giá với khách lẻ (IsPriceVisible), mùa vụ, chuẩn xuất khẩu, chứng nhận.
/// </summary>
public class Product
{
    public int Id { get; set; }

    [Required, MaxLength(160)]
    public string Name { get; set; } = "";

    [Required, MaxLength(160)]
    public string Slug { get; set; } = "";

    public int CategoryId { get; set; }
    public Category? Category { get; set; }

    [MaxLength(120)]
    public string GrowingRegion { get; set; } = "";   // Vùng trồng: Yên Châu, Mộc Châu...

    [MaxLength(200)]
    public string Origin { get; set; } = "";          // Nguồn gốc giống

    [MaxLength(120)]
    public string HarvestPeriod { get; set; } = "";   // "Tháng 5 – 8"

    [MaxLength(400)]
    public string ShortDescription { get; set; } = "";

    public string Description { get; set; } = "";

    [MaxLength(20)]
    public string Unit { get; set; } = "kg";

    public decimal MinOrderQuantity { get; set; } = 10;

    /// <summary>Giá lẻ tham khảo. Null = chỉ báo giá riêng.</summary>
    public decimal? RetailPrice { get; set; }

    /// <summary>False: khách lẻ thấy "Liên hệ báo giá"; đại lý đăng nhập mới thấy giá.</summary>
    public bool IsPriceVisible { get; set; }

    public bool IsFeatured { get; set; }
    public bool IsExportQuality { get; set; }

    public ProductStatus Status { get; set; } = ProductStatus.Active;

    // Mùa vụ (tháng 1-12). Hỗ trợ vụ vắt năm: Start > End (vd dâu tây 12 → 4).
    public int SeasonStartMonth { get; set; }
    public int SeasonEndMonth { get; set; }
    public int SeasonPeakMonth { get; set; }

    /// <summary>Chứng nhận, lưu dạng "VietGAP,GlobalGAP".</summary>
    [MaxLength(200)]
    public string Certifications { get; set; } = "";

    // Hiển thị placeholder khi chưa có ảnh thật
    [MaxLength(16)]
    public string Emoji { get; set; } = "🍃";

    [MaxLength(60)]
    public string Gradient { get; set; } = "from-green-200 to-lime-100";

    public List<PriceTier> PriceTiers { get; set; } = new();

    // ---- Tiện ích hiển thị (không lưu DB) ----

    [NotMapped]
    public IEnumerable<string> CertificationList =>
        Certifications.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    /// <summary>Tháng hiện có thuộc mùa vụ không (hỗ trợ vụ vắt năm).</summary>
    public bool IsInSeason(int month) =>
        SeasonStartMonth <= SeasonEndMonth
            ? month >= SeasonStartMonth && month <= SeasonEndMonth
            : month >= SeasonStartMonth || month <= SeasonEndMonth;

    [NotMapped]
    public bool PriceOnRequest => RetailPrice == null;
}
