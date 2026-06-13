using System.Globalization;

namespace NhaVuonSonLa.Web.Helpers;

/// <summary>
/// Định dạng tiền tệ và khối lượng kiểu Việt Nam. Cố ý KHÔNG phụ thuộc
/// CultureInfo("vi-VN") (có thể thiếu trên một số máy Linux/InvariantGlobalization)
/// — tự chèn dấu chấm phân cách hàng nghìn để chạy đúng ở mọi nơi.
/// </summary>
public static class Format
{
    public static string Vnd(decimal amount)
    {
        long n = (long)Math.Round(amount, MidpointRounding.AwayFromZero);
        return ThousandsDot(n) + "đ";
    }

    public static string Quantity(decimal kg)
    {
        if (kg >= 1000)
        {
            var tons = kg / 1000m;
            return Trim(tons) + " tấn";
        }
        return Trim(kg) + "kg";
    }

    /// <summary>Chèn dấu chấm mỗi 3 chữ số: 27000 → "27.000".</summary>
    private static string ThousandsDot(long value)
    {
        var s = Math.Abs(value).ToString(CultureInfo.InvariantCulture);
        var groups = new List<string>();
        for (int i = s.Length; i > 0; i -= 3)
        {
            int start = Math.Max(0, i - 3);
            groups.Insert(0, s.Substring(start, i - start));
        }
        var result = string.Join(".", groups);
        return value < 0 ? "-" + result : result;
    }

    /// <summary>Bỏ phần thập phân thừa: 1,0 → "1"; 1,5 → "1,5".</summary>
    private static string Trim(decimal value)
    {
        if (value == Math.Truncate(value))
            return ThousandsDot((long)value);
        return value.ToString("0.#", CultureInfo.InvariantCulture).Replace('.', ',');
    }
}
