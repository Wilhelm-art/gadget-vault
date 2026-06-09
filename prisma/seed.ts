import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Hash password for admin
  const adminPasswordHash = await bcrypt.hash('password123', 10);

  // 2. Create Admin User
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
  console.log('Admin user seeded:', admin.email);

  // 3. Create StoreSettings
  const storeSettings = await prisma.storeSettings.create({
    data: {
      storeName: 'GadgetVault',
      address: 'Jl. Muara Takus Raya Jl. Trowulan No.21A, Melong, Kec. Cimahi Sel., Kota Cimahi, Jawa Barat 40534',
      phone: '081234567890',
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
  console.log('Store settings seeded.');

  // 4. Create Categories
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
  console.log('Categories seeded.');

  // 5. Create Sample Products
  // 5.1 iPhone 15 Pro Max
  const iphone = await prisma.product.create({
    data: {
      categoryId: categories['handphone'].id,
      name: 'iPhone 15 Pro Max 256GB - Titanium Gray',
      slug: 'iphone-15-pro-max-256gb-titanium-gray',
      brand: 'Apple',
      model: 'iPhone 15 Pro Max',
      description: 'iPhone 15 Pro Max memiliki desain titanium kelas dirgantara yang kuat dan ringan, dengan bagian belakang kaca matte bertekstur. Dilengkapi juga dengan Ceramic Shield bagian depan yang lebih tangguh dari kaca ponsel pintar mana pun. Menggunakan Chip A17 Pro yang bertenaga dengan GPU kelas pro. Kamera utama 48 MP menghasilkan detail dan warna yang memukau.',
      condition: 'like_new',
      sellPrice: 20499000.00,
      rentPriceDaily: 250000.00,
      rentPriceWeekly: 1500000.00,
      status: 'ready',
      isFeatured: true,
      isRentable: true,
      isSellable: true,
      stockQuantity: 3,
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=60',
            storagePath: 'products/sample/iphone15_1.jpg',
            isPrimary: true,
            sortOrder: 1,
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1695048133137-b452e6900ee9?w=800&auto=format&fit=crop&q=60',
            storagePath: 'products/sample/iphone15_2.jpg',
            isPrimary: false,
            sortOrder: 2,
          }
        ]
      },
      specs: {
        create: [
          { specKey: 'Layar', specValue: '6.7 inch Super Retina XDR OLED', sortOrder: 1 },
          { specKey: 'Chipset', specValue: 'Apple A17 Pro (3 nm)', sortOrder: 2 },
          { specKey: 'Penyimpanan', specValue: '256 GB', sortOrder: 3 },
          { specKey: 'Kamera Utama', specValue: '48 MP (wide) + 12 MP (telephoto) + 12 MP (ultrawide)', sortOrder: 4 },
          { specKey: 'Konektor', specValue: 'USB Type-C 3.0', sortOrder: 5 }
        ]
      }
    }
  });

  // 5.1.2 Samsung Galaxy S24 Ultra
  const s24Ultra = await prisma.product.create({
    data: {
      categoryId: categories['handphone'].id,
      name: 'Samsung Galaxy S24 Ultra 256GB - Titanium Yellow',
      slug: 'samsung-galaxy-s24-ultra-256gb-titanium-yellow',
      brand: 'Samsung',
      model: 'Galaxy S24 Ultra',
      description: 'Samsung Galaxy S24 Ultra menawarkan kamera utama 200 MP yang luar biasa jernih, zoom optik 5x kelas profesional dengan sensor 50 MP, serta teknologi ProVisual Engine berbasis AI untuk detail foto malam hari yang menakjubkan. HP ini dirancang khusus untuk mengandalkan kualitas kamera terbaik di berbagai kondisi pencahayaan.',
      condition: 'like_new',
      sellPrice: 19999000.00,
      rentPriceDaily: 220000.00,
      rentPriceWeekly: 1300000.00,
      status: 'ready',
      isFeatured: true,
      isRentable: true,
      isSellable: true,
      stockQuantity: 2,
      images: {
        create: [
          {
            imageUrl: '/products/galaxy-s24-ultra.webp',
            storagePath: 'products/galaxy-s24-ultra.webp',
            isPrimary: true,
            sortOrder: 1,
          }
        ]
      },
      specs: {
        create: [
          { specKey: 'Layar', specValue: '6.8 inch Dynamic AMOLED 2X, 120Hz', sortOrder: 1 },
          { specKey: 'Chipset', specValue: 'Snapdragon 8 Gen 3 for Galaxy (4 nm)', sortOrder: 2 },
          { specKey: 'Penyimpanan', specValue: '256 GB / 12 GB RAM', sortOrder: 3 },
          { specKey: 'Kamera Utama', specValue: '200 MP (wide) + 50 MP (periscope telephoto) + 10 MP (telephoto) + 12 MP (ultrawide)', sortOrder: 4 },
          { specKey: 'Fitur Kamera', specValue: '8K Video, 5x Optical Zoom, Nightography AI, Space Zoom 100x', sortOrder: 5 }
        ]
      }
    }
  });

  // 5.2 Sony A7 IV
  const sonyCamera = await prisma.product.create({
    data: {
      categoryId: categories['kamera-lensa'].id,
      name: 'Sony Alpha 7 IV Mirrorless Camera (Body Only)',
      slug: 'sony-alpha-7-iv-mirrorless-camera-body-only',
      brand: 'Sony',
      model: 'Alpha 7 IV',
      description: 'Kamera mirrorless hybrid modern dengan sensor gambar Exmor R CMOS back-illuminated full-frame 33,0 megapiksel yang baru dikembangkan. Menawarkan performa luar biasa dan kualitas gambar menakjubkan baik untuk foto maupun film, dilengkapi autofocus real-time canggih untuk manusia, hewan, dan burung.',
      condition: 'good',
      sellPrice: 31999000.00,
      rentPriceDaily: 350000.00,
      rentPriceWeekly: 2100000.00,
      status: 'ready',
      isFeatured: true,
      isRentable: true,
      isSellable: true,
      stockQuantity: 2,
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1619896796338-9cb5ee533ab5?w=800&auto=format&fit=crop&q=60',
            storagePath: 'products/sample/sonya7iv_1.jpg',
            isPrimary: true,
            sortOrder: 1,
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=60',
            storagePath: 'products/sample/sonya7iv_2.jpg',
            isPrimary: false,
            sortOrder: 2,
          }
        ]
      },
      specs: {
        create: [
          { specKey: 'Sensor', specValue: '33 MP Full-Frame Exmor R CMOS', sortOrder: 1 },
          { specKey: 'Prosesor', specValue: 'BIONZ XR', sortOrder: 2 },
          { specKey: 'Autofokus', specValue: '759-Point Phase-Detection AF', sortOrder: 3 },
          { specKey: 'Perekaman Video', specValue: '4K 60p 10-Bit 4:2:2 Video', sortOrder: 4 },
          { specKey: 'Stabilisasi', specValue: '5-axis SteadyShot Inside', sortOrder: 5 }
        ]
      }
    }
  });

  // 5.3 DJI Mini 4 Pro
  const droneDji = await prisma.product.create({
    data: {
      categoryId: categories['drone'].id,
      name: 'DJI Mini 4 Pro Fly More Combo (DJI RC 2)',
      slug: 'dji-mini-4-pro-fly-more-combo-dji-rc-2',
      brand: 'DJI',
      model: 'Mini 4 Pro',
      description: 'Drone mini berukuran ringkas dengan kemampuan pencitraan luar biasa. Memiliki berat di bawah 249 gram yang ramah regulasi, dilengkapi deteksi rintangan omnidirectional demi keamanan maksimal. Kamera 48 MP mendukung perekaman video vertikal HDR 4K/60fps dengan waktu terbang hingga 34 menit.',
      condition: 'like_new',
      sellPrice: 17490000.00,
      rentPriceDaily: 250000.00,
      rentPriceWeekly: 1400000.00,
      status: 'ready',
      isFeatured: true,
      isRentable: true,
      isSellable: true,
      stockQuantity: 1,
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=60',
            storagePath: 'products/sample/djimin4_1.jpg',
            isPrimary: true,
            sortOrder: 1,
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&auto=format&fit=crop&q=60',
            storagePath: 'products/sample/djimin4_2.jpg',
            isPrimary: false,
            sortOrder: 2,
          }
        ]
      },
      specs: {
        create: [
          { specKey: 'Berat', specValue: '< 249 gram', sortOrder: 1 },
          { specKey: 'Sensor Kamera', specValue: '1/1.3-inch CMOS, 48 Megapiksel', sortOrder: 2 },
          { specKey: 'Video Resolution', specValue: '4K/60fps HDR dan 4K/100fps Slow Motion', sortOrder: 3 },
          { specKey: 'Obstacle Sensing', specValue: 'Omnidirectional Obstacle Sensing', sortOrder: 4 },
          { specKey: 'Flight Time', specValue: 'Hingga 34 Menit (Intelligent Flight Battery)', sortOrder: 5 }
        ]
      }
    }
  });

  // 5.4 DJI Mic 2
  const micDji = await prisma.product.create({
    data: {
      categoryId: categories['aksesoris'].id,
      name: 'DJI Mic 2 (2 TX + 1 RX + Charging Case)',
      slug: 'dji-mic-2-2-tx-1-rx-charging-case',
      brand: 'DJI',
      model: 'Mic 2',
      description: 'Sistem mikrofon nirkabel saku yang siap merekam audio berkualitas profesional untuk video Anda. Menawarkan perekaman internal 32-bit float yang jernih, peredam bising cerdas, jangkauan transmisi hingga 250 meter, dan masa pakai baterai hingga 18 jam dengan wadah pengisi daya.',
      condition: 'like_new',
      sellPrice: 5200000.00,
      rentPriceDaily: 90000.00,
      rentPriceWeekly: 500000.00,
      status: 'ready',
      isFeatured: false,
      isRentable: true,
      isSellable: true,
      stockQuantity: 5,
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1590608897129-79da98d15969?w=800&auto=format&fit=crop&q=60',
            storagePath: 'products/sample/djimic2_1.jpg',
            isPrimary: true,
            sortOrder: 1,
          }
        ]
      },
      specs: {
        create: [
          { specKey: 'Tipe', specValue: 'Dual-Channel Wireless Microphone', sortOrder: 1 },
          { specKey: 'Internal Recording', specValue: '32-bit Float Internal Recording', sortOrder: 2 },
          { specKey: 'Jangkauan', specValue: 'Hingga 250 meter (LOS)', sortOrder: 3 },
          { specKey: 'Daya Tahan Baterai', specValue: '6 Jam (TX) / 18 Jam total dengan Case', sortOrder: 4 },
          { specKey: 'Noise Cancelling', specValue: 'Intelligent Noise Cancelling', sortOrder: 5 }
        ]
      }
    }
  });

  console.log('Sample products seeded:', [iphone.name, s24Ultra.name, sonyCamera.name, droneDji.name, micDji.name]);
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
