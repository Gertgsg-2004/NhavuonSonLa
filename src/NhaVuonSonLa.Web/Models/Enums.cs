namespace NhaVuonSonLa.Web.Models;

/// <summary>Trạng thái sản phẩm hiển thị trên web.</summary>
public enum ProductStatus
{
    Active,      // Đang bán
    Hidden,      // Ẩn
    OutOfSeason  // Hết mùa — vẫn hiện, cho đặt trước vụ sau
}

/// <summary>Trạng thái yêu cầu báo giá (luồng nghiệp vụ trung tâm).</summary>
public enum QuoteStatus
{
    Pending,    // Khách vừa gửi
    Processing, // Nhân viên đang xử lý
    Quoted,     // Đã báo giá
    Accepted,   // Khách đồng ý
    Converted   // Đã chuyển thành đơn hàng
}

/// <summary>Nhóm khách hàng B2B.</summary>
public enum CustomerType
{
    DaiLy,      // Đại lý
    CuaHang,    // Cửa hàng trái cây
    SieuThi,    // Siêu thị
    ThuongLai,  // Thương lái
    ChoDauMoi,  // Chợ đầu mối
    NhaHang,    // Nhà hàng
    XuatKhau    // Công ty xuất khẩu
}

/// <summary>Vai trò tài khoản hệ thống.</summary>
public enum UserRole
{
    Admin,   // Toàn quyền
    Staff,   // Nhân viên: đơn, báo giá, kho
    Dealer   // Đại lý
}
