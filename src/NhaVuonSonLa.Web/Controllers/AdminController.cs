using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhaVuonSonLa.Web.Data;
using NhaVuonSonLa.Web.Models;

namespace NhaVuonSonLa.Web.Controllers;

/// <summary>Khu vực quản trị: tổng quan + quản lý báo giá. (Cần đăng nhập.)</summary>
[Authorize]
[Route("quan-tri")]
public class AdminController : Controller
{
    private readonly AppDbContext _db;

    public AdminController(AppDbContext db) => _db = db;

    [HttpGet("")]
    public async Task<IActionResult> Index()
    {
        var month = DateTime.Now.Month;
        var products = await _db.Products.ToListAsync();
        var quotes = await _db.Quotes
            .Include(q => q.Items).ThenInclude(i => i.Product)
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();

        var byProduct = quotes
            .SelectMany(q => q.Items)
            .Where(i => i.Product != null)
            .GroupBy(i => i.Product!.Name)
            .Select(g => (Name: g.Key, Count: g.Count()))
            .OrderByDescending(x => x.Count)
            .Take(5)
            .ToList();

        var vm = new DashboardViewModel
        {
            ProductCount = products.Count,
            ActiveProductCount = products.Count(p => p.Status == ProductStatus.Active),
            CategoryCount = await _db.Categories.CountAsync(),
            QuoteCount = quotes.Count,
            PendingQuoteCount = quotes.Count(q => q.Status == QuoteStatus.Pending),
            InSeasonCount = products.Count(p => p.IsInSeason(month)),
            RecentQuotes = quotes.Take(5).ToList(),
            QuotesByProduct = byProduct,
        };
        return View("Dashboard", vm);
    }

    [HttpGet("bao-gia")]
    public async Task<IActionResult> Quotes(QuoteStatus? status)
    {
        var query = _db.Quotes.Include(q => q.Items).ThenInclude(i => i.Product).AsQueryable();
        if (status.HasValue) query = query.Where(q => q.Status == status.Value);
        ViewBag.StatusFilter = status;
        var quotes = await query.OrderByDescending(q => q.CreatedAt).ToListAsync();
        return View(quotes);
    }

    [HttpGet("bao-gia/{id:int}")]
    public async Task<IActionResult> QuoteDetail(int id)
    {
        var quote = await _db.Quotes
            .Include(q => q.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(q => q.Id == id);
        if (quote == null) return NotFound();
        return View(quote);
    }

    [HttpPost("bao-gia/{id:int}/trang-thai")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ChangeQuoteStatus(int id, QuoteStatus status)
    {
        var quote = await _db.Quotes.FindAsync(id);
        if (quote == null) return NotFound();
        quote.Status = status;
        await _db.SaveChangesAsync();
        TempData["AdminToast"] = $"Đã cập nhật trạng thái báo giá {quote.Code} → {status}.";
        return RedirectToAction(nameof(QuoteDetail), new { id });
    }
}
