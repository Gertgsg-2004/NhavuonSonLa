using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhaVuonSonLa.Web.Data;

namespace NhaVuonSonLa.Web.Controllers;

/// <summary>
/// Trang quản trị tối giản: xem các yêu cầu báo giá khách gửi.
/// (Giai đoạn sau: thêm đăng nhập, định giá, chuyển đơn, quản lý sản phẩm/kho...)
/// </summary>
[Route("quan-tri")]
public class AdminController : Controller
{
    private readonly AppDbContext _db;

    public AdminController(AppDbContext db) => _db = db;

    [HttpGet("")]
    public IActionResult Index() => RedirectToAction(nameof(Quotes));

    [HttpGet("bao-gia")]
    public async Task<IActionResult> Quotes()
    {
        var quotes = await _db.Quotes
            .Include(q => q.Items).ThenInclude(i => i.Product)
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();
        return View(quotes);
    }
}
