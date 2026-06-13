namespace NhaVuonSonLa.Web.Models;

/// <summary>Giá bậc thang theo số lượng: 10kg / 50kg / 100kg / 500kg / 1 tấn...</summary>
public class PriceTier
{
    public int Id { get; set; }

    public int ProductId { get; set; }
    public Product? Product { get; set; }

    /// <summary>Áp dụng từ khối lượng này trở lên (kg).</summary>
    public decimal MinQuantity { get; set; }

    /// <summary>Đơn giá / đơn vị.</summary>
    public decimal Price { get; set; }

    public string Label { get; set; } = "";   // "Từ 1 tấn"
}
