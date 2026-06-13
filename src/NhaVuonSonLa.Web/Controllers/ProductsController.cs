using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhaVuonSonLa.Web.Data;
using NhaVuonSonLa.Web.Models;

namespace NhaVuonSonLa.Web.Controllers;

[Route("san-pham")]
public class ProductsController : Controller
{
    private readonly AppDbContext _db;

    public ProductsController(AppDbContext db) => _db = db;

    [HttpGet("")]
    public async Task<IActionResult> Index(string? category, string? region, string? cert, bool? export, bool season = false)
    {
        var month = DateTime.Now.Month;
        var products = await _db.Products
            .Include(p => p.PriceTiers)
            .Include(p => p.Category)
            .Where(p => p.Status != ProductStatus.Hidden)
            .ToListAsync();

        if (!string.IsNullOrEmpty(category))
            products = products.Where(p => p.Category!.Slug == category).ToList();
        if (!string.IsNullOrEmpty(region))
            products = products.Where(p => p.GrowingRegion.Contains(region, StringComparison.OrdinalIgnoreCase)).ToList();
        if (!string.IsNullOrEmpty(cert))
            products = products.Where(p => p.CertificationList.Any(c => c.Equals(cert, StringComparison.OrdinalIgnoreCase))).ToList();
        if (export == true)
            products = products.Where(p => p.IsExportQuality).ToList();
        if (season)
            products = products.Where(p => p.IsInSeason(month)).ToList();

        var model = new ProductListViewModel
        {
            Products = products,
            Categories = await _db.Categories.OrderBy(c => c.SortOrder).ToListAsync(),
            Regions = await _db.Products.Select(p => p.GrowingRegion).Distinct().ToListAsync(),
            Category = category,
            Region = region,
            Certification = cert,
            ExportOnly = export,
            InSeasonOnly = season,
        };
        return View(model);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> Detail(string slug)
    {
        var product = await _db.Products
            .Include(p => p.PriceTiers)
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Slug == slug && p.Status != ProductStatus.Hidden);

        if (product == null) return NotFound();

        ViewBag.Related = await _db.Products
            .Include(p => p.PriceTiers)
            .Where(p => p.Slug != slug && p.Status != ProductStatus.Hidden)
            .Take(4).ToListAsync();

        return View(product);
    }
}
