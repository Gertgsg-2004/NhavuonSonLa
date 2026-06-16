using System.Security.Cryptography;
using System.Text;

namespace NhaVuonSonLa.Web.Services;

/// <summary>
/// Mã hóa mật khẩu một chiều (SHA-256 + salt). Đơn giản, không cần thư viện ngoài.
/// Production thực tế nên dùng PBKDF2/BCrypt; ở đây ưu tiên chạy được ngay.
/// </summary>
public static class PasswordHasher
{
    private const string Salt = "nhavuonsonla_salt_v1";

    public static string Hash(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password + Salt));
        return Convert.ToHexString(bytes);
    }

    public static bool Verify(string password, string hash) =>
        string.Equals(Hash(password), hash, StringComparison.OrdinalIgnoreCase);
}
