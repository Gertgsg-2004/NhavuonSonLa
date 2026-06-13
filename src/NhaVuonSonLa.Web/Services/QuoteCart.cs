using System.Text.Json;
using NhaVuonSonLa.Web.Models;

namespace NhaVuonSonLa.Web.Services;

/// <summary>Một dòng trong giỏ báo giá (lưu trong session).</summary>
public class QuoteCartItem
{
    public int ProductId { get; set; }
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public string Unit { get; set; } = "kg";
    public decimal Quantity { get; set; }
    public decimal MinOrderQuantity { get; set; }
    public string Emoji { get; set; } = "🍃";
    public string Gradient { get; set; } = "";
    public string? Note { get; set; }
}

/// <summary>
/// Giỏ báo giá lưu trong Session (server) — khác giỏ hàng B2C: gom sản phẩm
/// + khối lượng để gửi MỘT yêu cầu báo giá, không thanh toán ngay.
/// </summary>
public class QuoteCart
{
    private const string Key = "quote_cart";
    private readonly ISession _session;

    public QuoteCart(IHttpContextAccessor accessor)
    {
        _session = accessor.HttpContext!.Session;
    }

    public List<QuoteCartItem> Items
    {
        get
        {
            var json = _session.GetString(Key);
            return string.IsNullOrEmpty(json)
                ? new List<QuoteCartItem>()
                : JsonSerializer.Deserialize<List<QuoteCartItem>>(json) ?? new();
        }
        private set => _session.SetString(Key, JsonSerializer.Serialize(value));
    }

    public int Count => Items.Count;

    public void Add(QuoteCartItem item)
    {
        var items = Items;
        var existing = items.FirstOrDefault(i => i.ProductId == item.ProductId);
        if (existing != null) existing.Quantity += item.Quantity;
        else items.Add(item);
        Items = items;
    }

    public void UpdateQuantity(int productId, decimal quantity)
    {
        var items = Items;
        var item = items.FirstOrDefault(i => i.ProductId == productId);
        if (item != null)
        {
            item.Quantity = Math.Max(1, quantity);
            Items = items;
        }
    }

    public void Remove(int productId)
    {
        Items = Items.Where(i => i.ProductId != productId).ToList();
    }

    public void Clear() => _session.Remove(Key);
}
