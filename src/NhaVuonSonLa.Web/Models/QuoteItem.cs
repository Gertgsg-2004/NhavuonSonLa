namespace NhaVuonSonLa.Web.Models;

/// <summary>Một dòng trong yêu cầu báo giá (sản phẩm + khối lượng).</summary>
public class QuoteItem
{
    public int Id { get; set; }

    public int QuoteId { get; set; }
    public Quote? Quote { get; set; }

    public int ProductId { get; set; }
    public Product? Product { get; set; }

    public decimal Quantity { get; set; }

    public string Unit { get; set; } = "kg";

    public string? Note { get; set; }

    /// <summary>Đơn giá nhân viên điền khi báo giá (để trống lúc khách gửi).</summary>
    public decimal? QuotedPrice { get; set; }
}
