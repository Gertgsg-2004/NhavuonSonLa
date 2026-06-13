using System.ComponentModel.DataAnnotations;

namespace NhaVuonSonLa.Web.Models;

/// <summary>Cảm nhận/đánh giá của khách hàng (hiển thị trang chủ).</summary>
public class Review
{
    public int Id { get; set; }

    [MaxLength(120)]
    public string AuthorName { get; set; } = "";

    [MaxLength(160)]
    public string CompanyName { get; set; } = "";

    public string Content { get; set; } = "";

    public int Rating { get; set; } = 5;

    public int SortOrder { get; set; }
}

/// <summary>Tin tức / bài viết SEO (kỹ thuật trồng, mùa vụ, xuất khẩu, giá thị trường).</summary>
public class Post
{
    public int Id { get; set; }

    [MaxLength(200)]
    public string Title { get; set; } = "";

    [MaxLength(200)]
    public string Slug { get; set; } = "";

    [MaxLength(400)]
    public string Excerpt { get; set; } = "";

    public string Content { get; set; } = "";

    [MaxLength(60)]
    public string CategoryLabel { get; set; } = "Tin tức";

    public DateTime PublishedAt { get; set; } = DateTime.Now;
}
