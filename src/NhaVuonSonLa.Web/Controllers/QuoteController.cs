using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhaVuonSonLa.Web.Data;
using NhaVuonSonLa.Web.Models;
using NhaVuonSonLa.Web.Services;

namespace NhaVuonSonLa.Web.Controllers;

/// <summary>Giỏ báo giá + gửi yêu cầu báo giá — luồng nghiệp vụ trung tâm.</summary>
[Route("bao-gia")]
public class QuoteController : Controller
{
    private readonly AppDbContext _db;
    private readonly QuoteCart _cart;

    public QuoteController(AppDbContext db, QuoteCart cart)
    {
        _db = db;
        _cart = cart;
    }

    [HttpGet("")]
    public IActionResult Index() => View(_cart.Items);

    [HttpPost("them")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Add(int productId, decimal quantity)
    {
        var p = await _db.Products.FindAsync(productId);
        if (p == null) return NotFound();

        _cart.Add(new QuoteCartItem
        {
            ProductId = p.Id,
            Name = p.Name,
            Slug = p.Slug,
            Unit = p.Unit,
            Quantity = quantity > 0 ? quantity : p.MinOrderQuantity,
            MinOrderQuantity = p.MinOrderQuantity,
            Emoji = p.Emoji,
            Gradient = p.Gradient,
        });
        TempData["Toast"] = $"Đã thêm \"{p.Name}\" vào giỏ báo giá.";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("cap-nhat")]
    [ValidateAntiForgeryToken]
    public IActionResult Update(int productId, decimal quantity)
    {
        _cart.UpdateQuantity(productId, quantity);
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("xoa")]
    [ValidateAntiForgeryToken]
    public IActionResult Remove(int productId)
    {
        _cart.Remove(productId);
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("gui")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Submit(QuoteRequestForm form)
    {
        var items = _cart.Items;
        if (items.Count == 0)
        {
            ModelState.AddModelError("", "Giỏ báo giá đang trống.");
            return View("Index", items);
        }
        if (string.IsNullOrWhiteSpace(form.FullName) || string.IsNullOrWhiteSpace(form.Phone))
        {
            ModelState.AddModelError("", "Vui lòng nhập họ tên và số điện thoại.");
            return View("Index", items);
        }

        var noteParts = new[]
        {
            string.IsNullOrWhiteSpace(form.DeliveryDate) ? null : $"Ngày giao mong muốn: {form.DeliveryDate}",
            string.IsNullOrWhiteSpace(form.DeliveryAddress) ? null : $"Địa điểm giao: {form.DeliveryAddress}",
            form.Note,
        }.Where(s => !string.IsNullOrWhiteSpace(s));

        var year = DateTime.Now.Year;
        var seq = await _db.Quotes.CountAsync(q => q.CreatedAt.Year == year) + 1;

        var quote = new Quote
        {
            Code = $"BG-{year}-{seq:D5}",
            FullName = form.FullName.Trim(),
            CompanyName = form.CompanyName?.Trim(),
            Phone = form.Phone.Trim(),
            Email = form.Email?.Trim(),
            Note = string.Join("\n", noteParts),
            Items = items.Select(i => new QuoteItem
            {
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                Unit = i.Unit,
                Note = i.Note,
            }).ToList(),
        };
        _db.Quotes.Add(quote);
        await _db.SaveChangesAsync();
        _cart.Clear();

        return RedirectToAction(nameof(Success), new { code = quote.Code });
    }

    [HttpGet("hoan-tat")]
    public IActionResult Success(string code)
    {
        ViewBag.Code = code;
        return View();
    }
}
