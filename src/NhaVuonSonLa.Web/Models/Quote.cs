using System.ComponentModel.DataAnnotations;

namespace NhaVuonSonLa.Web.Models;

/// <summary>Yêu cầu báo giá — thay cho "đơn mua ngay" của bán lẻ.</summary>
public class Quote
{
    public int Id { get; set; }

    [MaxLength(20)]
    public string Code { get; set; } = "";   // BG-2026-00001

    [Required, MaxLength(120)]
    public string FullName { get; set; } = "";

    [MaxLength(160)]
    public string? CompanyName { get; set; }

    [Required, MaxLength(20)]
    public string Phone { get; set; } = "";

    [MaxLength(160)]
    public string? Email { get; set; }

    public string? Note { get; set; }

    public QuoteStatus Status { get; set; } = QuoteStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public List<QuoteItem> Items { get; set; } = new();
}
