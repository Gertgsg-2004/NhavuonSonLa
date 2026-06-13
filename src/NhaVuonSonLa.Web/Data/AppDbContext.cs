using Microsoft.EntityFrameworkCore;
using NhaVuonSonLa.Web.Models;

namespace NhaVuonSonLa.Web.Data;

/// <summary>
/// Ngữ cảnh cơ sở dữ liệu (EF Core). Dùng SQLite — file nhavuonsonla.db tự tạo
/// khi chạy, không cần cài server database nào cả.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<PriceTier> PriceTiers => Set<PriceTier>();
    public DbSet<Quote> Quotes => Set<Quote>();
    public DbSet<QuoteItem> QuoteItems => Set<QuoteItem>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Post> Posts => Set<Post>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Category>().HasIndex(c => c.Slug).IsUnique();
        b.Entity<Product>().HasIndex(p => p.Slug).IsUnique();

        // SQLite không có kiểu decimal gốc — khai báo độ chính xác cho tiền/khối lượng
        foreach (var prop in b.Model.GetEntityTypes()
                     .SelectMany(t => t.GetProperties())
                     .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            prop.SetColumnType("decimal(14,2)");
        }
    }
}
