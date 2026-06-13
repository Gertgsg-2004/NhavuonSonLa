using NhaVuonSonLa.Web.Models;

namespace NhaVuonSonLa.Web.Services;

/// <summary>Tính đơn giá theo bậc số lượng — quy tắc giá B2B cốt lõi.</summary>
public static class PricingService
{
    /// <summary>
    /// Đơn giá áp dụng cho một khối lượng: lấy bậc giá cao nhất có
    /// MinQuantity ≤ quantity. Trả null nếu sản phẩm chỉ báo giá riêng.
    /// </summary>
    public static decimal? ResolveUnitPrice(Product product, decimal quantity)
    {
        if (product.PriceTiers.Count > 0)
        {
            var tier = product.PriceTiers
                .Where(t => t.MinQuantity <= quantity)
                .OrderByDescending(t => t.MinQuantity)
                .FirstOrDefault();
            if (tier != null) return tier.Price;
        }
        return product.RetailPrice;
    }

    /// <summary>Giá khởi điểm hiển thị trên thẻ sản phẩm ("từ ...đ").</summary>
    public static decimal? StartingPrice(Product product)
    {
        if (product.PriceOnRequest) return null;
        if (product.PriceTiers.Count > 0)
            return product.PriceTiers.Min(t => t.Price);
        return product.RetailPrice;
    }
}
