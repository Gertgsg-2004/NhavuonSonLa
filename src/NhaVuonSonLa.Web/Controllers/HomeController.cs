using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhaVuonSonLa.Web.Data;
using NhaVuonSonLa.Web.Models;

namespace NhaVuonSonLa.Web.Controllers;

public class HomeController : Controller
{
    private readonly AppDbContext _db;

    public HomeController(AppDbContext db) => _db = db;

    public async Task<IActionResult> Index()
    {
        var month = DateTime.Now.Month;
        var visible = _db.Products.Include(p => p.PriceTiers).Where(p => p.Status != ProductStatus.Hidden);

        var all = await visible.ToListAsync();
        var model = new HomeViewModel
        {
            CurrentMonth = month,
            Featured = all.Where(p => p.IsFeatured).Take(4).ToList(),
            InSeason = all.Where(p => p.IsInSeason(month)).Take(4).ToList(),
            Reviews = await _db.Reviews.OrderBy(r => r.SortOrder).ToListAsync(),
            Posts = await _db.Posts.OrderByDescending(p => p.PublishedAt).Take(3).ToListAsync(),
        };
        return View(model);
    }

    [Route("gioi-thieu")]
    public IActionResult GioiThieu() => View();

    [Route("lien-he")]
    public IActionResult LienHe() => View();

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error() =>
        View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
}
