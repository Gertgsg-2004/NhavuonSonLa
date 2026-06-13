using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NhaVuonSonLa.Web.Data;

namespace NhaVuonSonLa.Web.Controllers;

[Route("tin-tuc")]
public class NewsController : Controller
{
    private readonly AppDbContext _db;

    public NewsController(AppDbContext db) => _db = db;

    [HttpGet("")]
    public async Task<IActionResult> Index() =>
        View(await _db.Posts.OrderByDescending(p => p.PublishedAt).ToListAsync());

    [HttpGet("{slug}")]
    public async Task<IActionResult> Detail(string slug)
    {
        var post = await _db.Posts.FirstOrDefaultAsync(p => p.Slug == slug);
        if (post == null) return NotFound();
        ViewBag.Others = await _db.Posts.Where(p => p.Slug != slug).ToListAsync();
        return View(post);
    }
}
