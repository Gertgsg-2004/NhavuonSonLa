using System.Globalization;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhaVuonSonLa.Web.Data;
using NhaVuonSonLa.Web.Models;

namespace NhaVuonSonLa.Web.Controllers;

/// <summary>Quản lý sản phẩm: thêm, sửa, xóa, ẩn/hiện + bảng giá bậc.</summary>
[Authorize]
[Route("quan-tri/san-pham")]
public class ProductsAdminController : Controller
{
    private readonly AppDbContext _db;

    public ProductsAdminController(AppDbContext db) => _db = db;

    [HttpGet("")]
    public async Task<IActionResult> Index()
    {
        var products = await _db.Products
            .Include(p => p.Category)
            .Include(p => p.PriceTiers)
            .OrderBy(p => p.Category!.SortOrder).ThenBy(p => p.Name)
            .ToListAsync();
        return View(products);
    }

    [HttpGet("them")]
    public async Task<IActionResult> Create()
    {
        return View("Form", new ProductFormViewModel
        {
            Categories = await _db.Categories.OrderBy(c => c.SortOrder).ToListAsync(),
            PriceTiersText = "10=35000\n100=30000\n1000=25000",
        });
    }

    [HttpPost("them")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(ProductFormViewModel form)
    {
        if (!ModelState.IsValid) return await Reshow(form);

        var product = new Product();
        Apply(form, product);
        product.Slug = await UniqueSlug(form.Slug, form.Name, null);
        product.PriceTiers = ParseTiers(form.PriceTiersText);
        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        TempData["AdminToast"] = $"Đã thêm sản phẩm \"{product.Name}\".";
        return RedirectToAction(nameof(Index));
    }

    [HttpGet("sua/{id:int}")]
    public async Task<IActionResult> Edit(int id)
    {
        var p = await _db.Products.Include(x => x.PriceTiers).FirstOrDefaultAsync(x => x.Id == id);
        if (p == null) return NotFound();

        var form = new ProductFormViewModel
        {
            Id = p.Id, Name = p.Name, Slug = p.Slug, CategoryId = p.CategoryId,
            GrowingRegion = p.GrowingRegion, Origin = p.Origin, HarvestPeriod = p.HarvestPeriod,
            ShortDescription = p.ShortDescription, Description = p.Description, Unit = p.Unit,
            MinOrderQuantity = p.MinOrderQuantity, RetailPrice = p.RetailPrice,
            IsPriceVisible = p.IsPriceVisible, IsFeatured = p.IsFeatured, IsExportQuality = p.IsExportQuality,
            Status = p.Status, SeasonStartMonth = p.SeasonStartMonth, SeasonEndMonth = p.SeasonEndMonth,
            SeasonPeakMonth = p.SeasonPeakMonth, Certifications = p.Certifications, Emoji = p.Emoji,
            Gradient = p.Gradient,
            PriceTiersText = string.Join("\n", p.PriceTiers.OrderBy(t => t.MinQuantity)
                .Select(t => $"{t.MinQuantity:0}={t.Price:0}")),
            Categories = await _db.Categories.OrderBy(c => c.SortOrder).ToListAsync(),
        };
        return View("Form", form);
    }

    [HttpPost("sua/{id:int}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, ProductFormViewModel form)
    {
        var p = await _db.Products.Include(x => x.PriceTiers).FirstOrDefaultAsync(x => x.Id == id);
        if (p == null) return NotFound();
        if (!ModelState.IsValid) return await Reshow(form);

        Apply(form, p);
        p.Slug = await UniqueSlug(form.Slug, form.Name, id);
        _db.PriceTiers.RemoveRange(p.PriceTiers);
        p.PriceTiers = ParseTiers(form.PriceTiersText);
        await _db.SaveChangesAsync();
        TempData["AdminToast"] = $"Đã lưu sản phẩm \"{p.Name}\".";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("an-hien/{id:int}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ToggleVisibility(int id)
    {
        var p = await _db.Products.FindAsync(id);
        if (p == null) return NotFound();
        p.Status = p.Status == ProductStatus.Hidden ? ProductStatus.Active : ProductStatus.Hidden;
        await _db.SaveChangesAsync();
        TempData["AdminToast"] = p.Status == ProductStatus.Hidden
            ? $"Đã ẩn \"{p.Name}\"." : $"Đã hiện \"{p.Name}\".";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("xoa/{id:int}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        var p = await _db.Products.Include(x => x.PriceTiers).FirstOrDefaultAsync(x => x.Id == id);
        if (p == null) return NotFound();
        _db.PriceTiers.RemoveRange(p.PriceTiers);
        _db.Products.Remove(p);
        await _db.SaveChangesAsync();
        TempData["AdminToast"] = $"Đã xóa sản phẩm \"{p.Name}\".";
        return RedirectToAction(nameof(Index));
    }

    // -------- nội bộ --------

    private async Task<IActionResult> Reshow(ProductFormViewModel form)
    {
        form.Categories = await _db.Categories.OrderBy(c => c.SortOrder).ToListAsync();
        return View("Form", form);
    }

    private static void Apply(ProductFormViewModel f, Product p)
    {
        p.Name = f.Name.Trim();
        p.CategoryId = f.CategoryId;
        p.GrowingRegion = f.GrowingRegion ?? "";
        p.Origin = f.Origin ?? "";
        p.HarvestPeriod = f.HarvestPeriod ?? "";
        p.ShortDescription = f.ShortDescription ?? "";
        p.Description = f.Description ?? "";
        p.Unit = string.IsNullOrWhiteSpace(f.Unit) ? "kg" : f.Unit.Trim();
        p.MinOrderQuantity = f.MinOrderQuantity;
        p.RetailPrice = f.RetailPrice;
        p.IsPriceVisible = f.IsPriceVisible;
        p.IsFeatured = f.IsFeatured;
        p.IsExportQuality = f.IsExportQuality;
        p.Status = f.Status;
        p.SeasonStartMonth = Math.Clamp(f.SeasonStartMonth, 1, 12);
        p.SeasonEndMonth = Math.Clamp(f.SeasonEndMonth, 1, 12);
        p.SeasonPeakMonth = Math.Clamp(f.SeasonPeakMonth, 1, 12);
        p.Certifications = f.Certifications ?? "";
        p.Emoji = string.IsNullOrWhiteSpace(f.Emoji) ? "🍃" : f.Emoji.Trim();
        p.Gradient = string.IsNullOrWhiteSpace(f.Gradient) ? "linear-gradient(135deg,#bbf7d0,#ecfccb)" : f.Gradient.Trim();
    }

    /// <summary>Đọc text "min=price" mỗi dòng thành danh sách bậc giá.</summary>
    private static List<PriceTier> ParseTiers(string text)
    {
        var tiers = new List<PriceTier>();
        if (string.IsNullOrWhiteSpace(text)) return tiers;
        foreach (var raw in text.Split('\n', StringSplitOptions.RemoveEmptyEntries))
        {
            var parts = raw.Split('=', 2);
            if (parts.Length != 2) continue;
            if (decimal.TryParse(parts[0].Trim(), NumberStyles.Any, CultureInfo.InvariantCulture, out var min) &&
                decimal.TryParse(parts[1].Trim(), NumberStyles.Any, CultureInfo.InvariantCulture, out var price))
            {
                tiers.Add(new PriceTier
                {
                    MinQuantity = min,
                    Price = price,
                    Label = min >= 1000 ? $"Từ {min / 1000:0.#} tấn" : $"Từ {min:0}kg",
                });
            }
        }
        return tiers.OrderBy(t => t.MinQuantity).ToList();
    }

    private async Task<string> UniqueSlug(string? desired, string name, int? excludeId)
    {
        var baseSlug = Slugify(string.IsNullOrWhiteSpace(desired) ? name : desired);
        var slug = baseSlug;
        int n = 1;
        while (await _db.Products.AnyAsync(p => p.Slug == slug && p.Id != excludeId))
            slug = $"{baseSlug}-{++n}";
        return slug;
    }

    /// <summary>Chuyển tiếng Việt có dấu thành slug không dấu: "Xoài Yên Châu" → "xoai-yen-chau".</summary>
    public static string Slugify(string input)
    {
        input = input.Trim().ToLowerInvariant();
        var map = new (string from, char to)[]
        {
            ("àáạảãâầấậẩẫăằắặẳẵ", 'a'), ("èéẹẻẽêềếệểễ", 'e'), ("ìíịỉĩ", 'i'),
            ("òóọỏõôồốộổỗơờớợởỡ", 'o'), ("ùúụủũưừứựửữ", 'u'), ("ỳýỵỷỹ", 'y'),
        };
        var sb = new StringBuilder();
        foreach (var ch in input)
        {
            if (ch == 'đ') { sb.Append('d'); continue; }
            char mapped = ch;
            foreach (var (from, to) in map)
                if (from.Contains(ch)) { mapped = to; break; }
            if (char.IsLetterOrDigit(mapped) && mapped < 128) sb.Append(mapped);
            else if (char.IsWhiteSpace(mapped) || mapped == '-') sb.Append('-');
        }
        var slug = sb.ToString();
        while (slug.Contains("--")) slug = slug.Replace("--", "-");
        return slug.Trim('-');
    }
}
