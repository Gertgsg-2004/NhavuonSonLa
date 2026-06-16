using System.ComponentModel.DataAnnotations;

namespace NhaVuonSonLa.Web.Models;

/// <summary>Tài khoản đăng nhập hệ thống (admin/nhân viên/đại lý).</summary>
public class AppUser
{
    public int Id { get; set; }

    [Required, MaxLength(160)]
    public string Email { get; set; } = "";

    [Required]
    public string PasswordHash { get; set; } = "";

    [MaxLength(120)]
    public string FullName { get; set; } = "";

    public UserRole Role { get; set; } = UserRole.Staff;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
