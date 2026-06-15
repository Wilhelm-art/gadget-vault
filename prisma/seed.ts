import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Mulai pembersihan database...');
  
  // Hapus data transaksi dan log terlebih dahulu karena ada foreign key constraints
  await prisma.adminLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.rentalPhoto.deleteMany();
  await prisma.rentalTransaction.deleteMany();
  await prisma.purchaseTransaction.deleteMany();
  await prisma.sellOfferImage.deleteMany();
  await prisma.sellOffer.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.productSpec.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.storeSettings.deleteMany();
  await prisma.user.deleteMany({ where: { role: 'admin' } });

  console.log('Database bersih. Mulai menyemai data...');

  // 1. Hash password untuk admin
  const adminPasswordHash = await bcrypt.hash('password123', 10);

  // 2. Buat Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gadgetvault.com' },
    update: {},
    create: {
      email: 'admin@gadgetvault.com',
      name: 'Admin GadgetVault',
      phone: '081234567890',
      passwordHash: adminPasswordHash,
      role: 'admin',
      kycStatus: 'verified',
    },
  });
  console.log('User Admin berhasil dibuat:', admin.email);

  // 3. Buat StoreSettings
  const storeSettings = await prisma.storeSettings.create({
    data: {
      storeName: 'GadgetVault',
      address: 'Jl. Muara Takus Raya Jl. Trowulan No.21A, Melong, Kec. Cimahi Sel., Kota Cimahi, Jawa Barat 40534',
      phone: '0812-3456-7890',
      whatsapp: '6281234567890',
      email: 'info@gadgetvault.com',
      googleMapsEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.758686007705!2d107.55030877410647!3d-6.919426367722791!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e54f7baf2a17%3A0x18ebae785b6e3e53!2sadamasanya%20studio!5e0!3m2!1sid!2sid!4v1780892111041!5m2!1sid!2sid" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
      depositPercentage: 0.20,
      bankName: 'Bank Central Asia (BCA)',
      bankAccountNumber: '1234567890',
      bankAccountName: 'CV GadgetVault Indonesia',
      operatingHours: {
        weekdays: '09:00 - 20:00',
        weekends: '10:00 - 18:00',
      },
    },
  });
  console.log('Pengaturan toko berhasil dibuat.');

  // 4. Buat Kategori
  const categoriesData = [
    { name: 'Handphone', slug: 'handphone', iconUrl: '/icons/phone.svg', sortOrder: 1 },
    { name: 'Kamera & Lensa', slug: 'kamera-lensa', iconUrl: '/icons/camera.svg', sortOrder: 2 },
    { name: 'Drone', slug: 'drone', iconUrl: '/icons/drone.svg', sortOrder: 3 },
    { name: 'Aksesoris', slug: 'aksesoris', iconUrl: '/icons/accessories.svg', sortOrder: 4 },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.slug] = createdCat;
  }
  console.log('Kategori berhasil dibuat.');

  // Helper untuk generate slug
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  // 5. Data Dummy Produk
  // Kategori: Handphone (25 Produk)
  const handphones = [
    {
      name: "iPhone 15 Pro Max 256GB - Titanium Gray",
      brand: "Apple",
      model: "iPhone 15 Pro Max",
      description: "iPhone 15 Pro Max memiliki desain titanium kelas dirgantara yang kuat dan ringan. Menggunakan Chip A17 Pro yang bertenaga dengan GPU kelas pro. Kamera utama 48 MP menghasilkan detail dan warna yang memukau.",
      condition: "like_new",
      sellPrice: 20499000,
      rentPriceDaily: 250000,
      rentPriceWeekly: 1500000,
      isFeatured: true,
      stockQuantity: 3,
      imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar", specValue: "6.7 inch Super Retina XDR OLED" },
        { specKey: "Chipset", specValue: "Apple A17 Pro (3 nm)" },
        { specKey: "Penyimpanan", specValue: "256 GB" },
        { specKey: "Kamera Utama", specValue: "48 MP + 12 MP + 12 MP" },
        { specKey: "Baterai", specValue: "4441 mAh" }
      ]
    },
    {
      name: "Samsung Galaxy S24 Ultra 256GB - Titanium Yellow",
      brand: "Samsung",
      model: "Galaxy S24 Ultra",
      description: "Samsung Galaxy S24 Ultra menawarkan kamera utama 200 MP yang luar biasa jernih, zoom optik 5x kelas profesional dengan sensor 50 MP, serta teknologi ProVisual Engine berbasis AI.",
      condition: "like_new",
      sellPrice: 19999000,
      rentPriceDaily: 220000,
      rentPriceWeekly: 1300000,
      isFeatured: true,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar", specValue: "6.8 inch Dynamic AMOLED 2X, 120Hz" },
        { specKey: "Chipset", specValue: "Snapdragon 8 Gen 3 for Galaxy" },
        { specKey: "Penyimpanan", specValue: "256 GB / 12 GB RAM" },
        { specKey: "Kamera Utama", specValue: "200 MP + 50 MP + 10 MP + 12 MP" },
        { specKey: "Baterai", specValue: "5000 mAh" }
      ]
    },
    {
      name: "Google Pixel 8 Pro 128GB - Obsidian",
      brand: "Google",
      model: "Pixel 8 Pro",
      description: "Google Pixel 8 Pro dengan chip Tensor G3 dan kamera AI tercanggih untuk hasil foto natural dan fitur Magic Eraser.",
      condition: "like_new",
      sellPrice: 14500000,
      rentPriceDaily: 180000,
      rentPriceWeekly: 1100000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar", specValue: "6.7 inch LTPO OLED, 120Hz" },
        { specKey: "Chipset", specValue: "Google Tensor G3 (4 nm)" },
        { specKey: "Penyimpanan", specValue: "128 GB" },
        { specKey: "Kamera Utama", specValue: "50 MP + 48 MP + 48 MP" },
        { specKey: "Baterai", specValue: "5050 mAh" }
      ]
    },
    {
      name: "iPhone 15 Pro 128GB - Titanium Blue",
      brand: "Apple",
      model: "iPhone 15 Pro",
      description: "Performa pro dalam ukuran yang pas di genggaman tangan Anda. Dilengkapi bahan premium titanium.",
      condition: "like_new",
      sellPrice: 17299000,
      rentPriceDaily: 220000,
      rentPriceWeekly: 1300000,
      isFeatured: false,
      stockQuantity: 4,
      imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar", specValue: "6.1 inch Super Retina XDR OLED" },
        { specKey: "Chipset", specValue: "Apple A17 Pro (3 nm)" },
        { specKey: "Penyimpanan", specValue: "128 GB" },
        { specKey: "Kamera Utama", specValue: "48 MP + 12 MP + 12 MP" },
        { specKey: "Baterai", specValue: "3274 mAh" }
      ]
    },
    {
      name: "iPhone 14 Pro Max 256GB - Deep Purple",
      brand: "Apple",
      model: "iPhone 14 Pro Max",
      description: "Kamera 48MP yang revolusioner dengan Dynamic Island yang interaktif dan Always-On display.",
      condition: "good",
      sellPrice: 15999000,
      rentPriceDaily: 190000,
      rentPriceWeekly: 1150000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1695048133137-b452e6900ee9?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar", specValue: "6.7 inch LTPO Super Retina XDR" },
        { specKey: "Chipset", specValue: "Apple A16 Bionic (4 nm)" },
        { specKey: "Penyimpanan", specValue: "256 GB" },
        { specKey: "Kamera Utama", specValue: "48 MP + 12 MP + 12 MP" },
        { specKey: "Baterai", specValue: "4323 mAh" }
      ]
    },
    {
      name: "Samsung Galaxy S24+ 256GB - Onyx Black",
      brand: "Samsung",
      model: "Galaxy S24 Plus",
      description: "Pilihan terbaik dengan baterai super tahan lama, layar QHD+ super tajam, dan fitur Galaxy AI lengkap.",
      condition: "like_new",
      sellPrice: 15499000,
      rentPriceDaily: 180000,
      rentPriceWeekly: 1100000,
      isFeatured: false,
      stockQuantity: 3,
      imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar", specValue: "6.7 inch Dynamic AMOLED 2X" },
        { specKey: "Chipset", specValue: "Exynos 2400 (4 nm)" },
        { specKey: "Penyimpanan", specValue: "256 GB / 12 GB RAM" },
        { specKey: "Kamera Utama", specValue: "50 MP + 10 MP + 12 MP" },
        { specKey: "Baterai", specValue: "4900 mAh" }
      ]
    },
    {
      name: "Samsung Galaxy Z Fold 5 256GB - Phantom Black",
      brand: "Samsung",
      model: "Galaxy Z Fold 5",
      description: "Smartphone lipat premium yang menggabungkan produktivitas tablet dan mobilitas hp.",
      condition: "like_new",
      sellPrice: 20999000,
      rentPriceDaily: 300000,
      rentPriceWeekly: 1800000,
      isFeatured: true,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar Utama", specValue: "7.6 inch Foldable Dynamic AMOLED 2X" },
        { specKey: "Chipset", specValue: "Snapdragon 8 Gen 2" },
        { specKey: "Penyimpanan", specValue: "256 GB / 12 GB RAM" },
        { specKey: "Kamera Utama", specValue: "50 MP + 10 MP + 12 MP" },
        { specKey: "Baterai", specValue: "4400 mAh" }
      ]
    },
    {
      name: "Asus ROG Phone 8 Pro 512GB - Phantom Black",
      brand: "Asus",
      model: "ROG Phone 8 Pro",
      description: "Smartphone gaming terkuat dengan pendinginan aktif revolusioner dan tombol pemicu ultrasonik.",
      condition: "like_new",
      sellPrice: 18499000,
      rentPriceDaily: 250000,
      rentPriceWeekly: 1500000,
      isFeatured: true,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar", specValue: "6.78 inch LTPO AMOLED, 165Hz" },
        { specKey: "Chipset", specValue: "Snapdragon 8 Gen 3" },
        { specKey: "Penyimpanan", specValue: "512 GB / 16 GB RAM" },
        { specKey: "Kamera Utama", specValue: "50 MP + 32 MP + 13 MP" },
        { specKey: "Baterai", specValue: "5500 mAh" }
      ]
    },
    {
      name: "Sony Xperia 1 V 256GB - Khaki Green",
      brand: "Sony",
      model: "Xperia 1 V",
      description: "HP para kreator konten dengan layar 4K OLED, rasio sinematik 21:9, dan input audio pro.",
      condition: "like_new",
      sellPrice: 16999000,
      rentPriceDaily: 220000,
      rentPriceWeekly: 1300000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar", specValue: "6.5 inch 4K HDR OLED, 120Hz" },
        { specKey: "Chipset", specValue: "Snapdragon 8 Gen 2" },
        { specKey: "Penyimpanan", specValue: "256 GB / 12 GB RAM" },
        { specKey: "Kamera Utama", specValue: "48 MP + 12 MP + 12 MP" },
        { specKey: "Baterai", specValue: "5000 mAh" }
      ]
    },
    {
      name: "Xiaomi 14 Ultra 512GB - Black",
      brand: "Xiaomi",
      model: "Xiaomi 14 Ultra",
      description: "Kolaborasi kamera legendaris Leica dengan sensor 1-inch dan bukaan variabel mekanis sesungguhnya.",
      condition: "like_new",
      sellPrice: 18999000,
      rentPriceDaily: 240000,
      rentPriceWeekly: 1450000,
      isFeatured: true,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar", specValue: "6.73 inch LTPO AMOLED, 120Hz" },
        { specKey: "Chipset", specValue: "Snapdragon 8 Gen 3" },
        { specKey: "Penyimpanan", specValue: "512 GB / 16 GB RAM" },
        { specKey: "Kamera Utama", specValue: "Leica Quad Camera 50 MP" },
        { specKey: "Baterai", specValue: "5000 mAh" }
      ]
    },
    {
      name: "OnePlus 12 256GB - Silky Black",
      brand: "OnePlus",
      model: "OnePlus 12",
      description: "Flagship killer dengan pengisian daya super kilat 100W SuperVOOC dan sistem kamera Hasselblad.",
      condition: "like_new",
      sellPrice: 13999000,
      rentPriceDaily: 160000,
      rentPriceWeekly: 950000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar", specValue: "6.82 inch LTPO2 Fluid AMOLED" },
        { specKey: "Chipset", specValue: "Snapdragon 8 Gen 3" },
        { specKey: "Penyimpanan", specValue: "256 GB / 12 GB RAM" },
        { specKey: "Kamera Utama", specValue: "50 MP + 64 MP + 48 MP" },
        { specKey: "Baterai", specValue: "5400 mAh" }
      ]
    },
    {
      name: "Vivo X100 Pro 512GB - Asteroid Black",
      brand: "Vivo",
      model: "X100 Pro",
      description: "Dilengkapi lensa Zeiss APO Telephoto untuk hasil foto portrait terbaik di kelas smartphone saat ini.",
      condition: "like_new",
      sellPrice: 15999000,
      rentPriceDaily: 180000,
      rentPriceWeekly: 1100000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar", specValue: "6.78 inch LTPO AMOLED, 120Hz" },
        { specKey: "Chipset", specValue: "MediaTek Dimensity 9300" },
        { specKey: "Penyimpanan", specValue: "512 GB / 16 GB RAM" },
        { specKey: "Kamera Utama", specValue: "50 MP Zeiss + 50 MP + 50 MP" },
        { specKey: "Baterai", specValue: "5400 mAh" }
      ]
    },
    {
      name: "Oppo Find N3 512GB - Classic Black",
      brand: "Oppo",
      model: "Find N3",
      description: "Smartphone lipat tertipis dengan layar minim lipatan dan sistem kamera Hasselblad mumpuni.",
      condition: "like_new",
      sellPrice: 22999000,
      rentPriceDaily: 320000,
      rentPriceWeekly: 1950000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar Utama", specValue: "7.82 inch Foldable OLED" },
        { specKey: "Chipset", specValue: "Snapdragon 8 Gen 2" },
        { specKey: "Penyimpanan", specValue: "512 GB / 16 GB RAM" },
        { specKey: "Kamera Utama", specValue: "48 MP + 64 MP + 48 MP" },
        { specKey: "Baterai", specValue: "4805 mAh" }
      ]
    },
    {
      name: "Oppo Find X7 Ultra 256GB - Ocean Blue",
      brand: "Oppo",
      model: "Find X7 Ultra",
      description: "HP pertama di dunia dengan kamera periskop ganda untuk hasil zoom yang super stabil dan jernih.",
      condition: "like_new",
      sellPrice: 17499000,
      rentPriceDaily: 200000,
      rentPriceWeekly: 1200000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar", specValue: "6.82 inch LTPO AMOLED, 120Hz" },
        { specKey: "Chipset", specValue: "Snapdragon 8 Gen 3" },
        { specKey: "Penyimpanan", specValue: "256 GB / 12 GB RAM" },
        { specKey: "Kamera Utama", specValue: "Quad 50 MP (Dual Periscope)" },
        { specKey: "Baterai", specValue: "5000 mAh" }
      ]
    },
    {
      name: "iPhone 13 Pro 128GB - Sierra Blue",
      brand: "Apple",
      model: "iPhone 13 Pro",
      description: "Layar ProMotion 120Hz pertama dari Apple dengan performa chipset A15 Bionic yang masih sangat kencang.",
      condition: "good",
      sellPrice: 11499000,
      rentPriceDaily: 140000,
      rentPriceWeekly: 850000,
      isFeatured: false,
      stockQuantity: 3,
      imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar", specValue: "6.1 inch Super Retina XDR OLED" },
        { specKey: "Chipset", specValue: "Apple A15 Bionic (5 nm)" },
        { specKey: "Penyimpanan", specValue: "128 GB" },
        { specKey: "Kamera Utama", specValue: "12 MP + 12 MP + 12 MP" },
        { specKey: "Baterai", specValue: "3095 mAh" }
      ]
    },
    {
      name: "iPhone 15 128GB - Black",
      brand: "Apple",
      model: "iPhone 15",
      description: "Dilengkapi fitur Dynamic Island, kamera utama 48MP baru, dan konektor USB Type-C.",
      condition: "like_new",
      sellPrice: 13499000,
      rentPriceDaily: 160000,
      rentPriceWeekly: 950000,
      isFeatured: false,
      stockQuantity: 4,
      imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar", specValue: "6.1 inch Super Retina XDR OLED" },
        { specKey: "Chipset", specValue: "Apple A16 Bionic (4 nm)" },
        { specKey: "Penyimpanan", specValue: "128 GB" },
        { specKey: "Kamera Utama", specValue: "48 MP + 12 MP" },
        { specKey: "Baterai", specValue: "3349 mAh" }
      ]
    },
    {
      name: "Samsung Galaxy S23 Ultra 256GB - Green",
      brand: "Samsung",
      model: "Galaxy S23 Ultra",
      description: "Sensor kamera 200MP dengan pena S-Pen bawaan. Performa Snapdragon 8 Gen 2 stabil dan adem.",
      condition: "good",
      sellPrice: 14999000,
      rentPriceDaily: 170000,
      rentPriceWeekly: 1000000,
      isFeatured: false,
      stockQuantity: 3,
      imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar", specValue: "6.8 inch Dynamic AMOLED 2X, 120Hz" },
        { specKey: "Chipset", specValue: "Snapdragon 8 Gen 2 for Galaxy" },
        { specKey: "Penyimpanan", specValue: "256 GB / 12 GB RAM" },
        { specKey: "Kamera Utama", specValue: "200 MP + 10 MP + 10 MP + 12 MP" },
        { specKey: "Baterai", specValue: "5000 mAh" }
      ]
    },
    {
      name: "Samsung Galaxy Z Flip 5 256GB - Mint",
      brand: "Samsung",
      model: "Galaxy Z Flip 5",
      description: "Smartphone lipat mungil dengan layar luar (Flex Window) yang jauh lebih besar dan fungsional.",
      condition: "like_new",
      sellPrice: 12499000,
      rentPriceDaily: 150000,
      rentPriceWeekly: 900000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar Utama", specValue: "6.7 inch Foldable Dynamic AMOLED" },
        { specKey: "Layar Cover", specValue: "3.4 inch Super AMOLED" },
        { specKey: "Chipset", specValue: "Snapdragon 8 Gen 2" },
        { specKey: "Penyimpanan", specValue: "256 GB / 8 GB RAM" },
        { specKey: "Kamera Utama", specValue: "12 MP + 12 MP" }
      ]
    },
    {
      name: "Google Pixel 8 128GB - Hazel",
      brand: "Google",
      model: "Pixel 8",
      description: "Smartphone kompak dengan jaminan update OS 7 tahun dari Google dan fitur editing AI terbaik.",
      condition: "like_new",
      sellPrice: 10999000,
      rentPriceDaily: 140000,
      rentPriceWeekly: 850000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar", specValue: "6.2 inch OLED, 120Hz" },
        { specKey: "Chipset", specValue: "Google Tensor G3" },
        { specKey: "Penyimpanan", specValue: "128 GB" },
        { specKey: "Kamera Utama", specValue: "50 MP + 12 MP" },
        { specKey: "Baterai", specValue: "4575 mAh" }
      ]
    },
    {
      name: "Google Pixel 7 Pro 128GB - Hazel",
      brand: "Google",
      model: "Pixel 7 Pro",
      description: "Pixel generasi sebelumnya dengan performa kamera telephoto 5x yang sangat berkualitas dan murah.",
      condition: "good",
      sellPrice: 7999000,
      rentPriceDaily: 100000,
      rentPriceWeekly: 600000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar", specValue: "6.7 inch LTPO AMOLED, 120Hz" },
        { specKey: "Chipset", specValue: "Google Tensor G2" },
        { specKey: "Penyimpanan", specValue: "128 GB" },
        { specKey: "Kamera Utama", specValue: "50 MP + 48 MP + 12 MP" },
        { specKey: "Baterai", specValue: "5000 mAh" }
      ]
    },
    {
      name: "Xiaomi 13T Pro 256GB - Alpine Blue",
      brand: "Xiaomi",
      model: "13T Pro",
      description: "Kolaborasi Leica termurah dengan sertifikasi IP68 tahan air dan pengisian daya super cepat 120W.",
      condition: "like_new",
      sellPrice: 9499000,
      rentPriceDaily: 120000,
      rentPriceWeekly: 700000,
      isFeatured: false,
      stockQuantity: 3,
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar", specValue: "6.67 inch AMOLED, 144Hz, HDR10+" },
        { specKey: "Chipset", specValue: "MediaTek Dimensity 9200+" },
        { specKey: "Penyimpanan", specValue: "256 GB / 12 GB RAM" },
        { specKey: "Kamera Utama", specValue: "Leica 50 MP + 50 MP + 12 MP" },
        { specKey: "Baterai", specValue: "5000 mAh" }
      ]
    },
    {
      name: "OnePlus Open 512GB - Emerald Dusk",
      brand: "OnePlus",
      model: "OnePlus Open",
      description: "Smartphone lipat dengan rasio layar luar paling nyaman layaknya hp biasa dan kamera Hasselblad.",
      condition: "like_new",
      sellPrice: 21999000,
      rentPriceDaily: 300000,
      rentPriceWeekly: 1800000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar Utama", specValue: "7.82 inch Foldable Fluid AMOLED" },
        { specKey: "Chipset", specValue: "Snapdragon 8 Gen 2" },
        { specKey: "Penyimpanan", specValue: "512 GB / 16 GB RAM" },
        { specKey: "Kamera Utama", specValue: "48 MP + 64 MP + 48 MP" },
        { specKey: "Baterai", specValue: "4805 mAh" }
      ]
    },
    {
      name: "Asus Zenfone 10 256GB - Midnight Black",
      brand: "Asus",
      model: "Zenfone 10",
      description: "Smartphone Android flagship paling mungil dengan stabilisasi gimbal kamera yang luar biasa tenang.",
      condition: "like_new",
      sellPrice: 9999000,
      rentPriceDaily: 110000,
      rentPriceWeekly: 650000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar", specValue: "5.92 inch Super AMOLED, 144Hz" },
        { specKey: "Chipset", specValue: "Snapdragon 8 Gen 2" },
        { specKey: "Penyimpanan", specValue: "256 GB / 8 GB RAM" },
        { specKey: "Kamera Utama", specValue: "50 MP Gimbal OIS + 13 MP" },
        { specKey: "Baterai", specValue: "4300 mAh" }
      ]
    },
    {
      name: "Huawei P60 Pro 256GB - Rococo Pearl",
      brand: "Huawei",
      model: "P60 Pro",
      description: "Masterpiece fotografi mobile dengan aperture fisik variabel dan tekstur mutiara unik di setiap bodi.",
      condition: "like_new",
      sellPrice: 13999000,
      rentPriceDaily: 170000,
      rentPriceWeekly: 1000000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar", specValue: "6.67 inch LTPO OLED, 120Hz" },
        { specKey: "Chipset", specValue: "Snapdragon 8+ Gen 1 4G" },
        { specKey: "Penyimpanan", specValue: "256 GB / 8 GB RAM" },
        { specKey: "Kamera Utama", specValue: "48 MP XMAGE + 48 MP + 13 MP" },
        { specKey: "Baterai", specValue: "4815 mAh" }
      ]
    },
    {
      name: "Motorola Edge 50 Ultra 512GB - Forest Grey",
      brand: "Motorola",
      model: "Edge 50 Ultra",
      description: "Desain belakang berbahan kulit vegan yang mewah, layar lengkung 144Hz, dan pengisian daya 125W.",
      condition: "like_new",
      sellPrice: 12999000,
      rentPriceDaily: 160000,
      rentPriceWeekly: 950000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar", specValue: "6.7 inch P-OLED, 144Hz" },
        { specKey: "Chipset", specValue: "Snapdragon 8s Gen 3" },
        { specKey: "Penyimpanan", specValue: "512 GB / 16 GB RAM" },
        { specKey: "Kamera Utama", specValue: "50 MP + 64 MP + 50 MP" },
        { specKey: "Baterai", specValue: "4500 mAh" }
      ]
    }
  ];

  // Kategori: Kamera & Lensa (30 Produk)
  const cameras = [
    {
      name: "Sony Alpha 7 IV Mirrorless Camera (Body Only)",
      brand: "Sony",
      model: "Alpha 7 IV",
      description: "Kamera mirrorless hybrid modern dengan sensor full-frame 33,0 MP. Autofokus real-time mutakhir.",
      condition: "good",
      sellPrice: 31999000,
      rentPriceDaily: 350000,
      rentPriceWeekly: 2100000,
      isFeatured: true,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1619896796338-9cb5ee533ab5?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor", specValue: "33 MP Full-Frame Exmor R CMOS" },
        { specKey: "Prosesor", specValue: "BIONZ XR" },
        { specKey: "Autofokus", specValue: "759-Point Phase-Detection AF" },
        { specKey: "Video", specValue: "4K 60p 10-Bit 4:2:2" },
        { specKey: "Stabilisasi", specValue: "5-axis SteadyShot Inside" }
      ]
    },
    {
      name: "Sony Alpha 7S III (Body Only)",
      brand: "Sony",
      model: "Alpha 7S III",
      description: "Kamera mirrorless spesialis videografi dengan sensitivitas cahaya rendah yang legendaris.",
      condition: "good",
      sellPrice: 42999000,
      rentPriceDaily: 450000,
      rentPriceWeekly: 2700000,
      isFeatured: true,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor", specValue: "12.1 MP Full-Frame Exmor R" },
        { specKey: "ISO Range", specValue: "80 - 102400 (Expandable to 409600)" },
        { specKey: "Video", specValue: "4K 120p 10-Bit 4:2:2 Internal" },
        { specKey: "EVF", specValue: "9.44 Million Dots OLED" },
        { specKey: "Slot Memori", specValue: "Dual CFexpress Type A / SD" }
      ]
    },
    {
      name: "Fujifilm X-T5 (Body Only) - Black",
      brand: "Fujifilm",
      model: "X-T5",
      description: "Kamera APS-C dengan resolusi tinggi 40.2 MP dan desain retro dial manual klasik yang dicintai fotografer.",
      condition: "like_new",
      sellPrice: 24999000,
      rentPriceDaily: 280000,
      rentPriceWeekly: 1650000,
      isFeatured: true,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1519638393883-899a31d11530?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor", specValue: "40.2 MP X-Trans CMOS 5 HR" },
        { specKey: "Prosesor", specValue: "X-Processor 5" },
        { specKey: "Stabilisasi", specValue: "7-Stop In-Body Image Stabilization" },
        { specKey: "Video", specValue: "6.2K 30p 10-Bit" },
        { specKey: "Layar", specValue: "Three-way tilting LCD" }
      ]
    },
    {
      name: "Canon EOS R5 (Body Only)",
      brand: "Canon",
      model: "EOS R5",
      description: "Kamera flagship serbaguna dengan perekaman video internal 8K RAW dan stabilisasi sensor hingga 8 stop.",
      condition: "good",
      sellPrice: 48999000,
      rentPriceDaily: 500000,
      rentPriceWeekly: 3000000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor", specValue: "45 MP Full-Frame CMOS" },
        { specKey: "Video", specValue: "8K 30p RAW, 4K 120p 10-Bit" },
        { specKey: "Burst Speed", specValue: "20 fps (Electronic) / 12 fps (Mech.)" },
        { specKey: "Stabilisasi", specValue: "Up to 8-Stops Coordinated Control" },
        { specKey: "Autofokus", specValue: "Dual Pixel CMOS AF II" }
      ]
    },
    {
      name: "Canon EOS R6 Mark II (Body Only)",
      brand: "Canon",
      model: "EOS R6 II",
      description: "Mirrorless full-frame berkecepatan tinggi yang sangat andal untuk fotografi aksi olahraga dan video harian.",
      condition: "like_new",
      sellPrice: 35999000,
      rentPriceDaily: 380000,
      rentPriceWeekly: 2200000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor", specValue: "24.2 MP Full-Frame CMOS" },
        { specKey: "Burst Speed", specValue: "40 fps (Electronic Shutter)" },
        { specKey: "Video", specValue: "4K 60p Oversampled dari 6K" },
        { specKey: "Autofokus", specValue: "Dual Pixel CMOS AF II dengan deteksi AI" },
        { specKey: "ISO Range", specValue: "100 - 102400" }
      ]
    },
    {
      name: "Sony FX3 Cinema Camera",
      brand: "Sony",
      model: "FX3",
      description: "Kamera sinema ringkas lini Cinema Line Sony. Dilengkapi pegangan atas XLR bawaan dan kipas aktif.",
      condition: "like_new",
      sellPrice: 57999000,
      rentPriceDaily: 600000,
      rentPriceWeekly: 3600000,
      isFeatured: true,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor", specValue: "12.1 MP Full-Frame CMOS (Optimasi Video)" },
        { specKey: "Color Science", specValue: "S-Cinetone, S-Log3, HLG" },
        { specKey: "Audio Input", specValue: "Handle dengan 2 slot Jack XLR/TRS" },
        { specKey: "Kipas Pendingin", specValue: "Internal Active Cooling" },
        { specKey: "Video", specValue: "4K 120p / FHD 240p 10-Bit" }
      ]
    },
    {
      name: "Fujifilm X-H2S (Body Only)",
      brand: "Fujifilm",
      model: "X-H2S",
      description: "Kamera APS-C dengan sensor stacked super cepat, ideal untuk videografer professional dan foto satwa liar.",
      condition: "like_new",
      sellPrice: 32999000,
      rentPriceDaily: 350000,
      rentPriceWeekly: 2100000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1519638393883-899a31d11530?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor", specValue: "26.1 MP X-Trans CMOS 5 HS Stacked" },
        { specKey: "Burst Speed", specValue: "40 fps Blackout-Free Shooting" },
        { specKey: "Video", specValue: "6.2K 30p / 4K 120p ProRes Internal" },
        { specKey: "Stabilisasi", specValue: "7-Stop IBIS" },
        { specKey: "AF Tracking", specValue: "Subjek AI (Hewan, Kendaraan, dll)" }
      ]
    },
    {
      name: "Panasonic Lumix S5 IIX (Body Only)",
      brand: "Panasonic",
      model: "Lumix S5 IIX",
      description: "Kamera mirrorless full-frame berwarna hitam legam dengan dukungan perekaman ProRes eksternal ke SSD.",
      condition: "like_new",
      sellPrice: 28999000,
      rentPriceDaily: 320000,
      rentPriceWeekly: 1900000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor", specValue: "24.2 MP Full-Frame CMOS" },
        { specKey: "Autofokus", specValue: "Phase Hybrid AF (779 Titik)" },
        { specKey: "Video Out", specValue: "ProRes RAW via HDMI / Recording ke SSD USB-C" },
        { specKey: "Stabilisasi", specValue: "Active I.S. Technology" },
        { specKey: "Dual Native ISO", specValue: "Auto / 640 / 4000 (V-Log)" }
      ]
    },
    {
      name: "Leica Q3 Compact Camera",
      brand: "Leica",
      model: "Leica Q3",
      description: "Kamera kompak mewah bersensor full-frame 60MP dengan lensa prime Summilux 28mm f/1.7 terintegrasi.",
      condition: "like_new",
      sellPrice: 99000000,
      rentPriceDaily: 950000,
      rentPriceWeekly: 5800000,
      isFeatured: true,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor", specValue: "60 MP Triple-Resolution Full-Frame" },
        { specKey: "Lensa", specValue: "Summilux 28mm f/1.7 ASPH." },
        { specKey: "Video", specValue: "8K Video / ProRes Support" },
        { specKey: "Layar", specValue: "Tilting Touchscreen LCD" },
        { specKey: "AF System", specValue: "Phase Detection AF" }
      ]
    },
    {
      name: "Sony Alpha 7R V (Body Only)",
      brand: "Sony",
      model: "Alpha 7R V",
      description: "Kamera bersensor super padat 61MP dengan chip pemrosesan kecerdasan buatan (AI) khusus untuk autofokus.",
      condition: "like_new",
      sellPrice: 53999000,
      rentPriceDaily: 550000,
      rentPriceWeekly: 3300000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor", specValue: "61 MP Full-Frame Exmor R" },
        { specKey: "AI Processor", specValue: "Dedicated AI Processing Unit" },
        { specKey: "Stabilisasi", specValue: "8.0-Stop In-Body Stabilization" },
        { specKey: "Video", specValue: "8K 24p / 4K 60p" },
        { specKey: "Layar", specValue: "4-Axis Multi-Angle LCD" }
      ]
    },
    {
      name: "Sony Alpha 6700 (Body Only)",
      brand: "Sony",
      model: "Alpha 6700",
      description: "Kamera bersensor APS-C terbaik dari Sony dengan kecerdasan buatan untuk autofokus pelacakan tingkat lanjut.",
      condition: "like_new",
      sellPrice: 19999000,
      rentPriceDaily: 200000,
      rentPriceWeekly: 1200000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor", specValue: "26.0 MP APS-C Exmor R" },
        { specKey: "AF System", specValue: "Real-time Recognition AF (AI-based)" },
        { specKey: "Video", specValue: "4K 120p (crop) / 4K 60p oversampled dari 6K" },
        { specKey: "Stabilisasi", specValue: "5-axis optical In-Body Stabilization" }
      ]
    },
    {
      name: "Nikon Z8 (Body Only)",
      brand: "Nikon",
      model: "Z8",
      description: "Performa sekelas Nikon Z9 flagship yang dikemas dalam bodi yang jauh lebih kompak dan ringan.",
      condition: "like_new",
      sellPrice: 54999000,
      rentPriceDaily: 580000,
      rentPriceWeekly: 3450000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor", specValue: "45.7 MP Stacked CMOS" },
        { specKey: "Shutter", specValue: "Electronic Shutter Only (No mechanical shutter)" },
        { specKey: "Burst Speed", specValue: "20 fps RAW / 120 fps JPEG" },
        { specKey: "Video", specValue: "8.3K 60p N-RAW / 4K 120p" }
      ]
    },
    {
      name: "Nikon Z6 III (Body Only)",
      brand: "Nikon",
      model: "Z6 III",
      description: "Kamera hybrid kencang dengan sensor partially-stacked pertama di dunia untuk pemrosesan super cepat.",
      condition: "like_new",
      sellPrice: 38999000,
      rentPriceDaily: 400000,
      rentPriceWeekly: 2400000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor", specValue: "24.5 MP Partially-Stacked CMOS" },
        { specKey: "EVF", specValue: "5.76M-dot EVF dengan DCI-P3 Color" },
        { specKey: "Video", specValue: "6K 60p N-RAW internal" },
        { specKey: "Stabilisasi", specValue: "8.0-stop IBIS dengan Focus Point VR" }
      ]
    },
    {
      name: "Nikon Zf (Body Only)",
      brand: "Nikon",
      model: "Zf",
      description: "Kamera mirrorless full-frame dengan desain bodi retro legendaris terinspirasi dari kamera film Nikon FM2.",
      condition: "like_new",
      sellPrice: 29999000,
      rentPriceDaily: 320000,
      rentPriceWeekly: 1900000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor", specValue: "24.5 MP Full-Frame CMOS" },
        { specKey: "Prosesor", specValue: "EXPEED 7" },
        { specKey: "Desain", specValue: "Bodi Magnesium Alloy dengan Dial Brass" },
        { specKey: "Autofokus", specValue: "Deep Learning AF Tracking" }
      ]
    },
    {
      name: "Panasonic Lumix GH6 (Body Only)",
      brand: "Panasonic",
      model: "Lumix GH6",
      description: "Kamera bersensor Micro Four Thirds spesialis video dengan opsi rekam ProRes tak terbatas.",
      condition: "good",
      sellPrice: 21999000,
      rentPriceDaily: 220000,
      rentPriceWeekly: 1300000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor", specValue: "25.2 MP Live MOS Micro Four Thirds" },
        { specKey: "Video", specValue: "5.7K 60p / 4K 120p 10-Bit" },
        { specKey: "Cooling", specValue: "Built-in cooling fan (Unlimited record time)" },
        { specKey: "Stabilisasi", specValue: "7.5-Stop Dual I.S. 2" }
      ]
    },
    {
      name: "Canon EOS R7 (Body Only)",
      brand: "Canon",
      model: "EOS R7",
      description: "Kamera mirrorless bersensor APS-C tercepat dari Canon, dirancang untuk penggemar satwa liar dan olahraga.",
      condition: "good",
      sellPrice: 20999000,
      rentPriceDaily: 220000,
      rentPriceWeekly: 1300000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor", specValue: "32.5 MP APS-C CMOS" },
        { specKey: "Burst Speed", specValue: "30 fps Electronic / 15 fps Mech." },
        { specKey: "Video", specValue: "4K 60p / 4K 30p Fine (Oversampled)" },
        { specKey: "Stabilisasi", specValue: "Coordinated IBIS up to 8-Stops" }
      ]
    },
    {
      name: "Canon EOS R10 (Body Only)",
      brand: "Canon",
      model: "EOS R10",
      description: "Kamera mirrorless APS-C kelas pemula yang sangat ringan dan mudah digunakan untuk konten kreator travel.",
      condition: "like_new",
      sellPrice: 10999000,
      rentPriceDaily: 110000,
      rentPriceWeekly: 650000,
      isFeatured: false,
      stockQuantity: 3,
      imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor", specValue: "24.2 MP APS-C CMOS" },
        { specKey: "AF System", specValue: "Dual Pixel CMOS AF II" },
        { specKey: "Burst Speed", specValue: "23 fps Electronic Shutter" },
        { specKey: "Video", specValue: "4K 60p (crop) / 4K 30p" }
      ]
    },
    {
      name: "Fujifilm X-T30 II (Body Only) - Silver",
      brand: "Fujifilm",
      model: "X-T30 II",
      description: "Kamera bergaya vintage berukuran saku dengan simulasi film Fujifilm yang legendaris untuk warna retro instan.",
      condition: "good",
      sellPrice: 13999000,
      rentPriceDaily: 140000,
      rentPriceWeekly: 800000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1519638393883-899a31d11530?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor", specValue: "26.1 MP X-Trans CMOS 4" },
        { specKey: "Prosesor", specValue: "X-Processor 4" },
        { specKey: "Film Simulation", specValue: "18 Mode Simulasi Film klasik" },
        { specKey: "AF System", specValue: "425-point Phase Detection AF" }
      ]
    },
    {
      name: "Fujifilm GFX 100S Medium Format Camera",
      brand: "Fujifilm",
      model: "GFX 100S",
      description: "Kamera format medium super besar bersensor 102 megapiksel untuk detail dan kedalaman dimensi tak tertandingi.",
      condition: "like_new",
      sellPrice: 89000000,
      rentPriceDaily: 850000,
      rentPriceWeekly: 5000000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1519638393883-899a31d11530?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor", specValue: "102 MP Medium Format (43.8 x 32.9mm)" },
        { specKey: "Stabilisasi", specValue: "6-Stop IBIS" },
        { specKey: "Video", specValue: "4K 30p 10-Bit" },
        { specKey: "Berat", specValue: "900 gram (Bodi dengan Baterai)" }
      ]
    },
    {
      name: "Sony FE 24-70mm f/2.8 GM II Lens",
      brand: "Sony",
      model: "SEL2470GM2",
      description: "Lensa zoom standard kelas profesional G Master generasi kedua yang jauh lebih tajam, ringan, dan ringkas.",
      condition: "like_new",
      sellPrice: 32999000,
      rentPriceDaily: 200000,
      rentPriceWeekly: 1200000,
      isFeatured: true,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Bukaan Maksimal", specValue: "f/2.8 konstan" },
        { specKey: "Jangkauan", specValue: "24 - 70 mm" },
        { specKey: "Dudukan", specValue: "Sony E-mount (Full Frame)" },
        { specKey: "Filter Diameter", specValue: "82 mm" },
        { specKey: "Motor Fokus", specValue: "4 XD Linear Motor (Sangat Cepat)" }
      ]
    },
    {
      name: "Sony FE 70-200mm f/2.8 GM OSS II Lens",
      brand: "Sony",
      model: "SEL70200GM2",
      description: "Lensa telephoto pro dengan bukaan f/2.8 konstan. Terkenal sangat tajam untuk portrait dan olahraga.",
      condition: "like_new",
      sellPrice: 38999000,
      rentPriceDaily: 250000,
      rentPriceWeekly: 1500000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Jangkauan", specValue: "70 - 200 mm" },
        { specKey: "Bukaan Maksimal", specValue: "f/2.8" },
        { specKey: "Stabilisasi", specValue: "Optical SteadyShot terintegrasi" },
        { specKey: "Dudukan", specValue: "Sony E-mount" }
      ]
    },
    {
      name: "Sony FE 50mm f/1.2 GM Lens",
      brand: "Sony",
      model: "SEL50F12GM",
      description: "Lensa prime potret dengan bukaan luar biasa f/1.2 untuk menghasilkan latar belakang bokeh yang sangat halus.",
      condition: "like_new",
      sellPrice: 28999000,
      rentPriceDaily: 190000,
      rentPriceWeekly: 1100000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Panjang Fokus", specValue: "50 mm (Standard)" },
        { specKey: "Bukaan Maksimal", specValue: "f/1.2" },
        { specKey: "Dudukan", specValue: "Sony E-mount" },
        { specKey: "Bilah Aperture", specValue: "11 Bilah Melingkar" }
      ]
    },
    {
      name: "Canon RF 24-70mm f/2.8L IS USM Lens",
      brand: "Canon",
      model: "RF 24-70 f2.8L",
      description: "Lensa zoom andalan untuk bodi mirrorless Canon EOS R-series dengan peredam getaran gambar internal.",
      condition: "like_new",
      sellPrice: 34999000,
      rentPriceDaily: 220000,
      rentPriceWeekly: 1300000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Dudukan", specValue: "Canon RF mount" },
        { specKey: "Bukaan Maksimal", specValue: "f/2.8" },
        { specKey: "Stabilisasi", specValue: "5-Stop Optical IS" },
        { specKey: "Diameter Filter", specValue: "82 mm" }
      ]
    },
    {
      name: "Canon RF 70-200mm f/2.8L IS USM Lens",
      brand: "Canon",
      model: "RF 70-200 f2.8L",
      description: "Lensa telephoto professional berselimut cat putih legendaris Canon dengan desain tabung yang memendek.",
      condition: "like_new",
      sellPrice: 41999000,
      rentPriceDaily: 280000,
      rentPriceWeekly: 1600000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Jangkauan", specValue: "70 - 200 mm" },
        { specKey: "Bukaan", specValue: "f/2.8" },
        { specKey: "Panjang Lensa", specValue: "Sangat ringkas untuk kelas 70-200mm" },
        { specKey: "Dudukan", specValue: "Canon RF" }
      ]
    },
    {
      name: "Canon RF 50mm f/1.2L USM Lens",
      brand: "Canon",
      model: "RF 50 f1.2L",
      description: "Lensa potret prime termewah di sistem Canon EOS R dengan ketajaman super tinggi bahkan di f/1.2.",
      condition: "like_new",
      sellPrice: 33999000,
      rentPriceDaily: 210000,
      rentPriceWeekly: 1250000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Focal Length", specValue: "50 mm" },
        { specKey: "Aperture", specValue: "f/1.2" },
        { specKey: "Lini Seri", specValue: "Canon L-series (Mewah)" },
        { specKey: "Dudukan", specValue: "Canon RF" }
      ]
    },
    {
      name: "Sigma 24-70mm f/2.8 DG DN Art Lens (Sony E)",
      brand: "Sigma",
      model: "24-70mm DG DN Art",
      description: "Lensa alternatif professional pihak ketiga terbaik untuk kamera Sony E-mount dengan harga bersahabat.",
      condition: "good",
      sellPrice: 16499000,
      rentPriceDaily: 120000,
      rentPriceWeekly: 700000,
      isFeatured: false,
      stockQuantity: 3,
      imageUrl: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Bukaan", specValue: "f/2.8" },
        { specKey: "Lini Seri", specValue: "Sigma Art Series (Kualitas Optik Premium)" },
        { specKey: "Dudukan", specValue: "Sony E-mount" },
        { specKey: "Diameter Filter", specValue: "82 mm" }
      ]
    },
    {
      name: "Fujifilm XF 16-55mm f/2.8 R LM WR Lens",
      brand: "Fujifilm",
      model: "XF 16-55 f2.8",
      description: "Lensa zoom standar profesional untuk kamera APS-C Fujifilm dengan ketahanan cuaca cuaca ekstrem.",
      condition: "good",
      sellPrice: 15999000,
      rentPriceDaily: 110000,
      rentPriceWeekly: 650000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Jangkauan", specValue: "16-55 mm (Setara 24-84mm di Full Frame)" },
        { specKey: "Bukaan", specValue: "f/2.8 konstan" },
        { specKey: "Fitur", specValue: "Weather Resistant (WR) & Linear Motor (LM)" },
        { specKey: "Dudukan", specValue: "Fujifilm X-mount" }
      ]
    },
    {
      name: "Fujifilm XF 35mm f/1.4 R Lens",
      brand: "Fujifilm",
      model: "XF 35 f1.4",
      description: "Lensa legendaris Fujifilm yang terkenal menghasilkan warna magis dan kedalaman bokeh yang sangat berkarakter.",
      condition: "good",
      sellPrice: 7999000,
      rentPriceDaily: 70000,
      rentPriceWeekly: 400000,
      isFeatured: false,
      stockQuantity: 4,
      imageUrl: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Focal Length", specValue: "35 mm (Setara 50mm di Full Frame)" },
        { specKey: "Bukaan", specValue: "f/1.4" },
        { specKey: "Dudukan", specValue: "Fujifilm X-mount" },
        { specKey: "Berat", specValue: "Sangat ringan (187 gram)" }
      ]
    },
    {
      name: "Nikon NIKKOR Z 24-70mm f/2.8 S Lens",
      brand: "Nikon",
      model: "NIKKOR Z 24-70 f2.8 S",
      description: "Lensa zoom profesional berseri premium 'S-Line' dari Nikon dengan ketajaman optik sudut ke sudut.",
      condition: "like_new",
      sellPrice: 31999000,
      rentPriceDaily: 200000,
      rentPriceWeekly: 1200000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Dudukan", specValue: "Nikon Z mount" },
        { specKey: "Bukaan", specValue: "f/2.8" },
        { specKey: "Lini Seri", specValue: "S-Line premium" },
        { specKey: "Layar Bodi Lensa", specValue: "Layar OLED info jarak & bukaan" }
      ]
    },
    {
      name: "Nikon NIKKOR Z 50mm f/1.2 S Lens",
      brand: "Nikon",
      model: "NIKKOR Z 50 f1.2 S",
      description: "Lensa prime legendaris dengan bukaan f/1.2. Kualitas optik terbaik untuk kamera mirrorless Nikon Z.",
      condition: "like_new",
      sellPrice: 32999000,
      rentPriceDaily: 220000,
      rentPriceWeekly: 1300000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Focal Length", specValue: "50 mm" },
        { specKey: "Bukaan", specValue: "f/1.2" },
        { specKey: "Dudukan", specValue: "Nikon Z mount" },
        { specKey: "Diameter Filter", specValue: "82 mm" }
      ]
    }
  ];

  // Kategori: Drone (20 Produk)
  const drones = [
    {
      name: "DJI Mini 4 Pro Fly More Combo (DJI RC 2)",
      brand: "DJI",
      model: "Mini 4 Pro",
      description: "Drone mini berukuran ringkas di bawah 249 gram dengan deteksi rintangan segala arah (omnidirectional).",
      condition: "like_new",
      sellPrice: 17490000,
      rentPriceDaily: 250000,
      rentPriceWeekly: 1400000,
      isFeatured: true,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Berat", specValue: "< 249 gram" },
        { specKey: "Sensor Kamera", specValue: "1/1.3-inch CMOS, 48 MP" },
        { specKey: "Video", specValue: "4K 60fps HDR dan 4K 100fps Slow Motion" },
        { specKey: "Waktu Terbang", specValue: "Hingga 34 Menit" },
        { specKey: "Transmisi", specValue: "DJI O4 (Hingga 20 km)" }
      ]
    },
    {
      name: "DJI Air 3 Fly More Combo (DJI RC 2)",
      brand: "DJI",
      model: "Air 3",
      description: "Drone kelas menengah pertama dengan sistem kamera ganda primer (wide & 3x medium telephoto).",
      condition: "like_new",
      sellPrice: 23490000,
      rentPriceDaily: 350000,
      rentPriceWeekly: 2000000,
      isFeatured: true,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sistem Kamera", specValue: "Dual Kamera Utama 1/1.3-inch CMOS" },
        { specKey: "Kamera Telephoto", specValue: "3x Optical Zoom, 48 MP" },
        { specKey: "Waktu Terbang Max", specValue: "Hingga 46 Menit" },
        { specKey: "Video", specValue: "4K 100fps / 4K 60fps HDR" },
        { specKey: "Sensor Rintangan", specValue: "Omnidirectional APAS 5.0" }
      ]
    },
    {
      name: "DJI Mavic 3 Pro Cine Premium Combo",
      brand: "DJI",
      model: "Mavic 3 Pro Cine",
      description: "Drone kamera sinematik professional teratas dengan tiga kamera utama Hasselblad dan codec Apple ProRes.",
      condition: "like_new",
      sellPrice: 72990000,
      rentPriceDaily: 800000,
      rentPriceWeekly: 4800000,
      isFeatured: true,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Kamera Utama", specValue: "Hasselblad 4/3 CMOS 20 MP" },
        { specKey: "Dual Tele Kamera", specValue: "70mm (3x zoom) & 166mm (7x zoom)" },
        { specKey: "Format Rekam", specValue: "Apple ProRes 422 HQ / 422 / 422 LT" },
        { specKey: "Penyimpanan", specValue: "SSD 1TB Internal" },
        { specKey: "Remot bawaan", specValue: "DJI RC Pro (Layar Super Terang)" }
      ]
    },
    {
      name: "DJI Avata 2 Fly More Combo (FPV)",
      brand: "DJI",
      model: "Avata 2",
      description: "Drone FPV (First-Person View) generasi terbaru yang lincah dengan manuver salto sekali klik.",
      condition: "like_new",
      sellPrice: 19999000,
      rentPriceDaily: 300000,
      rentPriceWeekly: 1800000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Mode Terbang", specValue: "FPV (First Person View) dengan Goggles 3" },
        { specKey: "Kontroler", specValue: "DJI RC Motion 3 (Kontrol Gerakan Tangan)" },
        { specKey: "Keamanan", specValue: "Propeller Guard Bawaan (Aman Benturan)" },
        { specKey: "Sensor Kamera", specValue: "1/1.3-inch Image Sensor, 155° FOV" },
        { specKey: "Waktu Terbang", specValue: "Hingga 23 Menit" }
      ]
    },
    {
      name: "DJI Mini 3 Pro (DJI RC)",
      brand: "DJI",
      model: "Mini 3 Pro",
      description: "Drone lipat ultra ringan di bawah 249 gram dengan kamera yang bisa berputar vertikal asli.",
      condition: "good",
      sellPrice: 11999000,
      rentPriceDaily: 180000,
      rentPriceWeekly: 1000000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Berat", specValue: "249 gram" },
        { specKey: "Vertical Shooting", specValue: "True Vertical Shooting (Gimbal Putar 90°)" },
        { specKey: "Video", specValue: "4K 60fps" },
        { specKey: "Sensor Rintangan", specValue: "Tri-Directional (Depan, Belakang, Bawah)" }
      ]
    },
    {
      name: "DJI Mavic 3 Classic (DJI RC)",
      brand: "DJI",
      model: "Mavic 3 Classic",
      description: "Versi terjangkau dari Mavic 3 dengan satu kamera utama Hasselblad 4/3 CMOS tanpa lensa zoom tambahan.",
      condition: "like_new",
      sellPrice: 25999000,
      rentPriceDaily: 380000,
      rentPriceWeekly: 2200000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Kamera", specValue: "Hasselblad 4/3 CMOS 20 MP" },
        { specKey: "Waktu Terbang", specValue: "46 Menit" },
        { specKey: "Transmisi Video", specValue: "DJI O3+ (Hingga 15 km)" },
        { specKey: "Video", specValue: "5.1K 50fps / 4K 120fps" }
      ]
    },
    {
      name: "DJI Inspire 3 Professional Drone",
      brand: "DJI",
      model: "Inspire 3",
      description: "Drone film hollywood papan atas dengan sensor full-frame 8K dan sistem tracking RTF presisi centimeter.",
      condition: "like_new",
      sellPrice: 165000000,
      rentPriceDaily: 2500000,
      rentPriceWeekly: 14000000,
      isFeatured: true,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Kamera Gimbal", specValue: "Zenmuse X9-8K Air Full-Frame" },
        { specKey: "Format Rekam", specValue: "CinemaDNG & Apple ProRes RAW internal" },
        { specKey: "FPV Camera", specValue: "Night-Vision FPV Camera ultra-wide" },
        { specKey: "Akurasi Posisi", specValue: "RTK Centimeter-level Positioning" },
        { specKey: "Kecepatan Max", specValue: "94 km/jam" }
      ]
    },
    {
      name: "DJI FPV Explorer Combo",
      brand: "DJI",
      model: "DJI FPV",
      description: "Drone FPV hybrid pertama DJI yang mampu melesat dari 0 ke 100 km/jam hanya dalam 2 detik saja.",
      condition: "good",
      sellPrice: 15499000,
      rentPriceDaily: 280000,
      rentPriceWeekly: 1600000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Kecepatan Max", specValue: "140 km/jam" },
        { specKey: "Video", specValue: "4K 60fps dengan RockSteady stabilization" },
        { specKey: "Sistem Rem", specValue: "Emergency Brake & Hover (Tombol Rem Darurat)" },
        { specKey: "Transmisi", specValue: "OcuSync 3.0 (Low-latency)" }
      ]
    },
    {
      name: "BetaFPV Cetus X FPV Kit",
      brand: "BetaFPV",
      model: "Cetus X",
      description: "Paket lengkap drone FPV mikro untuk pemula yang ingin belajar terbang mode acro (manual) dengan aman.",
      condition: "new",
      sellPrice: 3899000,
      rentPriceDaily: 80000,
      rentPriceWeekly: 450000,
      isFeatured: false,
      stockQuantity: 4,
      imageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Tipe Drone", specValue: "Micro Whoop (Brushless)" },
        { specKey: "Goggles", specValue: "VR03 FPV Goggles" },
        { specKey: "Radio", specValue: "LiteRadio 3 Transmitter (ELRS 2.4G)" },
        { specKey: "Protokol", specValue: "ExpressLRS (ELRS)" },
        { specKey: "Berat", specValue: "55 gram (Tanpa Baterai)" }
      ]
    },
    {
      name: "iFlight Nazgul5 V3 FPV Drone",
      brand: "iFlight",
      model: "Nazgul5 V3",
      description: "Drone FPV rakitan 5-inch siap terbang dengan kerangka karbon tebal untuk perekaman video aksi ekstrem.",
      condition: "good",
      sellPrice: 6499000,
      rentPriceDaily: 150000,
      rentPriceWeekly: 900000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Ukuran Frame", specValue: "5-inch carbon fiber wheelbase" },
        { specKey: "Motor", specValue: "XING2 2207 Brushless Motor" },
        { specKey: "Video Transmitter", specValue: "Analog 1.6W / DJI O3 compatible" },
        { specKey: "Daya Baterai", specValue: "Mendukung 6S LiPo" }
      ]
    },
    {
      name: "Autel Robotics EVO Lite+ Premium Bundle",
      brand: "Autel",
      model: "EVO Lite Plus",
      description: "Drone tangguh dengan sensor 1-inch dan bukaan variabel f/2.8 - f/11 untuk pengambilan gambar malam hari.",
      condition: "like_new",
      sellPrice: 19999000,
      rentPriceDaily: 250000,
      rentPriceWeekly: 1400000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor Kamera", specValue: "1-inch CMOS" },
        { specKey: "Aperture", specValue: "f/2.8 - f/11 Adjustable" },
        { specKey: "Waktu Terbang", specValue: "40 Menit" },
        { specKey: "Video", specValue: "6K 30fps" },
        { specKey: "Ketahanan Angin", specValue: "Level 7 (Sangat Kuat)" }
      ]
    },
    {
      name: "Autel Robotics EVO Nano+ Standard",
      brand: "Autel",
      model: "EVO Nano Plus",
      description: "Drone ringan 249 gram bersensor RYYB 1/1.28-inch yang luar biasa menyerap cahaya minim.",
      condition: "like_new",
      sellPrice: 11499000,
      rentPriceDaily: 150000,
      rentPriceWeekly: 850000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Berat", specValue: "249 gram" },
        { specKey: "Sensor Kamera", specValue: "1/1.28-inch RYYB CMOS" },
        { specKey: "Autofokus", specValue: "PDAF + CDAF Dual Autofocus" },
        { specKey: "Waktu Terbang", specValue: "28 Menit" }
      ]
    },
    {
      name: "DJI Mini 2 SE Compact Drone",
      brand: "DJI",
      model: "Mini 2 SE",
      description: "Drone DJI paling ramah dompet, cocok untuk dokumentasi liburan keluarga pemula.",
      condition: "good",
      sellPrice: 5990000,
      rentPriceDaily: 90000,
      rentPriceWeekly: 500000,
      isFeatured: false,
      stockQuantity: 3,
      imageUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Berat", specValue: "246 gram" },
        { specKey: "Video Resolution", specValue: "2.7K HD Video" },
        { specKey: "Transmisi", specValue: "OcuSync 2.0 (Hingga 10 km)" },
        { specKey: "Waktu Terbang", specValue: "31 Menit" }
      ]
    },
    {
      name: "DJI Phantom 4 Pro V2.0",
      brand: "DJI",
      model: "Phantom 4 Pro V2",
      description: "Drone klasik legendaris dengan mechanical shutter, andalan utama pemetaan udara (mapping).",
      condition: "good",
      sellPrice: 28900000,
      rentPriceDaily: 400000,
      rentPriceWeekly: 2400000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor Kamera", specValue: "1-inch CMOS, 20 MP" },
        { specKey: "Shutter", specValue: "Mechanical Shutter (Mencegah distorsi)" },
        { specKey: "Video", specValue: "4K 60fps pada bitrate 100 Mbps" },
        { specKey: "Sensor Hambatan", specValue: "5-Directional Obstacle Sensing" }
      ]
    },
    {
      name: "Ryze Tech Tello Toy Drone",
      brand: "Ryze",
      model: "Tello",
      description: "Drone mainan edukatif yang didukung sistem DJI, aman dimainkan di dalam ruangan oleh anak-anak.",
      condition: "good",
      sellPrice: 1490000,
      rentPriceDaily: 30000,
      rentPriceWeekly: 180000,
      isFeatured: false,
      stockQuantity: 5,
      imageUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Berat", specValue: "80 gram" },
        { specKey: "Waktu Terbang", specValue: "13 Menit" },
        { specKey: "Resolusi Foto", specValue: "5 Megapiksel" },
        { specKey: "Fitur", specValue: "Scratch Programming Block, Auto Takeoff/Landing" }
      ]
    },
    {
      name: "GEPRC Cinelog35 V2 Cinewhoop",
      brand: "GEPRC",
      model: "Cinelog35 V2",
      description: "Drone FPV cinewhoop 3.5-inch terlindung busa pelindung tebal untuk membawa kamera GoPro full size.",
      condition: "like_new",
      sellPrice: 6999000,
      rentPriceDaily: 160000,
      rentPriceWeekly: 950000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Baling-baling", specValue: "3.5-inch Propeller dengan Guard" },
        { specKey: "Sistem Video", specValue: "Dukungan DJI O3 Air Unit" },
        { specKey: "Rekomendasi Baterai", specValue: "6S 1300mAh LiPo" },
        { specKey: "Mounting", specValue: "GoPro TPU Mount terpasang" }
      ]
    },
    {
      name: "DJI Air 2S Fly More Combo",
      brand: "DJI",
      model: "Air 2S",
      description: "Drone all-in-one bersensor 1-inch yang sangat populer untuk dokumentasi liburan sinematik.",
      condition: "good",
      sellPrice: 15499000,
      rentPriceDaily: 200000,
      rentPriceWeekly: 1200000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor Kamera", specValue: "1-inch CMOS, 20 MP" },
        { specKey: "Video", specValue: "5.4K 30fps / 4K 60fps" },
        { specKey: "Fitur Pintar", specValue: "MasterShots (Auto sinematik sekali ketuk)" },
        { specKey: "Waktu Terbang", specValue: "31 Menit" }
      ]
    },
    {
      name: "Autel EVO II Pro Rugged Bundle V3",
      brand: "Autel",
      model: "EVO II Pro V3",
      description: "Drone pemetaan profesional dengan sensor kamera 1-inch 6K dan transmisi nirkabel ultra stabil.",
      condition: "like_new",
      sellPrice: 38900000,
      rentPriceDaily: 480000,
      rentPriceWeekly: 2800000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor", specValue: "20 MP 1-inch CMOS" },
        { specKey: "Aperture", specValue: "f/2.8 - f/11 Adjustable" },
        { specKey: "Video", specValue: "6K HDR Video" },
        { specKey: "Waktu Terbang", specValue: "40 Menit" }
      ]
    },
    {
      name: "BetaFPV Pavo20 Brushless Whoop",
      brand: "BetaFPV",
      model: "Pavo20",
      description: "Drone cinewhoop mikro berukuran 2-inch, dirancang untuk penerbangan dalam ruangan yang sempit.",
      condition: "new",
      sellPrice: 2490000,
      rentPriceDaily: 60000,
      rentPriceWeekly: 350000,
      isFeatured: false,
      stockQuantity: 3,
      imageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Ukuran Frame", specValue: "90mm wheelbase (2-inch props)" },
        { specKey: "Sistem Video", specValue: "Mendukung DJI O3 Air Unit / Caddx Vista" },
        { specKey: "Baterai", specValue: "Mendukung 2S / 3S LiPo" },
        { specKey: "Berat Bersih", specValue: "55 gram (Tanpa Air Unit)" }
      ]
    },
    {
      name: "DJI Mavic 2 Pro Professional Drone",
      brand: "DJI",
      model: "Mavic 2 Pro",
      description: "Drone lawas legendaris pertama hasil kolaborasi dengan Hasselblad yang warnanya masih sangat dicari.",
      condition: "fair",
      sellPrice: 12900000,
      rentPriceDaily: 180000,
      rentPriceWeekly: 1000000,
      isFeatured: false,
      stockQuantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Kamera", specValue: "Hasselblad L1D-20c, 1-inch CMOS" },
        { specKey: "Warna", specValue: "10-bit Dlog-M Color Profile" },
        { specKey: "Video", specValue: "4K 30fps HDR" },
        { specKey: "Waktu Terbang", specValue: "31 Menit" }
      ]
    }
  ];

  // Kategori: Aksesoris (30 Produk)
  const accessories = [
    {
      name: "DJI Mic 2 (2 TX + 1 RX + Charging Case)",
      brand: "DJI",
      model: "Mic 2",
      description: "Mikrofon nirkabel premium saku dengan perekaman internal 32-bit float dan peredam bising cerdas.",
      condition: "like_new",
      sellPrice: 5200000,
      rentPriceDaily: 90000,
      rentPriceWeekly: 500000,
      isFeatured: false,
      stockQuantity: 5,
      imageUrl: "https://images.unsplash.com/photo-1590608897129-79da98d15969?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Tipe", specValue: "Dual-Channel Wireless Microphone" },
        { specKey: "Perekaman", specValue: "32-bit Float Internal Recording" },
        { specKey: "Jangkauan", specValue: "Hingga 250 meter" },
        { specKey: "Daya Baterai", specValue: "6 Jam (TX) / 18 Jam total dengan Case" },
        { specKey: "Fitur", specValue: "Intelligent Noise Cancelling" }
      ]
    },
    {
      name: "Rode Wireless PRO Microphone System",
      brand: "Rode",
      model: "Wireless PRO",
      description: "Sistem mikrofon nirkabel tercanggih dari Rode dengan fitur Timecode generator sinkronisasi audio otomatis.",
      condition: "like_new",
      sellPrice: 6890000,
      rentPriceDaily: 110000,
      rentPriceWeekly: 650000,
      isFeatured: true,
      stockQuantity: 3,
      imageUrl: "https://images.unsplash.com/photo-1590608897129-79da98d15969?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Tipe", specValue: "Dual-Channel Wireless Mic System" },
        { specKey: "Fitur Utama", specValue: "32-bit Float On-board Recording & Timecode" },
        { specKey: "Jangkauan", specValue: "260 meter (LOS)" },
        { specKey: "Kelengkapan", specValue: "2x TX, 1x RX, Charging Case, 2x Lav Mic" }
      ]
    },
    {
      name: "DJI RS 4 Pro Gimbal Stabilizer",
      brand: "DJI",
      model: "RS 4 Pro",
      description: "Gimbal penstabil kamera kelas berat dengan motor fokus LiDAR pintar dan motor pengunci otomatis.",
      condition: "like_new",
      sellPrice: 13999000,
      rentPriceDaily: 200000,
      rentPriceWeekly: 1100000,
      isFeatured: true,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1603178458925-333f24507b40?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Daya Angkut Max", specValue: "4.5 kg (Mendukung Kamera Cinema)" },
        { specKey: "Layar", specValue: "Layar Sentuh OLED berwarna dengan Auto-lock" },
        { specKey: "Fitur", specValue: "Vertical Shooting Gen 2 Asli" },
        { specKey: "Ekosistem", specValue: "Mendukung DJI Transmission & LiDAR Focus" }
      ]
    },
    {
      name: "Peak Design Travel Tripod (Carbon Fiber)",
      brand: "Peak Design",
      model: "Carbon Travel Tripod",
      description: "Tripod travel paling ringkas dan ringan di dunia dengan diameter lipatan seukuran botol air minum.",
      condition: "like_new",
      sellPrice: 10499000,
      rentPriceDaily: 120000,
      rentPriceWeekly: 700000,
      isFeatured: true,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1603178458925-333f24507b40?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Bahan", specValue: "Carbon Fiber (Sangat Ringan)" },
        { specKey: "Berat Tripod", specValue: "1.27 kg" },
        { specKey: "Beban Max", specValue: "9.1 kg" },
        { specKey: "Tinggi Lipat", specValue: "39.1 cm" }
      ]
    },
    {
      name: "Godox AD200Pro Pocket Flash",
      brand: "Godox",
      model: "AD200Pro",
      description: "Lampu kilat studio saku bertenaga besar 200Ws dengan baterai lithium tahan lama.",
      condition: "good",
      sellPrice: 5399000,
      rentPriceDaily: 90000,
      rentPriceWeekly: 500000,
      isFeatured: false,
      stockQuantity: 4,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Kekuatan Flash", specValue: "200 Ws" },
        { specKey: "Sistem Wireless", specValue: "Built-in Godox 2.4G X System" },
        { specKey: "Baterai", specValue: "Baterai Lithium 2900mAh (500x flash penuh)" },
        { specKey: "Recycle Time", specValue: "0.01 - 1.8 detik" }
      ]
    },
    {
      name: "GoPro Hero 12 Black Action Camera",
      brand: "GoPro",
      model: "Hero 12 Black",
      description: "Kamera aksi terpopuler dengan stabilisasi HyperSmooth 6.0 dan dukungan perekaman audio Bluetooth.",
      condition: "like_new",
      sellPrice: 6299000,
      rentPriceDaily: 120000,
      rentPriceWeekly: 700000,
      isFeatured: true,
      stockQuantity: 3,
      imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Video", specValue: "5.3K 60fps / 4K 120fps" },
        { specKey: "Stabilisasi", specValue: "HyperSmooth 6.0 dengan Horizon Lock 360°" },
        { specKey: "Fitur Air", specValue: "Tahan Air hingga 10 meter tanpa case" },
        { specKey: "Sensor", specValue: "1/1.9-inch CMOS (Rasio 8:7)" }
      ]
    },
    {
      name: "Rode Wireless GO II",
      brand: "Rode",
      model: "Wireless GO II",
      description: "Mikrofon nirkabel legendaris ultra-kompak dengan dua transmitter siap pakai.",
      condition: "good",
      sellPrice: 3999000,
      rentPriceDaily: 80000,
      rentPriceWeekly: 450000,
      isFeatured: false,
      stockQuantity: 5,
      imageUrl: "https://images.unsplash.com/photo-1590608897129-79da98d15969?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Transmisi", specValue: "Wireless Series IV 2.4GHz" },
        { specKey: "Jangkauan", specValue: "200 meter" },
        { specKey: "Baterai", specValue: "Hingga 7 jam baterai internal" },
        { specKey: "Output", specValue: "TRS 3.5mm & USB-C Audio digital" }
      ]
    },
    {
      name: "DJI RS 3 Mini Gimbal Stabilizer",
      brand: "DJI",
      model: "RS 3 Mini",
      description: "Gimbal penstabil kamera mirrorless teringan dari DJI, sangat cocok untuk bodi kamera kecil.",
      condition: "good",
      sellPrice: 4299000,
      rentPriceDaily: 90000,
      rentPriceWeekly: 500000,
      isFeatured: false,
      stockQuantity: 3,
      imageUrl: "https://images.unsplash.com/photo-1603178458925-333f24507b40?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Berat Gimbal", specValue: "Hanya 795 gram (Ringan)" },
        { specKey: "Beban Max", specValue: "2.0 kg" },
        { specKey: "Layar", specValue: "Layar Sentuh Full Color 1.4 inch" },
        { specKey: "Kontrol Kamera", specValue: "Bluetooth Camera Shutter Control" }
      ]
    },
    {
      name: "Zhiyun Crane 4 Handheld Gimbal",
      brand: "Zhiyun",
      model: "Crane 4",
      description: "Gimbal tangguh dengan lampu penyorot bawaan dan pegangan bawah berseri ergonomis.",
      condition: "like_new",
      sellPrice: 9999000,
      rentPriceDaily: 150000,
      rentPriceWeekly: 850000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1603178458925-333f24507b40?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Payload", specValue: "Hingga 6.0 kg (Lensa Panjang Pro)" },
        { specKey: "Fill Light", specValue: "Built-in 10W Fill Light (Lampu Sorot)" },
        { specKey: "Baterai", specValue: "Hingga 12 Jam kerja" }
      ]
    },
    {
      name: "Manfrotto Befree Advanced Travel Tripod",
      brand: "Manfrotto",
      model: "Befree Advanced",
      description: "Tripod besi alumunium kokoh buatan Italia, andalan fotografer lanskap perkotaan.",
      condition: "good",
      sellPrice: 2899000,
      rentPriceDaily: 40000,
      rentPriceWeekly: 200000,
      isFeatured: false,
      stockQuantity: 4,
      imageUrl: "https://images.unsplash.com/photo-1603178458925-333f24507b40?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Bahan", specValue: "Aluminium" },
        { specKey: "Tinggi Max", specValue: "150 cm" },
        { specKey: "Beban Max", specValue: "8.0 kg" },
        { specKey: "Berat Tripod", specValue: "1.59 kg" }
      ]
    },
    {
      name: "Joby GorillaPod 5K Kit",
      brand: "Joby",
      model: "GorillaPod 5K",
      description: "Tripod fleksibel legendaris berkaki gurita yang bisa dilingkarkan di dahan pohon maupun tiang besi.",
      condition: "good",
      sellPrice: 1999000,
      rentPriceDaily: 30000,
      rentPriceWeekly: 150000,
      isFeatured: false,
      stockQuantity: 6,
      imageUrl: "https://images.unsplash.com/photo-1603178458925-333f24507b40?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Bahan", specValue: "Premium ABS Plastic & Aluminium" },
        { specKey: "Beban Max", specValue: "5.0 kg" },
        { specKey: "Fitur", specValue: "Flexible legs (Kaki elastis melingkar)" },
        { specKey: "Ballhead", specValue: "Termasuk Ballhead 5K dengan plat Arca-Swiss" }
      ]
    },
    {
      name: "Godox FV150 Hybrid LED Light",
      brand: "Godox",
      model: "FV150",
      description: "Lampu studio serbaguna yang bisa berfungsi ganda sebagai LED video terus menerus maupun flash foto kilat.",
      condition: "good",
      sellPrice: 4299000,
      rentPriceDaily: 100000,
      rentPriceWeekly: 600000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Tipe", specValue: "Hybrid Continuous LED & High Speed Sync Flash" },
        { specKey: "Kekuatan", specValue: "150W" },
        { specKey: "Warna", specValue: "5600K (Daylight)" },
        { specKey: "CRI/TLCI", specValue: "96 / 97 (Akurasi Warna Tinggi)" }
      ]
    },
    {
      name: "Aputure Amaran 200d LED Video Light",
      brand: "Aputure",
      model: "Amaran 200d",
      description: "Lampu video spotlight berdaya besar 200W dengan kecerahan warna daylight yang sangat akurat.",
      condition: "like_new",
      sellPrice: 5190000,
      rentPriceDaily: 110000,
      rentPriceWeekly: 650000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Daya", specValue: "200W COB LED" },
        { specKey: "Dudukan Aksesoris", specValue: "Bowens Mount (Modifikator lampu umum)" },
        { specKey: "Kecerahan", specValue: "Hingga 65.000 lux @ 1m dengan Reflektor" },
        { specKey: "Kontrol", specValue: "Dapat dikontrol via Aplikasi Sidus Link" }
      ]
    },
    {
      name: "SanDisk Extreme Pro 128GB SDXC UHS-II",
      brand: "SanDisk",
      model: "Extreme Pro SD UHS-2",
      description: "Kartu memori SD super cepat, wajib untuk merekam video 4K bitrate tinggi atau foto burst tanpa delay buffer.",
      condition: "new",
      sellPrice: 1450000,
      rentPriceDaily: 25000,
      rentPriceWeekly: 120000,
      isFeatured: false,
      stockQuantity: 10,
      imageUrl: "https://images.unsplash.com/photo-1590608897129-79da98d15969?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Kapasitas", specValue: "128 GB" },
        { specKey: "Kecepatan Baca", specValue: "Hingga 300 MB/s" },
        { specKey: "Kecepatan Tulis", specValue: "Hingga 260 MB/s" },
        { specKey: "Kelas Kecepatan", specValue: "V90, UHS-II, Class 10" }
      ]
    },
    {
      name: "SanDisk Extreme Pro 256GB CFexpress Type B",
      brand: "SanDisk",
      model: "CFexpress Type B",
      description: "Kartu memori standar industri kamera modern, mendukung rekaman RAW video 8K tanpa jeda.",
      condition: "new",
      sellPrice: 4200000,
      rentPriceDaily: 60000,
      rentPriceWeekly: 350000,
      isFeatured: false,
      stockQuantity: 5,
      imageUrl: "https://images.unsplash.com/photo-1590608897129-79da98d15969?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Tipe Memori", specValue: "CFexpress Type B" },
        { specKey: "Kapasitas", specValue: "256 GB" },
        { specKey: "Kecepatan Baca", specValue: "Hingga 1700 MB/s" },
        { specKey: "Kecepatan Tulis", specValue: "Hingga 1200 MB/s" }
      ]
    },
    {
      name: "Sony TOUGH 64GB SDXC UHS-II Card",
      brand: "Sony",
      model: "TOUGH SD 64GB",
      description: "Kartu memori SD paling kokoh di dunia, tahan air, tahan debu, dan tahan dilindas kendaraan.",
      condition: "new",
      sellPrice: 1999000,
      rentPriceDaily: 30000,
      rentPriceWeekly: 150000,
      isFeatured: false,
      stockQuantity: 8,
      imageUrl: "https://images.unsplash.com/photo-1590608897129-79da98d15969?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Seri", specValue: "TOUGH Spec (Monolithic structure)" },
        { specKey: "Kapasitas", specValue: "64 GB" },
        { specKey: "Kecepatan Baca", specValue: "300 MB/s" },
        { specKey: "Daya Tahan", specValue: "IP68 Tahan Air & Debu, Bend-proof" }
      ]
    },
    {
      name: "Peak Design Everyday Backpack 20L - Charcoal",
      brand: "Peak Design",
      model: "Everyday Backpack 20L",
      description: "Tas punggung kamera harian tercantik dengan sekat lipat FlexFold yang dapat diatur sesuka hati.",
      condition: "good",
      sellPrice: 4499000,
      rentPriceDaily: 50000,
      rentPriceWeekly: 250000,
      isFeatured: false,
      stockQuantity: 3,
      imageUrl: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Kapasitas", specValue: "20 Liter" },
        { specKey: "Bahan", specValue: "Nylon Canvas 400D DWR (Tahan Percikan Air)" },
        { specKey: "Akses", specValue: "Akses cepat samping kanan-kiri & atas MagLatch" },
        { specKey: "Kompartemen Laptop", specValue: "Mendukung laptop hingga ukuran 15-inch" }
      ]
    },
    {
      name: "Lowepro ProTactic BP 450 AW II Camera Bag",
      brand: "Lowepro",
      model: "ProTactic 450",
      description: "Tas kamera taktis modular dengan perlindungan cangkang keras pelindung benturan keras.",
      condition: "good",
      sellPrice: 3899000,
      rentPriceDaily: 45000,
      rentPriceWeekly: 220000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Kapasitas", specValue: "25 Liter (Mampu membawa 2 DSLR + Lensa Tele)" },
        { specKey: "Akses Utama", specValue: "Akses Punggung Belakang (Aman dari Maling)" },
        { specKey: "Rain Cover", specValue: "Termasuk All Weather (AW) Cover" },
        { specKey: "Sistem Eksternal", specValue: "SlipLock loop kompatibel aksesoris taktis" }
      ]
    },
    {
      name: "PolarPro Peter McKinnon Variable ND Filter (77mm)",
      brand: "PolarPro",
      model: "PMVND Signature II",
      description: "Filter lensa pengurang cahaya variabel termulus, tanpa efek silang 'X' yang merusak hasil video.",
      condition: "like_new",
      sellPrice: 3999000,
      rentPriceDaily: 50000,
      rentPriceWeekly: 250000,
      isFeatured: false,
      stockQuantity: 3,
      imageUrl: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Ukuran Ulir", specValue: "77 mm" },
        { specKey: "Rentang Stop", specValue: "2 hingga 5 Stop (ND4 hingga ND32)" },
        { specKey: "Kaca", specValue: "Kaca Fused Quartz legendaris PolarPro" },
        { specKey: "Seri", specValue: "Peter McKinnon Signature Edition II" }
      ]
    },
    {
      name: "Hoya PROND1000 Filter (82mm)",
      brand: "Hoya",
      model: "PROND1000 82mm",
      description: "Filter ND solid 10-stop untuk teknik foto long exposure air terjun halus di siang bolong.",
      condition: "good",
      sellPrice: 1200000,
      rentPriceDaily: 20000,
      rentPriceWeekly: 100000,
      isFeatured: false,
      stockQuantity: 4,
      imageUrl: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Ukuran Ulir", specValue: "82 mm" },
        { specKey: "Kekuatan ND", specValue: "10 Stop (ND1000)" },
        { specKey: "Teknologi", specValue: "ACCU-ND metallic coating (Mencegah color cast)" }
      ]
    },
    {
      name: "DJI Goggles 3 FPV Headset",
      brand: "DJI",
      model: "Goggles 3",
      description: "Kacamata FPV DJI terbaru dengan layar micro-OLED beresolusi tinggi dan fitur pandangan sekitar asli.",
      condition: "like_new",
      sellPrice: 9990000,
      rentPriceDaily: 180000,
      rentPriceWeekly: 1000000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Tipe Layar", specValue: "Dual Micro-OLED 1080p" },
        { specKey: "Refresh Rate", specValue: "Hingga 100 Hz" },
        { specKey: "Fitur PiP", specValue: "Real View (Kamera depan untuk melihat sekitar)" },
        { specKey: "Koneksi", specValue: "DJI O4 Low Latency Transmission" }
      ]
    },
    {
      name: "DJI RC 2 Smart Controller",
      brand: "DJI",
      model: "RC 2",
      description: "Remot kontrol pintar DJI berlayar 5.5-inch cerah bawaan, membebaskan hp Anda saat terbang.",
      condition: "like_new",
      sellPrice: 5390000,
      rentPriceDaily: 80000,
      rentPriceWeekly: 450000,
      isFeatured: false,
      stockQuantity: 3,
      imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Layar", specValue: "5.5 inch FHD (1920x1080), 700 nits" },
        { specKey: "Transmisi", specValue: "O4 Transmission System (Antena Eksternal)" },
        { specKey: "Penyimpanan", specValue: "32 GB Internal (Bisa ditambah MicroSD)" }
      ]
    },
    {
      name: "Elgato Key Light Professional Studio LED",
      brand: "Elgato",
      model: "Key Light",
      description: "Lampu meja premium tanpa radiasi panas, andalan utama para streamer dan live vlogger pro.",
      condition: "good",
      sellPrice: 3290000,
      rentPriceDaily: 50000,
      rentPriceWeekly: 250000,
      isFeatured: false,
      stockQuantity: 3,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Kekuatan Cahaya", specValue: "Hingga 2800 lumens (Sangat Terang)" },
        { specKey: "Temperatur Warna", specValue: "2900K hingga 7000K (Warm to Cool)" },
        { specKey: "Koneksi", specValue: "Wi-Fi Terintegrasi (Kontrol via PC/Stream Deck)" },
        { specKey: "Konstruksi", specValue: "Desk Clamp dengan besi kokoh telescoping" }
      ]
    },
    {
      name: "Hollyland Mars 400S Pro Wireless Transmitter",
      brand: "Hollyland",
      model: "Mars 400S Pro",
      description: "Sistem transmisi video nirkabel HDMI/SDI, mengirimkan visual mentah kamera ke monitor sutradara.",
      condition: "like_new",
      sellPrice: 9490000,
      rentPriceDaily: 180000,
      rentPriceWeekly: 1000000,
      isFeatured: false,
      stockQuantity: 2,
      specs: [
        { specKey: "Jangkauan Transmisi", specValue: "Hingga 120 meter (LOS)" },
        { specKey: "Latensi", specValue: "Sangat rendah (0.08 detik)" },
        { specKey: "Port Antarmuka", specValue: "SDI & HDMI Input/Output" },
        { specKey: "Fitur Apps", specValue: "Monitoring ke 4 HP/Tablet sekaligus" }
      ],
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60"
    },
    {
      name: "Atomos Ninja V 5\" 4K HDMI Monitor",
      brand: "Atomos",
      model: "Ninja V",
      description: "Monitor monitor eksternal sekaligus perekam video ProRes RAW 10-bit berkualitas bioskop.",
      condition: "good",
      sellPrice: 8990000,
      rentPriceDaily: 150000,
      rentPriceWeekly: 900000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Ukuran Layar", specValue: "5 inch IPS touchscreen" },
        { specKey: "Kecerahan", specValue: "1000 nits (Terlihat jelas di bawah matahari)" },
        { specKey: "Format Rekam", specValue: "Apple ProRes / Avid DNxHR ke SSD" },
        { specKey: "Input/Output", specValue: "HDMI 2.0 Input & Output" }
      ]
    },
    {
      name: "Zhiyun Smooth 5S Smartphone Gimbal",
      brand: "Zhiyun",
      model: "Smooth 5S",
      description: "Gimbal smartphone 3-axis professional dengan lampu sorot magnetik bawaan untuk vlogging hp.",
      condition: "good",
      sellPrice: 2490000,
      rentPriceDaily: 50000,
      rentPriceWeekly: 250000,
      isFeatured: false,
      stockQuantity: 4,
      imageUrl: "https://images.unsplash.com/photo-1603178458925-333f24507b40?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Stabilisasi", specValue: "3-Axis Professional Steel Motors" },
        { specKey: "Lampu Bawaan", specValue: "Built-in Fill Light 650 Lumens" },
        { specKey: "Beban Maksimal", specValue: "300 gram (Mendukung iPhone Pro Max)" }
      ]
    },
    {
      name: "Peak Design Slide Camera Strap - Sage Green",
      brand: "Peak Design",
      model: "Slide Strap",
      description: "Tali kamera ternyaman dengan jangkar jangkar Anchor Link lepas-pasang super cepat.",
      condition: "new",
      sellPrice: 1199000,
      rentPriceDaily: 15000,
      rentPriceWeekly: 75000,
      isFeatured: false,
      stockQuantity: 10,
      imageUrl: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Konektor", specValue: "Anchor Link System (Kekuatan beban 90 kg)" },
        { specKey: "Bahan", specValue: "Premium Seatbelt-style Nylon Webbing" },
        { specKey: "Lebar Strap", specValue: "4.5 cm (Distribusi beban merata)" }
      ]
    },
    {
      name: "Blackmagic Design ATEM Mini Pro Switcher",
      brand: "Blackmagic Design",
      model: "ATEM Mini Pro",
      description: "Switcher video HDMI 4 channel, wajib untuk live streaming multi-kamera profesional.",
      condition: "like_new",
      sellPrice: 5890000,
      rentPriceDaily: 150000,
      rentPriceWeekly: 900000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Input Video", specValue: "4x HDMI tipe A" },
        { specKey: "Output", specValue: "1x HDMI (Projector/Monitor) & 1x USB-C (Webcam output)" },
        { specKey: "Fitur Hardware", specValue: "Direct Streaming via Ethernet, Multiview output" }
      ]
    },
    {
      name: "DJI Osmo Pocket 3 Creator Combo",
      brand: "DJI",
      model: "Osmo Pocket 3",
      description: "Kamera saku bersensor 1-inch dengan gimbal mekanis 3-axis terintegrasi dan layar putar inovatif.",
      condition: "like_new",
      sellPrice: 11899000,
      rentPriceDaily: 200000,
      rentPriceWeekly: 1200000,
      isFeatured: true,
      stockQuantity: 3,
      imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Sensor", specValue: "1-inch CMOS Sensor" },
        { specKey: "Layar", specValue: "2-inch Rotatable Touchscreen OLED" },
        { specKey: "Video", specValue: "4K 120fps / 4K 60fps HDR" },
        { specKey: "Stabilisasi", specValue: "3-Axis Mechanical Gimbal" },
        { specKey: "Audio Combo", specValue: "Termasuk 1x DJI Mic 2 Transmitter" }
      ]
    },
    {
      name: "Insta360 X4 8K 360 Action Camera",
      brand: "Insta360",
      model: "X4",
      description: "Kamera aksi 360 derajat generasi terbaru dengan perekaman video beresolusi super tajam 8K.",
      condition: "like_new",
      sellPrice: 9499000,
      rentPriceDaily: 180000,
      rentPriceWeekly: 1000000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Resolusi Video", specValue: "8K 30fps / 5.7K 60fps video 360°" },
        { specKey: "Fitur", specValue: "Invisible Selfie Stick effect (Tongsis menghilang)" },
        { specKey: "Baterai", specValue: "Baterai jumbo 2295 mAh" },
        { specKey: "Tahan Air", specValue: "Hingga kedalaman 10 meter tanpa case" }
      ]
    },
    {
      name: "Aputure Light Dome II Softbox",
      brand: "Aputure",
      model: "Light Dome II",
      description: "Softbox melingkar berdiameter besar dengan 16 tiang fiberglass kokoh untuk cahaya studio portrait super lembut.",
      condition: "good",
      sellPrice: 3890000,
      rentPriceDaily: 40000,
      rentPriceWeekly: 200000,
      isFeatured: false,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60",
      specs: [
        { specKey: "Diameter Softbox", specValue: "34.8 inch (89 cm)" },
        { specKey: "Kubah Reflektor", specValue: "Deep parabolic design" },
        { specKey: "Dudukan", specValue: "Bowens Mount kompatibel" },
        { specKey: "Aksesoris", specValue: "Termasuk Honeycomb grid & tas jinjing" }
      ]
    }
  ];

  // 6. Menyemai Semua Produk Ke Database
  console.log('Menyemai data Handphone...');
  const hpCat = categories['handphone'];
  for (let i = 0; i < handphones.length; i++) {
    const hp = handphones[i];
    const slug = slugify(hp.name);
    const isRentable = i % 3 !== 2;
    const isSellable = i % 3 !== 1;
    await prisma.product.create({
      data: {
        categoryId: hpCat.id,
        name: hp.name,
        slug: slug,
        brand: hp.brand,
        model: hp.model,
        description: hp.description,
        condition: hp.condition,
        sellPrice: isSellable ? hp.sellPrice : null,
        rentPriceDaily: isRentable ? hp.rentPriceDaily : null,
        rentPriceWeekly: isRentable ? hp.rentPriceWeekly : null,
        status: "ready",
        isFeatured: hp.isFeatured,
        isRentable,
        isSellable,
        stockQuantity: hp.stockQuantity,
        images: {
          create: [
            {
              imageUrl: hp.imageUrl,
              storagePath: `products/${slug}/primary.jpg`,
              isPrimary: true,
              sortOrder: 1
            }
          ]
        },
        specs: {
          create: hp.specs.map((spec, index) => ({
            specKey: spec.specKey,
            specValue: spec.specValue,
            sortOrder: index + 1
          }))
        }
      }
    });
  }

  console.log('Menyemai data Kamera & Lensa...');
  const camCat = categories['kamera-lensa'];
  for (let i = 0; i < cameras.length; i++) {
    const cam = cameras[i];
    const slug = slugify(cam.name);
    const isRentable = i % 3 !== 2;
    const isSellable = i % 3 !== 1;
    await prisma.product.create({
      data: {
        categoryId: camCat.id,
        name: cam.name,
        slug: slug,
        brand: cam.brand,
        model: cam.model,
        description: cam.description,
        condition: cam.condition,
        sellPrice: isSellable ? cam.sellPrice : null,
        rentPriceDaily: isRentable ? cam.rentPriceDaily : null,
        rentPriceWeekly: isRentable ? cam.rentPriceWeekly : null,
        status: "ready",
        isFeatured: cam.isFeatured,
        isRentable,
        isSellable,
        stockQuantity: cam.stockQuantity,
        images: {
          create: [
            {
              imageUrl: cam.imageUrl,
              storagePath: `products/${slug}/primary.jpg`,
              isPrimary: true,
              sortOrder: 1
            }
          ]
        },
        specs: {
          create: cam.specs.map((spec, index) => ({
            specKey: spec.specKey,
            specValue: spec.specValue,
            sortOrder: index + 1
          }))
        }
      }
    });
  }

  console.log('Menyemai data Drone...');
  const droneCat = categories['drone'];
  for (let i = 0; i < drones.length; i++) {
    const drone = drones[i];
    const slug = slugify(drone.name);
    const isRentable = i % 3 !== 2;
    const isSellable = i % 3 !== 1;
    await prisma.product.create({
      data: {
        categoryId: droneCat.id,
        name: drone.name,
        slug: slug,
        brand: drone.brand,
        model: drone.model,
        description: drone.description,
        condition: drone.condition,
        sellPrice: isSellable ? drone.sellPrice : null,
        rentPriceDaily: isRentable ? drone.rentPriceDaily : null,
        rentPriceWeekly: isRentable ? drone.rentPriceWeekly : null,
        status: "ready",
        isFeatured: drone.isFeatured,
        isRentable,
        isSellable,
        stockQuantity: drone.stockQuantity,
        images: {
          create: [
            {
              imageUrl: drone.imageUrl,
              storagePath: `products/${slug}/primary.jpg`,
              isPrimary: true,
              sortOrder: 1
            }
          ]
        },
        specs: {
          create: drone.specs.map((spec, index) => ({
            specKey: spec.specKey,
            specValue: spec.specValue,
            sortOrder: index + 1
          }))
        }
      }
    });
  }

  console.log('Menyemai data Aksesoris...');
  const accCat = categories['aksesoris'];
  for (let i = 0; i < accessories.length; i++) {
    const acc = accessories[i];
    const slug = slugify(acc.name);
    const isRentable = i % 3 !== 2;
    const isSellable = i % 3 !== 1;
    await prisma.product.create({
      data: {
        categoryId: accCat.id,
        name: acc.name,
        slug: slug,
        brand: acc.brand,
        model: acc.model,
        description: acc.description,
        condition: acc.condition,
        sellPrice: isSellable ? acc.sellPrice : null,
        rentPriceDaily: isRentable ? acc.rentPriceDaily : null,
        rentPriceWeekly: isRentable ? acc.rentPriceWeekly : null,
        status: "ready",
        isFeatured: acc.isFeatured,
        isRentable,
        isSellable,
        stockQuantity: acc.stockQuantity,
        images: {
          create: [
            {
              imageUrl: acc.imageUrl,
              storagePath: `products/${slug}/primary.jpg`,
              isPrimary: true,
              sortOrder: 1
            }
          ]
        },
        specs: {
          create: acc.specs.map((spec, index) => ({
            specKey: spec.specKey,
            specValue: spec.specValue,
            sortOrder: index + 1
          }))
        }
      }
    });
  }

  const totalProducts = await prisma.product.count();
  console.log(`Penyemaian selesai! Total produk yang terdaftar: ${totalProducts} produk.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
