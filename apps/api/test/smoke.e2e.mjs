// Smoke test toàn bộ luồng nghiệp vụ B2B: giá theo vai trò → báo giá → đơn hàng → kho → công nợ
//
// Yêu cầu: CSDL VỪA SEED MỚI (số liệu kỳ vọng khớp dữ liệu seed) + API đang chạy.
//   docker compose up -d postgres
//   cd apps/api && pnpm prisma:migrate && pnpm prisma:seed && pnpm start:dev
//   node test/smoke.e2e.mjs
//
// Lưu ý: test tạo báo giá/đơn hàng thật trong CSDL — chỉ chạy trên môi trường dev.
const API = process.env.API_URL ?? 'http://localhost:3001/api/v1';
let pass = 0, fail = 0;

function check(name, cond, extra = '') {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name} ${extra}`); }
}

async function req(method, path, { token, body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
}

// ---------- 1. Khách vãng lai: ẩn/hiện giá ----------
console.log('\n1. Khách vãng lai — quy tắc lộ giá');
const xoaiGuest = (await req('GET', '/products/xoai-tron-yen-chau')).json;
check('Xoài (isPriceVisible=true): thấy giá lẻ', Number(xoaiGuest.retailPrice) === 35000);
check('Xoài: thấy bảng giá bậc (5 bậc)', xoaiGuest.priceTiers?.length === 5);
check('Xoài: KHÔNG thấy giá nền đại lý', xoaiGuest.dealerPrice === null);
check('Xoài: KHÔNG thấy tồn kho nội bộ', xoaiGuest.stockQuantity === undefined);

const dauGuest = (await req('GET', '/products/dau-tay-hana-moc-chau')).json;
check('Dâu tây (ẩn giá): priceOnRequest=true', dauGuest.priceOnRequest === true);
check('Dâu tây: giá lẻ bị ẩn', dauGuest.retailPrice === null);
check('Dâu tây: bảng giá bậc bị ẩn', dauGuest.priceTiers?.length === 0);

const pricingGuest = (await req('GET', '/products/xoai-tron-yen-chau/pricing?quantity=500')).json;
check('Giá bậc 500kg = 27.000đ (khách lẻ, không chiết khấu)', pricingGuest.unitPrice === 27000,
  `→ ${JSON.stringify(pricingGuest)}`);

const filt = (await req('GET', '/products?certification=GLOBALGAP')).json;
check('Lọc theo GlobalGAP ra 2 sản phẩm', filt.data?.length === 2);
const filtExport = (await req('GET', '/products?export=true')).json;
check('Lọc hàng xuất khẩu ra 4 sản phẩm', filtExport.data?.length === 4);

// ---------- 2. Đại lý: giá + chiết khấu riêng ----------
console.log('\n2. Đại lý — đăng nhập, chiết khấu riêng 3%');
const dealerLogin = (await req('POST', '/auth/login', {
  body: { email: 'daily@example.com', password: 'Dealer@123' },
})).json;
check('Đăng nhập đại lý có accessToken', !!dealerLogin.accessToken);
const dealerToken = dealerLogin.accessToken;

const dauDealer = (await req('GET', '/products/dau-tay-hana-moc-chau', { token: dealerToken })).json;
check('Đại lý thấy giá dâu tây (dù ẩn với khách lẻ)', Number(dauDealer.retailPrice) === 180000);
check('Đại lý thấy bảng giá bậc dâu tây', dauDealer.priceTiers?.length === 4);

const pricingDealer = (await req('GET', '/products/xoai-tron-yen-chau/pricing?quantity=500', { token: dealerToken })).json;
check('Giá đại lý 500kg = 26.200đ (27.000 − 3%, làm tròn 100đ)', pricingDealer.unitPrice === 26200,
  `→ ${JSON.stringify(pricingDealer)}`);
check('Trả về discountRate=3', Number(pricingDealer.discountRate) === 3);

const tooSmall = await req('GET', '/products/xoai-tron-yen-chau/pricing?quantity=3');
check('Dưới khối lượng tối thiểu → 422', tooSmall.status === 422);

// ---------- 3. Báo giá ----------
console.log('\n3. Luồng báo giá: gửi → định giá → chuyển đơn');
// Dùng 2 sản phẩm ĐANG VÀO MÙA (có tồn kho) — sản phẩm hết mùa sẽ bị chặn
// đúng nghiệp vụ ở bước giữ chỗ tồn kho khi CONFIRMED.
const man = (await req('GET', '/products/man-hau-moc-chau')).json;
const quote = (await req('POST', '/quotes', {
  token: dealerToken,
  body: {
    fullName: 'Trần Thị Đại Lý',
    companyName: 'Cty TNHH Trái Cây Miền Bắc',
    phone: '0987654321',
    note: 'Giao chợ Long Biên trước 5h sáng',
    items: [
      { productId: xoaiGuest.id, quantity: 500, note: 'Loại 1' },
      { productId: man.id, quantity: 50 },
    ],
  },
})).json;
check('Tạo báo giá có mã BG-', quote.code?.startsWith('BG-'), `→ ${JSON.stringify(quote).slice(0, 200)}`);
check('Báo giá gắn đúng customer của đại lý', !!quote.customerId);

const guestQuote = (await req('POST', '/quotes', {
  body: {
    fullName: 'Khách Vãng Lai', phone: '0911222333',
    items: [{ productId: xoaiGuest.id, quantity: 100 }],
  },
})).json;
check('Khách vãng lai (không token) cũng gửi được báo giá', guestQuote.code?.startsWith('BG-'));

// Staff đăng nhập
const staffLogin = (await req('POST', '/auth/login', {
  body: { email: 'nhanvien@nhavuonsonla.vn', password: 'Staff@123' },
})).json;
const staffToken = staffLogin.accessToken;
check('Đăng nhập nhân viên', !!staffToken);

const dealerQuotes = (await req('GET', '/quotes', { token: dealerToken })).json;
check('Đại lý chỉ thấy báo giá của mình', dealerQuotes.data?.every((q) => q.customerId === quote.customerId));
const staffQuotes = (await req('GET', '/quotes', { token: staffToken })).json;
check('Staff thấy tất cả báo giá (≥2)', staffQuotes.data?.length >= 2);

// Đại lý không được định giá
const forbidden = await req('PATCH', `/quotes/${quote.id}`, { token: dealerToken, body: { internalNote: 'hack' } });
check('Đại lý PATCH báo giá → 403', forbidden.status === 403);

// Staff định giá từng dòng
const priced = (await req('PATCH', `/quotes/${quote.id}`, {
  token: staffToken,
  body: {
    items: quote.items.map((i) => ({ id: i.id, quotedPrice: i.productId === xoaiGuest.id ? 26000 : 40000 })),
    validUntil: '2026-06-20T00:00:00.000Z',
  },
})).json;
check('Định giá xong → status QUOTED', priced.status === 'QUOTED');
check('Tổng báo giá = 500×26.000 + 50×40.000 = 15tr', Number(priced.totalQuoted) === 15_000_000,
  `→ ${priced.totalQuoted}`);

// Chuyển thành đơn
const order = (await req('POST', `/quotes/${quote.id}/convert`, { token: staffToken })).json;
check('Chuyển đơn có mã DH-', order.code?.startsWith('DH-'), `→ ${JSON.stringify(order).slice(0, 200)}`);
check('Đơn ở trạng thái QUOTED', order.status === 'QUOTED');

const reconvert = await req('POST', `/quotes/${quote.id}/convert`, { token: staffToken });
check('Chuyển đơn lần 2 → 422', reconvert.status === 422);

// ---------- 4. Máy trạng thái đơn + kho ----------
console.log('\n4. Máy trạng thái đơn hàng + trừ kho + công nợ');
const badJump = await req('PATCH', `/orders/${order.id}/status`, {
  token: staffToken, body: { status: 'SHIPPING' },
});
check('QUOTED → SHIPPING (nhảy cóc) → 422', badJump.status === 422);

const confirmed = (await req('PATCH', `/orders/${order.id}/status`, {
  token: staffToken, body: { status: 'CONFIRMED' },
})).json;
check('QUOTED → CONFIRMED ok', confirmed.status === 'CONFIRMED');

for (const next of ['HARVESTING', 'PACKING', 'SHIPPING', 'COMPLETED']) {
  const r = (await req('PATCH', `/orders/${order.id}/status`, {
    token: staffToken, body: { status: next },
  })).json;
  check(`→ ${next}`, r.status === next, `→ ${JSON.stringify(r).slice(0, 200)}`);
}

const finalOrder = (await req('GET', `/orders/${order.id}`, { token: staffToken })).json;
check('Lịch sử trạng thái đủ 6 bước', finalOrder.statusHistory?.length === 6,
  `→ ${finalOrder.statusHistory?.length}`);

const xoaiStaff = (await req('GET', '/products/xoai-tron-yen-chau', { token: staffToken })).json;
check('Tồn kho xoài giảm 5000 → 4500 sau khi giao', Number(xoaiStaff.stockQuantity) === 4500,
  `→ ${xoaiStaff.stockQuantity}`);

const me = (await req('GET', '/auth/me', { token: dealerToken })).json;
check('Công nợ khách tăng 15tr (chưa thanh toán)', Number(me.customer?.currentDebt) === 15_000_000,
  `→ ${me.customer?.currentDebt}`);

// Ghi nhận thanh toán trả nợ
const paid = (await req('POST', `/orders/${order.id}/payments`, {
  token: staffToken,
  body: { amount: 15_000_000, method: 'BANK_TRANSFER', type: 'DEBT_PAYMENT' },
})).json;
check('Ghi nhận thanh toán → PAID', paid.paymentStatus === 'PAID', `→ ${JSON.stringify(paid).slice(0, 150)}`);
const me2 = (await req('GET', '/auth/me', { token: dealerToken })).json;
check('Công nợ về 0 sau khi trả', Number(me2.customer?.currentDebt) === 0, `→ ${me2.customer?.currentDebt}`);

// ---------- 5. Dashboard + phân quyền ----------
console.log('\n5. Dashboard + phân quyền');
const dashNoAuth = await req('GET', '/admin/dashboard/summary');
check('Dashboard không token → 401', dashNoAuth.status === 401);
const dashDealer = await req('GET', '/admin/dashboard/summary', { token: dealerToken });
check('Dashboard bằng token đại lý → 403', dashDealer.status === 403);
const dash = (await req('GET', '/admin/dashboard/summary', { token: staffToken })).json;
check('Doanh thu tháng = 15tr', dash.revenueThisMonth === 15_000_000, `→ ${JSON.stringify(dash)}`);
const top = (await req('GET', '/admin/dashboard/top-products', { token: staffToken })).json;
check('Top sản phẩm có dữ liệu', Array.isArray(top) && top.length >= 1);

console.log(`\n========== KẾT QUẢ: ${pass} pass / ${fail} fail ==========`);
process.exit(fail > 0 ? 1 : 0);
