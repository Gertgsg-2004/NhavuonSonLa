/**
 * Dữ liệu mẫu: tài khoản, danh mục, sản phẩm đặc sản Sơn La,
 * giá bậc số lượng, mùa vụ, nông trại, kho, CMS.
 * Chạy: pnpm prisma:seed
 */
import { PrismaClient, CertificationType, PostCategory, PostStatus, SeasonStatus, UserRole, UserStatus, CustomerType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu...');

  // ---------- Người dùng ----------
  const [adminHash, staffHash, dealerHash] = await Promise.all([
    bcrypt.hash('Admin@123', 12),
    bcrypt.hash('Staff@123', 12),
    bcrypt.hash('Dealer@123', 12),
  ]);

  await prisma.user.upsert({
    where: { email: 'admin@nhavuonsonla.vn' },
    update: {},
    create: {
      email: 'admin@nhavuonsonla.vn',
      passwordHash: adminHash,
      fullName: 'Quản trị viên',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.user.upsert({
    where: { email: 'nhanvien@nhavuonsonla.vn' },
    update: {},
    create: {
      email: 'nhanvien@nhavuonsonla.vn',
      passwordHash: staffHash,
      fullName: 'Nguyễn Văn Kinh Doanh',
      phone: '0912000111',
      role: UserRole.STAFF,
      status: UserStatus.ACTIVE,
    },
  });

  const customer = await prisma.customer.upsert({
    where: { code: 'KH-0001' },
    update: {},
    create: {
      code: 'KH-0001',
      customerType: CustomerType.DAI_LY,
      companyName: 'Công ty TNHH Trái Cây Miền Bắc',
      taxCode: '0101234567',
      contactName: 'Trần Thị Đại Lý',
      phone: '0987654321',
      email: 'daily@example.com',
      address: 'Chợ đầu mối Long Biên, Hà Nội',
      province: 'Hà Nội',
      creditLimit: 200_000_000,
      paymentTermDays: 15,
      discountRate: 3,
    },
  });

  await prisma.user.upsert({
    where: { email: 'daily@example.com' },
    update: {},
    create: {
      email: 'daily@example.com',
      passwordHash: dealerHash,
      fullName: 'Trần Thị Đại Lý',
      phone: '0987654321',
      role: UserRole.DEALER,
      status: UserStatus.ACTIVE,
      customerId: customer.id,
    },
  });

  // ---------- Nông trại ----------
  const farmYenChau = await prisma.farm.upsert({
    where: { slug: 'vuon-yen-chau' },
    update: {},
    create: {
      name: 'Nhà vườn Yên Châu',
      slug: 'vuon-yen-chau',
      region: 'Yên Châu, Sơn La',
      areaHectares: 12.5,
      description: 'Vùng trồng xoài tròn bản địa và chuối tiêu hồng dọc quốc lộ 6, đạt chuẩn VietGAP từ 2019.',
    },
  });

  const farmMocChau = await prisma.farm.upsert({
    where: { slug: 'vuon-moc-chau' },
    update: {},
    create: {
      name: 'Nhà vườn Mộc Châu',
      slug: 'vuon-moc-chau',
      region: 'Mộc Châu, Sơn La',
      areaHectares: 20,
      description: 'Cao nguyên 1.050m: mận hậu, dâu tây, bơ, hồng giòn khí hậu ôn đới mát quanh năm.',
    },
  });

  const farmSongMa = await prisma.farm.upsert({
    where: { slug: 'vuon-song-ma' },
    update: {},
    create: {
      name: 'Nhà vườn Sông Mã',
      slug: 'vuon-song-ma',
      region: 'Sông Mã, Sơn La',
      areaHectares: 15,
      description: 'Thủ phủ nhãn miền Bắc với hơn 7.500ha nhãn, có mã số vùng trồng xuất khẩu.',
    },
  });

  // ---------- Kho ----------
  const warehouse = await prisma.warehouse.findFirst({ where: { name: 'Kho tổng Mai Sơn' } })
    ?? await prisma.warehouse.create({
      data: { name: 'Kho tổng Mai Sơn', address: 'QL6, Mai Sơn, Sơn La', capacityKg: 50_000 },
    });

  // ---------- Danh mục & sản phẩm ----------
  type SeedProduct = {
    name: string; slug: string; sku: string; farmId: string;
    region: string; origin: string; harvestPeriod: string;
    startMonth: number; endMonth: number; peakMonth: number;
    retailPrice: number; tiers: [number, number][]; // [minQty, price]
    isPriceVisible: boolean; isFeatured: boolean; isExport: boolean;
    cert: CertificationType; short: string;
  };

  const catalog: { category: string; slug: string; products: SeedProduct[] }[] = [
    {
      category: 'Xoài', slug: 'xoai',
      products: [{
        name: 'Xoài tròn Yên Châu', slug: 'xoai-tron-yen-chau', sku: 'XYC-01', farmId: farmYenChau.id,
        region: 'Yên Châu', origin: 'Giống bản địa Yên Châu (chỉ dẫn địa lý)', harvestPeriod: 'Tháng 5 – 8',
        startMonth: 5, endMonth: 8, peakMonth: 6,
        retailPrice: 35_000, tiers: [[10, 35_000], [50, 32_000], [100, 30_000], [500, 27_000], [1000, 25_000]],
        isPriceVisible: true, isFeatured: true, isExport: true, cert: CertificationType.VIETGAP,
        short: 'Xoài tròn bản địa thơm đậm, vỏ xanh thịt vàng, được bảo hộ chỉ dẫn địa lý Yên Châu.',
      }, {
        name: 'Xoài tượng da xanh', slug: 'xoai-tuong-da-xanh', sku: 'XTX-01', farmId: farmYenChau.id,
        region: 'Yên Châu', origin: 'Giống Đài Loan ghép', harvestPeriod: 'Tháng 5 – 9',
        startMonth: 5, endMonth: 9, peakMonth: 7,
        retailPrice: 28_000, tiers: [[10, 28_000], [100, 24_000], [500, 21_000], [1000, 19_000]],
        isPriceVisible: true, isFeatured: false, isExport: true, cert: CertificationType.GLOBALGAP,
        short: 'Quả to 0,8–1,2kg, ít xơ, chuyên hàng xuất khẩu Trung Quốc và chế biến.',
      }],
    },
    {
      category: 'Nhãn', slug: 'nhan',
      products: [{
        name: 'Nhãn Sông Mã', slug: 'nhan-song-ma', sku: 'NSM-01', farmId: farmSongMa.id,
        region: 'Sông Mã', origin: 'Nhãn miền thiết ghép cải tạo', harvestPeriod: 'Tháng 7 – 9',
        startMonth: 7, endMonth: 9, peakMonth: 8,
        retailPrice: 40_000, tiers: [[10, 40_000], [50, 36_000], [100, 33_000], [500, 30_000], [1000, 27_000]],
        isPriceVisible: true, isFeatured: true, isExport: true, cert: CertificationType.VIETGAP,
        short: 'Cùi dày, hạt nhỏ, ngọt sắc — vùng trồng có mã số xuất khẩu chính ngạch.',
      }],
    },
    {
      category: 'Mận', slug: 'man',
      products: [{
        name: 'Mận hậu Mộc Châu', slug: 'man-hau-moc-chau', sku: 'MMC-01', farmId: farmMocChau.id,
        region: 'Mộc Châu', origin: 'Mận hậu cao nguyên', harvestPeriod: 'Tháng 5 – 7',
        startMonth: 5, endMonth: 7, peakMonth: 6,
        retailPrice: 45_000, tiers: [[10, 45_000], [50, 40_000], [100, 36_000], [500, 32_000]],
        isPriceVisible: true, isFeatured: true, isExport: false, cert: CertificationType.VIETGAP,
        short: 'Mận hậu trái to giòn ngọt, hàng tuyển size 18–22 quả/kg.',
      }],
    },
    {
      category: 'Dâu tây', slug: 'dau-tay',
      products: [{
        name: 'Dâu tây Hana Mộc Châu', slug: 'dau-tay-hana-moc-chau', sku: 'DMC-01', farmId: farmMocChau.id,
        region: 'Mộc Châu', origin: 'Giống Hana Nhật Bản', harvestPeriod: 'Tháng 12 – 4',
        startMonth: 12, endMonth: 4, peakMonth: 2,
        retailPrice: 180_000, tiers: [[5, 180_000], [20, 160_000], [50, 145_000], [100, 130_000]],
        isPriceVisible: false, isFeatured: true, isExport: false, cert: CertificationType.ORGANIC,
        short: 'Dâu Hana trồng nhà màng hữu cơ, hái buổi sớm giao trong ngày.',
      }],
    },
    {
      category: 'Chanh leo', slug: 'chanh-leo',
      products: [{
        name: 'Chanh leo tím Sơn La', slug: 'chanh-leo-tim-son-la', sku: 'CLT-01', farmId: farmMocChau.id,
        region: 'Mộc Châu', origin: 'Giống Đài Nông 1', harvestPeriod: 'Quanh năm, rộ tháng 6 – 11',
        startMonth: 6, endMonth: 11, peakMonth: 9,
        retailPrice: 25_000, tiers: [[10, 25_000], [100, 21_000], [500, 18_000], [1000, 16_000]],
        isPriceVisible: true, isFeatured: false, isExport: true, cert: CertificationType.GLOBALGAP,
        short: 'Chanh leo quả tím đạt chuẩn xuất khẩu châu Âu, độ chua ổn định.',
      }],
    },
    {
      category: 'Na', slug: 'na',
      products: [{
        name: 'Na sầu riêng Mai Sơn', slug: 'na-sau-rieng-mai-son', sku: 'NMS-01', farmId: farmYenChau.id,
        region: 'Mai Sơn', origin: 'Na sầu riêng (na Thái ghép)', harvestPeriod: 'Tháng 8 – 11',
        startMonth: 8, endMonth: 11, peakMonth: 9,
        retailPrice: 90_000, tiers: [[10, 90_000], [50, 82_000], [100, 75_000], [500, 68_000]],
        isPriceVisible: false, isFeatured: true, isExport: false, cert: CertificationType.VIETGAP,
        short: 'Quả 0,7–1,5kg, thịt dai ngọt thanh, hàng tuyển biếu tặng và siêu thị.',
      }],
    },
  ];

  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  for (const [ci, cat] of catalog.entries()) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.category, slug: cat.slug, sortOrder: ci, seoTitle: `${cat.category} Sơn La giá sỉ tại vườn` },
    });

    for (const p of cat.products) {
      const inSeason = p.startMonth <= p.endMonth
        ? month >= p.startMonth && month <= p.endMonth
        : month >= p.startMonth || month <= p.endMonth; // vụ vắt qua năm (dâu tây)

      const product = await prisma.product.upsert({
        where: { slug: p.slug },
        update: {},
        create: {
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          categoryId: category.id,
          farmId: p.farmId,
          shortDescription: p.short,
          description: `${p.short}\n\n**Nguồn gốc:** ${p.origin}.\n\n**Vùng trồng:** ${p.region}, Sơn La.\n\n**Thời gian thu hoạch:** ${p.harvestPeriod}.\n\nQuy cách: thùng giấy 10kg hoặc sọt nhựa 20kg theo yêu cầu; hỗ trợ đóng hàng xuất khẩu.`,
          origin: p.origin,
          growingRegion: p.region,
          harvestPeriod: p.harvestPeriod,
          unit: 'kg',
          minOrderQuantity: 10,
          retailPrice: p.retailPrice,
          wholesalePrice: p.tiers[Math.floor(p.tiers.length / 2)][1],
          dealerPrice: p.tiers[p.tiers.length - 1][1],
          isPriceVisible: p.isPriceVisible,
          stockQuantity: inSeason ? 5000 : 0,
          isFeatured: p.isFeatured,
          isExportQuality: p.isExport,
          status: inSeason ? 'ACTIVE' : 'OUT_OF_SEASON',
          seoTitle: `${p.name} — giá sỉ tại vườn | Nhà Vườn Sơn La`,
          seoDescription: p.short,
          priceTiers: {
            create: p.tiers.map(([minQuantity, price]) => ({
              minQuantity,
              price,
              label: minQuantity >= 1000 ? `Từ ${minQuantity / 1000} tấn` : `Từ ${minQuantity}kg`,
            })),
          },
          seasons: {
            create: {
              name: `Vụ ${p.name} ${year}`,
              year,
              startMonth: p.startMonth,
              endMonth: p.endMonth,
              peakMonth: p.peakMonth,
              region: p.region,
              estimatedYieldKg: 20_000,
              status: inSeason ? SeasonStatus.HARVESTING : SeasonStatus.UPCOMING,
            },
          },
          certifications: {
            create: { type: p.cert, name: `${p.cert} — ${p.name}`, issuedBy: 'Trung tâm kiểm định NN' },
          },
        },
      });

      // Tồn kho khởi tạo cho sản phẩm đang vào vụ
      if (inSeason) {
        const batch = await prisma.harvestBatch.create({
          data: {
            code: `${p.sku}-${year}${String(month).padStart(2, '0')}-01`,
            productId: product.id,
            farmId: p.farmId,
            harvestDate: new Date(),
            quantityKg: 5000,
            remainingKg: 5000,
            qualityGrade: 'A',
          },
        });
        await prisma.inventory.create({
          data: { warehouseId: warehouse.id, productId: product.id, batchId: batch.id, quantity: 5000 },
        });
        await prisma.inventoryLog.create({
          data: { productId: product.id, type: 'HARVEST_IN', quantity: 5000, note: `Nhập lô ${batch.code}` },
        });
      }
    }
  }

  // ---------- CMS ----------
  await prisma.banner.createMany({
    data: [
      { title: 'Trái cây sỉ từ cao nguyên Sơn La', imageUrl: '/images/banner-1.jpg', position: 'HOME_HERO', sortOrder: 0 },
      { title: 'Mùa xoài Yên Châu 2026', imageUrl: '/images/banner-2.jpg', position: 'HOME_HERO', sortOrder: 1 },
    ],
    skipDuplicates: true,
  });

  await prisma.review.createMany({
    data: [
      { authorName: 'Anh Hùng', companyName: 'Vựa trái cây chợ Long Biên', content: 'Hàng đều, đóng sọt chắc chắn, xe về đúng giờ hẹn 4h sáng. Làm với vườn 3 vụ xoài rồi.', rating: 5, isApproved: true, sortOrder: 0 },
      { authorName: 'Chị Lan', companyName: 'Chuỗi cửa hàng Fruit House', content: 'Nhãn Sông Mã cùi dày, khách phản hồi tốt. Có chứng từ VietGAP đầy đủ để vào siêu thị.', rating: 5, isApproved: true, sortOrder: 1 },
      { authorName: 'Mr. Chen', companyName: 'Công ty XNK Hoa Quả Việt-Trung', content: 'Đóng container chuẩn kiểm dịch, mã vùng trồng rõ ràng, thông quan thuận lợi.', rating: 5, isApproved: true, sortOrder: 2 },
    ],
    skipDuplicates: true,
  });

  await prisma.faq.createMany({
    data: [
      { question: 'Đơn hàng tối thiểu là bao nhiêu?', answer: 'Tùy sản phẩm, thông thường từ 10kg với khách lẻ sỉ và từ 100kg để áp giá đại lý. Hàng container vui lòng liên hệ trước 7–10 ngày.', sortOrder: 0 },
      { question: 'Có hỗ trợ công nợ không?', answer: 'Đại lý hợp tác từ 3 đơn trở lên được xét hạn mức công nợ 7–30 ngày tùy quy mô.', sortOrder: 1 },
      { question: 'Phí vận chuyển tính thế nào?', answer: 'Xe tải nhà vườn tính theo km và tải trọng; đơn từ 2 tấn trong bán kính 300km được hỗ trợ 50% phí.', sortOrder: 2 },
      { question: 'Làm sao đặt hàng trước mùa vụ?', answer: 'Quý khách đặt cọc 20–30% giá trị dự kiến để giữ sản lượng; giá chốt theo thời điểm thu hoạch với mức trần đã thỏa thuận.', sortOrder: 3 },
    ],
    skipDuplicates: true,
  });

  await prisma.post.createMany({
    data: [
      {
        title: 'Lịch mùa vụ trái cây Sơn La 2026: tháng nào có gì?',
        slug: 'lich-mua-vu-trai-cay-son-la-2026',
        excerpt: 'Tổng hợp lịch thu hoạch xoài, nhãn, mận hậu, na, dâu tây... tại Sơn La để các đại lý chủ động kế hoạch nhập hàng.',
        content: 'Sơn La là vựa trái cây lớn nhất miền Bắc với hơn 80.000 ha cây ăn quả...',
        category: PostCategory.MUA_VU,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
        tags: ['mùa vụ', 'sơn la'],
      },
      {
        title: 'Quy trình xuất khẩu xoài Yên Châu sang Trung Quốc chính ngạch',
        slug: 'quy-trinh-xuat-khau-xoai-yen-chau',
        excerpt: 'Mã số vùng trồng, kiểm dịch thực vật, quy cách đóng thùng và những lưu ý khi xuất khẩu chính ngạch.',
        content: 'Từ 2022, xoài Yên Châu đã được cấp mã số vùng trồng xuất khẩu...',
        category: PostCategory.XUAT_KHAU,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
        tags: ['xuất khẩu', 'xoài'],
      },
      {
        title: 'Giá nhãn Sông Mã đầu vụ: nhận định thị trường tháng 7',
        slug: 'gia-nhan-song-ma-dau-vu',
        excerpt: 'Phân tích cung cầu và dự báo giá nhãn sỉ tại vườn cho thương lái, chợ đầu mối.',
        content: 'Sản lượng nhãn Sông Mã năm nay ước đạt...',
        category: PostCategory.GIA_THI_TRUONG,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
        tags: ['giá', 'nhãn'],
      },
    ],
    skipDuplicates: true,
  });

  const settings: [string, unknown, string][] = [
    ['site.hotline', '0888 000 999', 'contact'],
    ['site.email', 'kinhdoanh@nhavuonsonla.vn', 'contact'],
    ['site.zalo', 'https://zalo.me/0888000999', 'contact'],
    ['site.facebook', 'https://facebook.com/nhavuonsonla', 'contact'],
    ['site.address', 'Bản Áng, Đông Sang, Mộc Châu, Sơn La', 'contact'],
    ['site.map_embed', 'https://maps.google.com/?q=Moc+Chau+Son+La', 'contact'],
    ['site.bank_info', { bank: 'Vietcombank', account: '0123456789', holder: 'NHA VUON SON LA' }, 'payment'],
    ['quote.sla_hours', 2, 'general'],
  ];
  for (const [key, value, group] of settings) {
    await prisma.setting.upsert({
      where: { key },
      update: { value: value as object },
      create: { key, value: value as object, group },
    });
  }

  console.log('✅ Seed xong: 3 tài khoản, 6 danh mục, 7 sản phẩm + giá bậc + mùa vụ, 3 nông trại, kho, CMS.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
