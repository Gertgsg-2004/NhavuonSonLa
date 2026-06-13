using System.ComponentModel.DataAnnotations;

namespace NhaVuonSonLa.Web.Models;

/// <summary>Danh mục sản phẩm (Xoài, Nhãn, Mận...).</summary>
public class Category
{
    public int Id { get; set; }

    [Required, MaxLength(120)]
    public string Name { get; set; } = "";

    [Required, MaxLength(120)]
    public string Slug { get; set; } = "";

    public int SortOrder { get; set; }

    public List<Product> Products { get; set; } = new();
}
