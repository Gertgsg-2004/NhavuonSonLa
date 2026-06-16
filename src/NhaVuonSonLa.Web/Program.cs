using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using NhaVuonSonLa.Web.Data;
using NhaVuonSonLa.Web.Services;

var builder = WebApplication.CreateBuilder(args);

// MVC (Controllers + Razor Views)
builder.Services.AddControllersWithViews();

// Đăng nhập bằng cookie — bảo vệ khu vực quản trị /quan-tri
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(o =>
    {
        o.LoginPath = "/dang-nhap";
        o.AccessDeniedPath = "/dang-nhap";
        o.ExpireTimeSpan = TimeSpan.FromHours(8);
    });

// Cơ sở dữ liệu SQLite — file tự tạo, KHÔNG cần cài server database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default")
                      ?? "Data Source=nhavuonsonla.db"));

// Giỏ báo giá lưu trong Session
builder.Services.AddHttpContextAccessor();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(o =>
{
    o.IdleTimeout = TimeSpan.FromDays(7);
    o.Cookie.HttpOnly = true;
    o.Cookie.IsEssential = true;
});
builder.Services.AddScoped<QuoteCart>();

var app = builder.Build();

// Tạo DB + nạp dữ liệu mẫu lần đầu chạy
using (var scope = app.Services.CreateScope())
{
    DbSeeder.Seed(scope.ServiceProvider.GetRequiredService<AppDbContext>());
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
}

app.UseStaticFiles();
app.UseRouting();
app.UseSession();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
