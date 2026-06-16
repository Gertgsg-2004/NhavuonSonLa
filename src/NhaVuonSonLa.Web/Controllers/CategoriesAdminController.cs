using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhaVuonSonLa.Web.Data;
using NhaVuonSonLa.Web.Models;

namespace NhaVuonSonLa.Web.Controllers;

/// <summary>Quản lý danh mục sản phẩm.</summary>
[Authorize]
[Route("quan-tri/danh-muc")]
public class CategoriesAdminController : Controller
{
    private readonly AppDbContext _db;

    public CategoriesAdminController(AppDbContext db) => _db = db;

    [HttpGet("")]
    public async Task<IActionResult> Index()
    {
        var categories = await _db.Categories
            .Include(c => c.Products)
            .OrderBy(c => c.SortOrder)
            .ToListAsync();
        return View(categories);
    }

    [HttpPost("luu")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Save(int id, string name, int sortOrder)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            TempData["AdminToast"] = "Tên danh mục không được để trống.";
            return RedirectToAction(nameof(Index));
        }

        if (id == 0)
        {
            _db.Categories.Add(new Category
            {
                Name = name.Trim(),
                Slug = await UniqueSlug(name, null),
                SortOrder = sortOrder,
            });
            TempData["AdminToast"] = $"Đã thêm danh mục \"{name}\".";
        }
        else
        {
            var c = await _db.Categories.FindAsync(id);
            if (c == null) return NotFound();
            c.Name = name.Trim();
            c.SortOrder = sortOrder;
            TempData["AdminToast"] = $"Đã cập nhật danh mục \"{name}\".";
        }
        await _db.SaveChangesAsync();
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("xoa/{id:int}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        var c = await _db.Categories.Include(x => x.Products).FirstOrDefaultAsync(x => x.Id == id);
        if (c == null) return NotFound();
        if (c.Products.Any())
        {
            TempData["AdminToast"] = $"Không thể xóa \"{c.Name}\": còn {c.Products.Count} sản phẩm. Hãy chuyển/xóa sản phẩm trước.";
            return RedirectToAction(nameof(Index));
        }
        _db.Categories.Remove(c);
        await _db.SaveChangesAsync();
        TempData["AdminToast"] = $"Đã xóa danh mục \"{c.Name}\".";
        return RedirectToAction(nameof(Index));
    }

    private async Task<string> UniqueSlug(string name, int? excludeId)
    {
        var baseSlug = ProductsAdminController.Slugify(name);
        var slug = baseSlug;
        int n = 1;
        while (await _db.Categories.AnyAsync(c => c.Slug == slug && c.Id != excludeId))
            slug = $"{baseSlug}-{++n}";
        return slug;
    }
}
