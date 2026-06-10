# Implementation Plan — GadgetVault

> Platform Jual, Beli & Sewa Gadget  
> **Berdasarkan:** [PRD GadgetVault](file:///C:/Users/Sadut/.gemini/antigravity/brain/9dc89219-21ce-42f6-97a0-e3c69817d065/prd_gadget_store.md)

---

## Arsitektur & Dependency Graph

Modul-modul di bawah disusun berdasarkan **urutan dependency** — modul atas harus selesai sebelum modul bawah bisa dikerjakan.

```mermaid
flowchart TD
    M1["M1: Project Foundation"] --> M2["M2: Database & ORM"]
    M1 --> M3["M3: Design System"]
    M2 --> M4["M4: Auth & KYC"]
    M3 --> M5["M5: Layout & Navigation"]
    M2 --> M6["M6: Katalog Produk"]
    M3 --> M6
    M4 --> M7["M7: Sistem Sewa"]
    M6 --> M7
    M4 --> M8["M8: Sistem Beli & Jual"]
    M6 --> M8
    M7 --> M9["M9: Sistem Deposit"]
    M4 --> M10["M10: Admin Dashboard"]
    M6 --> M10
    M7 --> M10
    M8 --> M10
    M9 --> M10
    M5 --> M11["M11: Halaman Publik & Peta"]
    M10 --> M12["M12: SEO, Testing & Deploy"]
    M11 --> M12

    style M1 fill:#C9A96E,color:#fff
    style M2 fill:#C9A96E,color:#fff
    style M3 fill:#C9A96E,color:#fff
    style M4 fill:#4A7C59,color:#fff
    style M5 fill:#4A7C59,color:#fff
    style M6 fill:#4A7C59,color:#fff
    style M7 fill:#4A6FA5,color:#fff
    style M8 fill:#4A6FA5,color:#fff
    style M9 fill:#4A6FA5,color:#fff
    style M10 fill:#B44A4A,color:#fff
    style M11 fill:#B44A4A,color:#fff
    style M12 fill:#1A1A1A,color:#fff
```

> [!NOTE]
> 🟡 Gold = Fondasi (Minggu 1) · 🟢 Hijau = Core Features (Minggu 2–3) · 🔵 Biru = Business Logic (Minggu 3–4) · 🔴 Merah = Dashboard & Halaman (Minggu 5) · ⚫ Hitam = Final (Minggu 6)

---

## Struktur Folder Proyek

```
gadgetvault/
├── .env.local                          # Environment variables
├── .env.example                        # Template env
├── next.config.ts                      # Next.js configuration
├── tailwind.config.ts                  # Tailwind + design tokens
├── tsconfig.json                       # TypeScript config
├── package.json
│
├── prisma/
│   ├── schema.prisma                   # Database schema
│   ├── seed.ts                         # Seed data (kategori, admin, produk contoh)
│   └── migrations/                     # Auto-generated migrations
│
├── public/
│   ├── favicon.ico
│   ├── og-image.jpg                    # Default Open Graph image
│   ├── robots.txt
│   └── icons/                          # Category icons, PWA icons
│
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── layout.tsx                  # Root layout (fonts, metadata, providers)
│   │   ├── page.tsx                    # Landing page
│   │   ├── globals.css                 # Global styles + design tokens
│   │   ├── not-found.tsx               # Custom 404
│   │   ├── error.tsx                   # Error boundary
│   │   ├── loading.tsx                 # Global loading state
│   │   │
│   │   ├── (auth)/                     # Auth route group
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx              # Auth layout (centered card)
│   │   │
│   │   ├── (main)/                     # Public route group
│   │   │   ├── layout.tsx              # Main layout (navbar + footer)
│   │   │   ├── katalog/
│   │   │   │   ├── page.tsx            # Catalog grid + filters
│   │   │   │   └── [slug]/page.tsx     # Product detail
│   │   │   ├── sewa/
│   │   │   │   ├── page.tsx            # Rental catalog
│   │   │   │   └── [slug]/page.tsx     # Rental booking form
│   │   │   ├── jual/page.tsx           # Sell form
│   │   │   ├── tentang/page.tsx        # About + map
│   │   │   └── faq/page.tsx            # FAQ accordion
│   │   │
│   │   ├── (user)/                     # Authenticated user route group
│   │   │   ├── layout.tsx              # User sidebar layout
│   │   │   ├── profil/page.tsx         # Profile + KYC status
│   │   │   ├── kyc/page.tsx            # KYC upload form
│   │   │   ├── transaksi/
│   │   │   │   ├── page.tsx            # Transaction history
│   │   │   │   └── [id]/page.tsx       # Transaction detail
│   │   │   ├── wishlist/page.tsx       # Saved products
│   │   │   └── notifikasi/page.tsx     # Notifications
│   │   │
│   │   ├── admin/                      # Admin dashboard
│   │   │   ├── layout.tsx              # Admin sidebar layout
│   │   │   ├── page.tsx                # Dashboard overview
│   │   │   ├── produk/
│   │   │   │   ├── page.tsx            # Product list
│   │   │   │   ├── tambah/page.tsx     # Add product
│   │   │   │   └── [id]/edit/page.tsx  # Edit product
│   │   │   ├── transaksi/
│   │   │   │   ├── sewa/page.tsx       # Rental transactions
│   │   │   │   ├── beli/page.tsx       # Purchase transactions
│   │   │   │   └── jual/page.tsx       # Sell offers
│   │   │   ├── pelanggan/
│   │   │   │   ├── page.tsx            # Customer list
│   │   │   │   └── [id]/page.tsx       # Customer detail + KYC
│   │   │   ├── deposit/page.tsx        # Deposit management
│   │   │   ├── kyc/page.tsx            # KYC verification queue
│   │   │   └── pengaturan/page.tsx     # Store settings
│   │   │
│   │   ├── api/                        # API Routes
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── products/route.ts
│   │   │   ├── products/[id]/route.ts
│   │   │   ├── upload/route.ts         # Google Drive upload
│   │   │   ├── rentals/route.ts
│   │   │   ├── rentals/[id]/route.ts
│   │   │   ├── purchases/route.ts
│   │   │   ├── sell-offers/route.ts
│   │   │   ├── kyc/route.ts
│   │   │   ├── deposits/route.ts
│   │   │   ├── notifications/route.ts
│   │   │   ├── admin/stats/route.ts
│   │   │   └── admin/settings/route.ts
│   │   │
│   │   └── sitemap.ts                  # Dynamic sitemap generation
│   │
│   ├── components/
│   │   ├── ui/                         # Primitive UI (shadcn/ui + custom)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── select.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── avatar.tsx
│   │   │   └── calendar.tsx
│   │   │
│   │   ├── layout/                     # Layout components
│   │   │   ├── navbar.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── sidebar.tsx             # Admin sidebar
│   │   │   ├── mobile-nav.tsx          # Mobile bottom nav
│   │   │   └── breadcrumb.tsx
│   │   │
│   │   ├── product/                    # Product-related
│   │   │   ├── product-card.tsx
│   │   │   ├── product-grid.tsx
│   │   │   ├── product-gallery.tsx
│   │   │   ├── product-specs.tsx
│   │   │   ├── product-filter.tsx
│   │   │   ├── availability-badge.tsx
│   │   │   └── price-display.tsx
│   │   │
│   │   ├── rental/                     # Rental-related
│   │   │   ├── rental-calendar.tsx
│   │   │   ├── rental-form.tsx
│   │   │   ├── rental-summary.tsx
│   │   │   └── photo-upload.tsx
│   │   │
│   │   ├── kyc/                        # KYC-related
│   │   │   ├── kyc-form.tsx
│   │   │   ├── kyc-status.tsx
│   │   │   └── kyc-review.tsx          # Admin: review KYC
│   │   │
│   │   ├── transaction/                # Transaction-related
│   │   │   ├── transaction-card.tsx
│   │   │   ├── transaction-timeline.tsx
│   │   │   └── status-badge.tsx
│   │   │
│   │   ├── admin/                      # Admin-specific
│   │   │   ├── stats-card.tsx
│   │   │   ├── revenue-chart.tsx
│   │   │   ├── recent-activity.tsx
│   │   │   ├── data-table.tsx
│   │   │   └── action-modal.tsx
│   │   │
│   │   ├── map/                        # Map component
│   │   │   └── store-map.tsx
│   │   │
│   │   └── shared/                     # Shared/common
│   │       ├── hero-section.tsx
│   │       ├── category-grid.tsx
│   │       ├── testimonial-slider.tsx
│   │       ├── faq-accordion.tsx
│   │       ├── file-upload.tsx
│   │       ├── image-lightbox.tsx
│   │       ├── empty-state.tsx
│   │       ├── page-header.tsx
│   │       └── scroll-reveal.tsx
│   │
│   ├── lib/                            # Utilities & configs
│   │   ├── prisma.ts                   # Prisma client singleton
│   │   ├── auth.ts                     # NextAuth config
│   │   ├── gdrive.ts                   # Google Drive API helper
│   │   ├── utils.ts                    # General utilities
│   │   ├── validators.ts              # Zod schemas (shared)
│   │   └── constants.ts               # App-wide constants
│   │
│   ├── hooks/                          # Custom React hooks
│   │   ├── use-toast.ts
│   │   ├── use-upload.ts
│   │   ├── use-debounce.ts
│   │   └── use-intersection.ts
│   │
│   ├── stores/                         # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── cart-store.ts               # Rental cart
│   │   └── notification-store.ts
│   │
│   ├── types/                          # TypeScript types
│   │   ├── product.ts
│   │   ├── rental.ts
│   │   ├── transaction.ts
│   │   ├── user.ts
│   │   └── api.ts
│   │
│   └── middleware.ts                   # Auth + role middleware
│
└── tests/                              # (Fase 2)
    ├── e2e/
    └── unit/
```

---

## Modul 1 — Project Foundation

> **Minggu:** 1 (Hari 1–2)  
> **Dependency:** Tidak ada  
> **Tujuan:** Setup project Next.js, install semua dependencies, konfigurasi environment

### [NEW] Project Initialization

```bash
# Inisialisasi project
npx -y create-next-app@latest ./gadgetvault --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### [NEW] Package Dependencies

```bash
# Core
npm install prisma @prisma/client next-auth@beta @auth/prisma-adapter
npm install zustand react-hook-form @hookform/resolvers zod
npm install framer-motion recharts

# UI
npx -y shadcn@latest init
npx -y shadcn@latest add button input badge card dialog dropdown-menu select skeleton toast table tabs avatar calendar

# Google Drive
npm install googleapis

# Maps
npm install leaflet react-leaflet
npm install -D @types/leaflet

# PDF & Utils
npm install @react-pdf/renderer date-fns slugify
npm install -D prisma

# Dev
npm install -D @types/node @types/react prettier eslint-config-prettier
```

### [MODIFY] [next.config.ts](file:///gadgetvault/next.config.ts)
- Konfigurasi image domains (Google Drive, placeholder images)
- Setup headers (CSP, security headers)
- Redirect rules

### [NEW] [.env.local](file:///gadgetvault/.env.local)
```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Google Drive
GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY='...'
GOOGLE_DRIVE_ROOT_FOLDER_ID="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_STORE_NAME="GadgetVault"
```

### [NEW] [.env.example](file:///gadgetvault/.env.example)
- Template tanpa nilai sensitif

---

## Modul 2 — Database & ORM

> **Minggu:** 1 (Hari 2–3)  
> **Dependency:** M1  
> **Tujuan:** Definisi schema Prisma, migrasi, dan seed data awal

### [NEW] [prisma/schema.prisma](file:///gadgetvault/prisma/schema.prisma)

Implementasi seluruh tabel dari ERD di PRD:

| Model | Deskripsi |
|-------|-----------|
| `User` | Akun pelanggan & admin, termasuk KYC status |
| `KycDocument` | Dokumen KYC (foto KTP, selfie) |
| `Category` | Kategori produk (HP, Kamera, Drone, Aksesoris) |
| `Product` | Data produk lengkap |
| `ProductImage` | Galeri foto produk (link ke Google Drive) |
| `ProductSpec` | Spesifikasi produk (key-value pairs) |
| `RentalTransaction` | Transaksi sewa |
| `RentalPhoto` | Foto dokumentasi pickup/return |
| `PurchaseTransaction` | Transaksi beli |
| `SellOffer` | Penawaran jual dari customer |
| `SellOfferImage` | Foto barang yang dijual |
| `Deposit` | Deposit untuk pelanggan luar kota |
| `Wishlist` | Produk favorit user |
| `Notification` | Notifikasi in-app |
| `StoreSettings` | Pengaturan toko (singleton) |
| `AdminLog` | Audit trail aktivitas admin |

### [NEW] [prisma/seed.ts](file:///gadgetvault/prisma/seed.ts)

Seed data meliputi:
- 4 kategori default (HP, Kamera, Drone, Aksesoris)
- 1 akun admin (email: admin@gadgetvault.com)
- 1 record StoreSettings (alamat toko, jam buka, % deposit)
- 5–10 produk contoh per kategori dengan spesifikasi & gambar placeholder

### [NEW] [src/lib/prisma.ts](file:///gadgetvault/src/lib/prisma.ts)
- Prisma client singleton (prevent multiple instances in dev)

---

## Modul 3 — Design System

> **Minggu:** 1 (Hari 3–5)  
> **Dependency:** M1  
> **Tujuan:** Implementasi "Luxury Minimalism" design system dari PRD Section 6

### [MODIFY] [tailwind.config.ts](file:///gadgetvault/tailwind.config.ts)

Konfigurasi design tokens sesuai PRD:

```typescript
// Color palette dari PRD Section 6.2
colors: {
  bg: { primary: '#FAFAF8', secondary: '#F5F3EF', tertiary: '#EDEAE4' },
  text: { primary: '#1A1A1A', secondary: '#6B6B6B', muted: '#9CA3AF' },
  accent: { gold: '#C9A96E', 'gold-hover': '#B8944D', 'gold-light': '#F5EFE0' },
  success: '#4A7C59', warning: '#C4922A', danger: '#B44A4A', info: '#4A6FA5',
  border: '#E5E2DC',
},
// Typography dari PRD Section 6.3
fontFamily: {
  display: ['Playfair Display', 'serif'],
  sans: ['Inter', 'sans-serif'],
  price: ['DM Sans', 'sans-serif'],
},
// Spacing, border-radius, shadows dari PRD Section 6.5
```

### [MODIFY] [src/app/globals.css](file:///gadgetvault/src/app/globals.css)

- Import Google Fonts (Playfair Display, Inter, DM Sans)
- CSS custom properties sebagai fallback
- Global reset & base styles
- Animasi keyframes (shimmer, pulse, fade-in, slide-up)
- Scrollbar styling
- Selection color

### [MODIFY] [src/app/layout.tsx](file:///gadgetvault/src/app/layout.tsx)

- Setup font loading (next/font/google)
- Global metadata (title template, description, og)
- Providers wrapper (SessionProvider, Toaster)
- Body class dengan font variables

### Komponen UI Primitif (shadcn/ui customization)

Setiap komponen shadcn/ui di `src/components/ui/` di-customize agar sesuai design system PRD:

| Komponen | Kustomisasi |
|----------|-------------|
| `button.tsx` | Gradient gold CTA, secondary outline, ghost variant |
| `card.tsx` | Border `#E5E2DC`, radius 12px, hover lift effect |
| `input.tsx` | Focus ring gold, padding 12x16 |
| `badge.tsx` | Status badges (Ready/Disewa/Sold) dengan warna PRD |
| `skeleton.tsx` | Shimmer animation dengan warna warm |
| `toast.tsx` | Slide-in dari kanan atas |
| `dialog.tsx` | Backdrop blur, centered modal |

---

## Modul 4 — Authentication & KYC

> **Minggu:** 2 (Hari 1–3)  
> **Dependency:** M2  
> **Tujuan:** Login/register, Google OAuth, session management, upload & verifikasi KYC

### [NEW] [src/lib/auth.ts](file:///gadgetvault/src/lib/auth.ts)
- NextAuth v5 config dengan Prisma Adapter
- Providers: Credentials (email/password) + Google OAuth
- Callbacks: session, jwt (inject user role, KYC status)
- Pages: custom login/register

### [NEW] [src/middleware.ts](file:///gadgetvault/src/middleware.ts)
- Proteksi route `/user/*` → harus login
- Proteksi route `/admin/*` → harus login + role admin
- Redirect logic berdasarkan auth state

### [NEW] [src/app/(auth)/login/page.tsx](file:///gadgetvault/src/app/(auth)/login/page.tsx)
- Form login (email + password)
- Tombol "Login dengan Google"
- Link ke register
- Validasi client-side (Zod + React Hook Form)
- Desain: centered card, logo di atas, gradient accent

### [NEW] [src/app/(auth)/register/page.tsx](file:///gadgetvault/src/app/(auth)/register/page.tsx)
- Form: nama, email, phone, password, alamat, kota, provinsi
- Validasi: email unique, password min 8 char, phone format
- Auto-detect lokasi (kota) untuk deposit flow nanti

### [NEW] [src/app/(user)/kyc/page.tsx](file:///gadgetvault/src/app/(user)/kyc/page.tsx)
- Multi-step form:
  1. Upload foto KTP depan
  2. Upload foto KTP belakang
  3. Upload selfie memegang KTP
  4. Input nomor KTP
  5. Review & submit
- Preview gambar sebelum upload
- Progress indicator
- Status: jika sudah verified, tampilkan badge ✓

### [NEW] [src/components/kyc/kyc-form.tsx](file:///gadgetvault/src/components/kyc/kyc-form.tsx)
- Multi-step wizard component
- Image preview & crop (opsional)
- Upload progress bar

### [NEW] [src/components/kyc/kyc-status.tsx](file:///gadgetvault/src/components/kyc/kyc-status.tsx)
- Badge status: Unverified → Pending → Verified / Rejected
- Jika rejected: tampilkan alasan + tombol upload ulang

### API Routes:

#### [NEW] [src/app/api/auth/[...nextauth]/route.ts](file:///gadgetvault/src/app/api/auth/route.ts)
- NextAuth handler

#### [NEW] [src/app/api/auth/register/route.ts](file:///gadgetvault/src/app/api/auth/register/route.ts)
- POST: Create user, hash password (bcrypt), return session

#### [NEW] [src/app/api/kyc/route.ts](file:///gadgetvault/src/app/api/kyc/route.ts)
- POST: Upload dokumen KYC → Google Drive → simpan record
- GET: Ambil status KYC user saat ini

---

## Modul 5 — Layout & Navigation

> **Minggu:** 2 (Hari 3–4)  
> **Dependency:** M3  
> **Tujuan:** Navbar, footer, sidebar admin, mobile navigation, breadcrumb

### [NEW] [src/components/layout/navbar.tsx](file:///gadgetvault/src/components/layout/navbar.tsx)
- Logo + nama toko
- Navigation links: Katalog, Sewa, Jual, Tentang Kami
- Search bar (di tengah, collapse pada mobile)
- Auth buttons: Login / Register atau Avatar + dropdown
- Notification bell (badge counter)
- Sticky header dengan backdrop-blur on scroll
- Mobile: hamburger menu → slide-in drawer

### [NEW] [src/components/layout/footer.tsx](file:///gadgetvault/src/components/layout/footer.tsx)
- 4-column grid: Tentang, Layanan, Informasi, Kontak
- Alamat toko + link Google Maps
- WhatsApp quick link
- Social media links
- Copyright
- Mobile: stacked layout

### [NEW] [src/components/layout/sidebar.tsx](file:///gadgetvault/src/components/layout/sidebar.tsx)
- Admin sidebar navigation
- Sections: Dashboard, Produk, Transaksi (sub: Sewa/Beli/Jual), Pelanggan, KYC, Deposit, Pengaturan
- Active state indicator (gold accent left border)
- Collapsible pada tablet
- Badge counter pada menu yang ada pending items

### [NEW] [src/components/layout/mobile-nav.tsx](file:///gadgetvault/src/components/layout/mobile-nav.tsx)
- Bottom navigation bar (mobile only)
- 5 tab: Home, Katalog, Sewa, Profil, Menu
- Active state dengan gold accent
- Smooth transition animasi

### [NEW] [src/components/layout/breadcrumb.tsx](file:///gadgetvault/src/components/layout/breadcrumb.tsx)
- Dynamic breadcrumb berdasarkan route
- JSON-LD BreadcrumbList untuk SEO

### Route Group Layouts:

#### [MODIFY] [src/app/(main)/layout.tsx](file:///gadgetvault/src/app/(main)/layout.tsx)
- Navbar + main content + footer
- Mobile bottom nav

#### [NEW] [src/app/(user)/layout.tsx](file:///gadgetvault/src/app/(user)/layout.tsx)
- Navbar + user sidebar (profil menu) + content
- Auth guard

#### [MODIFY] [src/app/admin/layout.tsx](file:///gadgetvault/src/app/admin/layout.tsx)
- Admin sidebar + header bar + content area
- Admin auth guard (role check)

---

## Modul 6 — Katalog Produk

> **Minggu:** 2 (Hari 4–5) + Minggu 3 (Hari 1)  
> **Dependency:** M2, M3  
> **Tujuan:** CRUD produk (admin), display katalog (publik), Google Drive integration untuk gambar

### Google Drive Integration:

#### [NEW] [src/lib/gdrive.ts](file:///gadgetvault/src/lib/gdrive.ts)
- Service Account auth via googleapis
- `uploadFile(file, folderId)` → upload ke Drive, return file ID & web link
- `deleteFile(fileId)` → hapus dari Drive
- `createFolder(name, parentId)` → buat subfolder
- `getDirectLink(fileId)` → generate direct image URL
- Folder structure: `GadgetVault/products/{productId}/`

#### [NEW] [src/app/api/upload/route.ts](file:///gadgetvault/src/app/api/upload/route.ts)
- POST: Terima file (formidable/multer), validasi (MIME, size ≤5MB), upload ke GDrive
- Return: `{ fileId, url, thumbnailUrl }`

### Halaman Publik:

#### [NEW] [src/app/(main)/katalog/page.tsx](file:///gadgetvault/src/app/(main)/katalog/page.tsx)
- Server component (SSR untuk SEO)
- Product grid (3-4 kolom desktop, 2 tablet, 1 mobile)
- Sidebar filter: kategori, harga range, merek, kondisi, ketersediaan
- Search bar dengan debounce
- Sorting: terbaru, harga rendah-tinggi, populer
- Pagination atau infinite scroll
- Skeleton loading state

#### [NEW] [src/app/(main)/katalog/[slug]/page.tsx](file:///gadgetvault/src/app/(main)/katalog/[slug]/page.tsx)
- SSG + ISR (revalidate 60 detik)
- Image gallery (lightbox, swipe di mobile, thumbnail strip)
- Spesifikasi tabel (dari ProductSpec)
- Availability badge (Ready/Disewa/Sold)
- Harga: jual & sewa per hari/minggu (font DM Sans)
- Tombol aksi: "Sewa Sekarang" / "Beli Sekarang" / "Tambah Wishlist"
- Produk terkait (same category)
- Share button (WhatsApp, copy link)
- JSON-LD structured data (Product schema)
- `generateMetadata()` untuk dynamic meta tags

### Komponen:

#### [NEW] [src/components/product/product-card.tsx](file:///gadgetvault/src/components/product/product-card.tsx)
- Foto utama (aspect-ratio 4:3)
- Badge status (pojok kanan atas)
- Nama produk, brand
- Harga jual & sewa
- Hover: lift + shadow + quick-action overlay (wishlist, detail)

#### [NEW] [src/components/product/product-grid.tsx](file:///gadgetvault/src/components/product/product-grid.tsx)
- Responsive grid layout
- Toggle view: grid / list
- Empty state jika tidak ada produk

#### [NEW] [src/components/product/product-gallery.tsx](file:///gadgetvault/src/components/product/product-gallery.tsx)
- Main image + thumbnail strip
- Lightbox modal (zoom, prev/next)
- Swipe gesture di mobile
- Lazy loading

#### [NEW] [src/components/product/product-specs.tsx](file:///gadgetvault/src/components/product/product-specs.tsx)
- Tabel 2 kolom (spec key: value)
- Grouped by category (jika ada)
- Collapsible jika banyak

#### [NEW] [src/components/product/product-filter.tsx](file:///gadgetvault/src/components/product/product-filter.tsx)
- Sidebar (desktop) / bottom sheet (mobile)
- Checkbox group per kategori
- Range slider harga
- Reset filter button
- URL sync (query params) untuk shareable filter state

#### [NEW] [src/components/product/availability-badge.tsx](file:///gadgetvault/src/components/product/availability-badge.tsx)
- "Ready" → hijau, "Disewa" → kuning, "Sold" → merah, "Coming Soon" → abu

#### [NEW] [src/components/product/price-display.tsx](file:///gadgetvault/src/components/product/price-display.tsx)
- Format harga Rupiah (Rp 1.500.000)
- Font DM Sans, bold
- Dual display: harga jual + harga sewa/hari

### Admin CRUD Produk:

#### [NEW] [src/app/admin/produk/page.tsx](file:///gadgetvault/src/app/admin/produk/page.tsx)
- DataTable: nama, kategori, status, harga, stok, aksi
- Search + filter
- Tombol "Tambah Produk"
- Quick toggle status (Ready/Sold/Maintenance)

#### [NEW] [src/app/admin/produk/tambah/page.tsx](file:///gadgetvault/src/app/admin/produk/tambah/page.tsx)
- Multi-section form:
  - Info dasar (nama, kategori, brand, model, kondisi, deskripsi)
  - Harga (jual, sewa harian, sewa mingguan)
  - Gambar (drag & drop upload, reorder, set primary)
  - Spesifikasi (dynamic key-value, tambah/hapus row)
  - Opsi (is_featured, is_rentable, is_sellable, stock)
- Validasi Zod
- Preview sebelum submit

#### [NEW] [src/app/admin/produk/[id]/edit/page.tsx](file:///gadgetvault/src/app/admin/produk/[id]/edit/page.tsx)
- Form sama dengan tambah, pre-filled data
- Bisa hapus/tambah gambar
- Soft delete (status → archived)

### API Routes:

#### [NEW] [src/app/api/products/route.ts](file:///gadgetvault/src/app/api/products/route.ts)
- GET: List produk (filter, sort, pagination, search)
- POST: Create produk (admin only)

#### [NEW] [src/app/api/products/[id]/route.ts](file:///gadgetvault/src/app/api/products/[id]/route.ts)
- GET: Detail produk by ID/slug
- PUT: Update produk (admin only)
- DELETE: Soft delete (admin only)

---

## Modul 7 — Sistem Sewa

> **Minggu:** 3 (Hari 2–5)  
> **Dependency:** M4, M6  
> **Tujuan:** Reservasi sewa, kalender ketersediaan, upload foto pickup/return

### Halaman:

#### [NEW] [src/app/(main)/sewa/page.tsx](file:///gadgetvault/src/app/(main)/sewa/page.tsx)
- Katalog khusus barang yang `is_rentable = true`
- Filter tambahan: tanggal available
- Badge "Ready untuk Disewa" / "Sedang Disewa sampai [tanggal]"

#### [NEW] [src/app/(main)/sewa/[slug]/page.tsx](file:///gadgetvault/src/app/(main)/sewa/[slug]/page.tsx)
- Detail produk + form reservasi sewa
- Kalender ketersediaan (tanggal yang sudah dipesan di-disable)
- Pilih durasi: harian / mingguan / custom date range
- Auto-calculate: (durasi × tarif harian) + deposit (jika luar kota)
- Ringkasan biaya sebelum submit
- Guard: harus login + KYC verified
- Jika KYC belum selesai → redirect ke `/kyc` dengan return URL

### Komponen:

#### [NEW] [src/components/rental/rental-calendar.tsx](file:///gadgetvault/src/components/rental/rental-calendar.tsx)
- Calendar date range picker
- Tanggal unavailable ditandai merah/disabled
- Selected range ditandai gold
- Legend: available / booked / selected

#### [NEW] [src/components/rental/rental-form.tsx](file:///gadgetvault/src/components/rental/rental-form.tsx)
- Pilih tanggal mulai & selesai
- Tampilkan durasi (hari)
- Tarif per hari/minggu
- Total estimasi
- Submit reservasi

#### [NEW] [src/components/rental/rental-summary.tsx](file:///gadgetvault/src/components/rental/rental-summary.tsx)
- Ringkasan: produk, tanggal, durasi, tarif, deposit, total
- Syarat & ketentuan checkbox
- Tombol "Ajukan Sewa"

#### [NEW] [src/components/rental/photo-upload.tsx](file:///gadgetvault/src/components/rental/photo-upload.tsx)
- Komponen upload foto untuk:
  - **Pickup**: foto customer + barang saat diambil
  - **Return**: foto customer + barang saat dikembalikan
- Camera capture (mobile) atau file upload (desktop)
- Preview + retake
- Upload ke Google Drive folder `rentals/{rentalId}/`

### API Routes:

#### [NEW] [src/app/api/rentals/route.ts](file:///gadgetvault/src/app/api/rentals/route.ts)
- GET: List rental transactions (user: own, admin: all)
- POST: Create reservasi sewa
  - Validasi: user KYC verified, produk available, tanggal tidak overlap
  - Generate transaction_code (GV-RENT-YYYYMMDD-XXXX)
  - Status: "pending"
  - Kirim notifikasi ke admin

#### [NEW] [src/app/api/rentals/[id]/route.ts](file:///gadgetvault/src/app/api/rentals/[id]/route.ts)
- GET: Detail transaksi sewa
- PATCH: Update status (admin: approve/reject/pickup/return/complete)
  - approve → kirim notifikasi ke customer
  - pickup → wajib upload foto
  - return → wajib upload foto
  - complete → update product status ke "ready"

#### [NEW] [src/app/api/rentals/[id]/photos/route.ts](file:///gadgetvault/src/app/api/rentals/[id]/photos/route.ts)
- POST: Upload foto pickup/return → Google Drive

---

## Modul 8 — Sistem Beli & Jual

> **Minggu:** 4 (Hari 1–3)  
> **Dependency:** M4, M6  
> **Tujuan:** Request beli, form jual barang ke toko, admin review

### Beli:

#### [MODIFY] Tombol "Beli Sekarang" di [katalog/[slug]/page.tsx](file:///gadgetvault/src/app/(main)/katalog/[slug]/page.tsx)
- Klik → modal konfirmasi → submit purchase request
- Status flow: Pending → Confirmed → Checked → Paid → Completed

### Jual:

#### [NEW] [src/app/(main)/jual/page.tsx](file:///gadgetvault/src/app/(main)/jual/page.tsx)
- Guard: harus login
- Multi-step form:
  1. Info barang (nama, kategori, brand, model)
  2. Kondisi (dropdown + deskripsi teks)
  3. Kelengkapan (checkbox: box, charger, aksesoris lain)
  4. Upload foto (min 3, max 10 foto)
  5. Harga yang diinginkan (opsional)
  6. Review & submit
- Progress step indicator (numbered circles)
- Desain: clean card-based form

### API Routes:

#### [NEW] [src/app/api/purchases/route.ts](file:///gadgetvault/src/app/api/purchases/route.ts)
- GET: List pembelian (user/admin)
- POST: Submit purchase request

#### [NEW] [src/app/api/purchases/[id]/route.ts](file:///gadgetvault/src/app/api/purchases/[id]/route.ts)
- PATCH: Admin update status flow

#### [NEW] [src/app/api/sell-offers/route.ts](file:///gadgetvault/src/app/api/sell-offers/route.ts)
- GET: List penawaran jual (user/admin)
- POST: Submit penawaran jual + upload gambar ke GDrive

#### [NEW] [src/app/api/sell-offers/[id]/route.ts](file:///gadgetvault/src/app/api/sell-offers/[id]/route.ts)
- GET: Detail penawaran
- PATCH: Admin: set offered_price, update status
- Customer: accept/reject penawaran

---

## Modul 9 — Sistem Deposit

> **Minggu:** 4 (Hari 4–5)  
> **Dependency:** M7  
> **Tujuan:** Deposit otomatis untuk pelanggan luar Bandung/Cimahi

### Logic:

Integrasi ke dalam **rental flow** (Modul 7):
1. Saat user submit reservasi sewa, cek `user.city`
2. Jika kota **bukan** "Bandung" atau "Cimahi" → wajib deposit
3. Hitung nominal: `total_sewa × deposit_percentage` (dari StoreSettings)
4. Tampilkan instruksi transfer (nama bank, no. rekening dari StoreSettings)
5. User upload bukti transfer
6. Admin verifikasi manual
7. Setelah barang dikembalikan & dicek → deposit di-refund

### Halaman:

#### [MODIFY] Rental form di [sewa/[slug]/page.tsx](file:///gadgetvault/src/app/(main)/sewa/[slug]/page.tsx)
- Deteksi: jika user luar kota → tampilkan section deposit
- Info rekening toko
- Upload bukti transfer
- Status deposit: Pending → Verified → Refunded

#### [NEW] [src/app/(user)/transaksi/[id]/page.tsx](file:///gadgetvault/src/app/(user)/transaksi/[id]/page.tsx)
- Detail transaksi lengkap termasuk status deposit
- Timeline visual (step-by-step progress)
- Upload bukti transfer (jika belum)

### API Routes:

#### [NEW] [src/app/api/deposits/route.ts](file:///gadgetvault/src/app/api/deposits/route.ts)
- POST: Upload bukti deposit (+ simpan ke GDrive folder `deposits/{depositId}/`)
- GET: List deposits (admin)

#### [NEW] [src/app/api/deposits/[id]/route.ts](file:///gadgetvault/src/app/api/deposits/[id]/route.ts)
- PATCH: Admin verify/reject deposit; mark as refunded

---

## Modul 10 — Admin Dashboard

> **Minggu:** 5 (Hari 1–5)  
> **Dependency:** M4, M6, M7, M8, M9  
> **Tujuan:** Dashboard overview, manajemen semua entitas, verifikasi KYC, pengaturan toko

### Overview Dashboard:

#### [NEW] [src/app/admin/page.tsx](file:///gadgetvault/src/app/admin/page.tsx)
- Stats cards: total transaksi hari ini, pendapatan bulan ini, barang disewa aktif, KYC pending
- Chart: revenue trend (line chart, 30 hari terakhir)
- Chart: transaksi per kategori (donut chart)
- Recent activity feed (5 terbaru)
- Quick action buttons: Approve KYC, Approve Sewa, Verifikasi Deposit

### Manajemen Transaksi:

#### [NEW] [src/app/admin/transaksi/sewa/page.tsx](file:///gadgetvault/src/app/admin/transaksi/sewa/page.tsx)
- DataTable: kode transaksi, customer, produk, tanggal, status, aksi
- Filter: status, tanggal range
- Quick actions: Approve, Reject, Mark Picked Up, Mark Returned, Complete
- Modal detail: info lengkap + foto pickup/return
- Bulk actions (opsional)

#### [NEW] [src/app/admin/transaksi/beli/page.tsx](file:///gadgetvault/src/app/admin/transaksi/beli/page.tsx)
- DataTable serupa untuk pembelian
- Status flow: Pending → Confirmed → Checked → Paid → Completed

#### [NEW] [src/app/admin/transaksi/jual/page.tsx](file:///gadgetvault/src/app/admin/transaksi/jual/page.tsx)
- DataTable penawaran jual
- Review foto barang
- Input harga penawaran dari admin
- Status: Pending → Reviewed → Offered → Accepted → Completed

### Verifikasi KYC:

#### [NEW] [src/app/admin/kyc/page.tsx](file:///gadgetvault/src/app/admin/kyc/page.tsx)
- Queue KYC pending (sorted by tanggal submit)
- Preview dokumen: KTP depan, KTP belakang, selfie + KTP
- Side-by-side view (foto KTP vs selfie)
- Tombol: Approve / Reject + input alasan reject
- Filter: status (pending, approved, rejected)

### Manajemen Pelanggan:

#### [NEW] [src/app/admin/pelanggan/page.tsx](file:///gadgetvault/src/app/admin/pelanggan/page.tsx)
- DataTable: nama, email, kota, KYC status, total transaksi, join date
- Search by nama/email
- Badge: Verified ✓, Pending ⏳, Blacklisted 🚫

#### [NEW] [src/app/admin/pelanggan/[id]/page.tsx](file:///gadgetvault/src/app/admin/pelanggan/[id]/page.tsx)
- Profil lengkap
- KYC documents preview
- Riwayat semua transaksi
- Tombol blacklist/unblacklist

### Deposit Management:

#### [NEW] [src/app/admin/deposit/page.tsx](file:///gadgetvault/src/app/admin/deposit/page.tsx)
- DataTable: customer, nominal, tanggal, status, bukti transfer
- Preview bukti transfer (image)
- Verifikasi: cocokkan nominal → Approve/Reject
- Refund tracking

### Pengaturan:

#### [NEW] [src/app/admin/pengaturan/page.tsx](file:///gadgetvault/src/app/admin/pengaturan/page.tsx)
- Tabs: Info Toko, Rekening Bank, Deposit, Halaman Statis
- Form edit: nama toko, alamat, no. HP, WhatsApp, jam buka (JSON)
- Rekening: nama bank, no. rekening, atas nama
- Deposit: persentase deposit (slider + input)
- Export data: CSV/Excel per tabel

### Komponen Admin:

#### [NEW] [src/components/admin/stats-card.tsx](file:///gadgetvault/src/components/admin/stats-card.tsx)
- Icon + label + angka + perubahan % dari kemarin
- Warna: gold background subtle

#### [NEW] [src/components/admin/revenue-chart.tsx](file:///gadgetvault/src/components/admin/revenue-chart.tsx)
- Line chart (Recharts) + tooltip + period selector

#### [NEW] [src/components/admin/data-table.tsx](file:///gadgetvault/src/components/admin/data-table.tsx)
- Reusable table: sortable columns, pagination, search, filter
- Row actions dropdown
- Responsive: card view pada mobile

#### [NEW] [src/components/admin/action-modal.tsx](file:///gadgetvault/src/components/admin/action-modal.tsx)
- Confirm/reject dialog dengan textarea (alasan)
- Loading state pada submit

### API Routes:

#### [NEW] [src/app/api/admin/stats/route.ts](file:///gadgetvault/src/app/api/admin/stats/route.ts)
- GET: Aggregated stats (transaksi, revenue, KYC pending, dll)

#### [NEW] [src/app/api/admin/settings/route.ts](file:///gadgetvault/src/app/api/admin/settings/route.ts)
- GET/PUT: Read/update StoreSettings

#### [NEW] [src/app/api/notifications/route.ts](file:///gadgetvault/src/app/api/notifications/route.ts)
- GET: List notifikasi user (paginated)
- PATCH: Mark as read
- POST: Create notifikasi (internal use)

---

## Modul 11 — Halaman Publik & Peta

> **Minggu:** 5 (Hari 4–5) + Minggu 6 (Hari 1)  
> **Dependency:** M5  
> **Tujuan:** Landing page, tentang kami, FAQ, peta lokasi, halaman user (profil, transaksi, wishlist, notifikasi)

### Landing Page:

#### [MODIFY] [src/app/page.tsx](file:///gadgetvault/src/app/page.tsx)
- Hero section: headline (Playfair Display), subtext, CTA button, hero image/video
- Kategori grid: 4 card (HP, Kamera, Drone, Aksesoris) dengan icon
- Produk unggulan: carousel/grid 4–8 produk `is_featured = true`
- Keunggulan/USP: 3–4 card (KYC Aman, Sewa Mudah, Harga Transparan, Lokasi Strategis)
- Testimoni: slider/carousel (data statis awal, nanti bisa dinamis)
- Lokasi toko: embedded Google Maps + alamat + jam buka
- CTA section: "Mulai Sewa Sekarang" / "Jual Gadget Anda"
- Scroll reveal animations (Framer Motion)

### Tentang Kami:

#### [NEW] [src/app/(main)/tentang/page.tsx](file:///gadgetvault/src/app/(main)/tentang/page.tsx)
- Story toko
- Embedded Google Maps (iframe dari PRD Section 10.1)
- Info kontak: alamat, telepon, WhatsApp, email
- Jam operasional
- Foto toko (opsional)

### FAQ:

#### [NEW] [src/app/(main)/faq/page.tsx](file:///gadgetvault/src/app/(main)/faq/page.tsx)
- Accordion component
- Search/filter FAQ
- Kategori: Sewa, Beli, Jual, KYC, Pembayaran, Umum
- Konten awal: 15–20 pertanyaan umum

### Peta:

#### [NEW] [src/components/map/store-map.tsx](file:///gadgetvault/src/components/map/store-map.tsx)
- Google Maps embed (iframe) → koordinat dari PRD
- Tombol "Buka di Google Maps" → navigasi
- Alternatif: Leaflet + OpenStreetMap jika butuh custom marker

### Halaman User:

#### [NEW] [src/app/(user)/profil/page.tsx](file:///gadgetvault/src/app/(user)/profil/page.tsx)
- Data diri (edit: nama, phone, alamat)
- KYC status badge + link ke halaman KYC
- Statistik: total transaksi, active rentals

#### [NEW] [src/app/(user)/transaksi/page.tsx](file:///gadgetvault/src/app/(user)/transaksi/page.tsx)
- Tabs: Sewa, Beli, Jual
- List transaksi dengan status badge
- Filter: status, tanggal

#### [NEW] [src/app/(user)/wishlist/page.tsx](file:///gadgetvault/src/app/(user)/wishlist/page.tsx)
- Grid produk yang di-wishlist
- Tombol remove
- Badge availability (real-time)

#### [NEW] [src/app/(user)/notifikasi/page.tsx](file:///gadgetvault/src/app/(user)/notifikasi/page.tsx)
- List notifikasi (newest first)
- Mark as read
- Link ke transaksi terkait

### Komponen Shared:

#### [NEW] [src/components/shared/hero-section.tsx](file:///gadgetvault/src/components/shared/hero-section.tsx)
- Full-width hero dengan gradient overlay
- Headline + subtext + CTA buttons
- Optional: background image/video

#### [NEW] [src/components/shared/category-grid.tsx](file:///gadgetvault/src/components/shared/category-grid.tsx)
- 4 category cards dengan icon dan hover effect

#### [NEW] [src/components/shared/testimonial-slider.tsx](file:///gadgetvault/src/components/shared/testimonial-slider.tsx)
- Auto-play carousel + manual navigation

#### [NEW] [src/components/shared/faq-accordion.tsx](file:///gadgetvault/src/components/shared/faq-accordion.tsx)
- Smooth expand/collapse animation
- Search highlight

#### [NEW] [src/components/shared/scroll-reveal.tsx](file:///gadgetvault/src/components/shared/scroll-reveal.tsx)
- Wrapper component: fade-in + slide-up saat masuk viewport
- Menggunakan Framer Motion + Intersection Observer

---

## Modul 12 — SEO, Testing & Deployment

> **Minggu:** 6 (Hari 2–5)  
> **Dependency:** M10, M11  
> **Tujuan:** SEO optimization, structured data, testing, deployment ke Vercel

### SEO:

#### [MODIFY] [src/app/layout.tsx](file:///gadgetvault/src/app/layout.tsx)
- Global metadata: title template `"%s | GadgetVault"`, default description, og:image
- Viewport, themeColor, icons

#### [NEW] [src/app/sitemap.ts](file:///gadgetvault/src/app/sitemap.ts)
- Dynamic sitemap: semua halaman statis + semua produk (slug)
- Changefreq & priority

#### [MODIFY] [public/robots.txt](file:///gadgetvault/public/robots.txt)
- Allow: /
- Disallow: /admin, /api, /(user)
- Sitemap: https://gadgetvault.com/sitemap.xml

#### JSON-LD Structured Data (per halaman):

| Halaman | Schema |
|---------|--------|
| Landing | `LocalBusiness` + `WebSite` |
| Katalog | `ItemList` |
| Detail Produk | `Product` (name, image, price, availability) |
| Tentang | `LocalBusiness` (address, geo, openingHours) |
| Semua | `BreadcrumbList` |

#### [NEW] [src/components/shared/json-ld.tsx](file:///gadgetvault/src/components/shared/json-ld.tsx)
- Reusable component untuk inject JSON-LD `<script>` tag

### Error & Loading:

#### [NEW] [src/app/not-found.tsx](file:///gadgetvault/src/app/not-found.tsx)
- Custom 404: ilustrasi, pesan, link kembali

#### [NEW] [src/app/error.tsx](file:///gadgetvault/src/app/error.tsx)
- Error boundary dengan retry button

#### [NEW] [src/app/loading.tsx](file:///gadgetvault/src/app/loading.tsx)
- Full-page skeleton/shimmer loader

### Performance:

- Next.js Image optimization (semua gambar pakai `<Image>`)
- Dynamic imports (`next/dynamic`) untuk komponen berat (charts, calendar, map)
- Bundle analysis (`@next/bundle-analyzer`)
- Lighthouse audit → target: Performance ≥90, SEO ≥95

### Deployment:

#### Vercel Setup
1. Connect GitHub repo ke Vercel
2. Set environment variables di Vercel dashboard
3. Setup Supabase (production database)
4. Konfigurasi custom domain (jika ada)
5. Enable Vercel Analytics & Speed Insights

### Testing (Minimal untuk MVP):

- Manual testing semua user flow (sewa, beli, jual, KYC, admin)
- Responsive testing: Chrome DevTools (mobile, tablet, desktop)
- Cross-browser: Chrome, Firefox, Safari, Edge
- Lighthouse audit semua halaman utama

### Keep-Alive Cron (Supabase Pause Prevention):

Untuk mencegah database Supabase (free tier) di-pause otomatis oleh Supabase karena tidak ada aktivitas selama 7 hari, kita akan mengimplementasikan dua mekanisme keep-alive:

1. **Next.js Cron API Route (Vercel Cron)**
   - API route `/api/cron/keep-alive` yang melakukan query database ringan.
   - Konfigurasi `vercel.json` untuk menjalankan cron secara terjadwal (misal 1-2 kali sehari).
   - Validasi header `Authorization: Bearer CRON_SECRET` untuk keamanan.

2. **GitHub Actions Workflow**
   - Workflow `.github/workflows/keep-alive.yml` yang berjalan dengan schedule cron GitHub (misalnya setiap hari).
   - Menjalankan script local `scripts/verify-prisma.ts` yang langsung melakukan koneksi dan query ke Supabase menggunakan `DATABASE_URL` yang disimpan di GitHub Secrets. Ini sangat berguna sebagai backup jika website sedang mati atau Vercel function terhenti.

#### [NEW] [route.ts](file:///c:/Proyek/gadget-vault/src/app/api/cron/keep-alive/route.ts)
- GET handler untuk mengecek authorization, menjalankan query database `prisma.user.findFirst()`, dan me-return response JSON status.

#### [NEW] [vercel.json](file:///c:/Proyek/gadget-vault/vercel.json)
- File konfigurasi Vercel untuk mendefinisikan cron path `/api/cron/keep-alive` dan schedule `0 0 * * *` (setiap hari pukul 00:00).

#### [NEW] [keep-alive.yml](file:///c:/Proyek/gadget-vault/.github/workflows/keep-alive.yml)
- GitHub workflow file untuk mendefinisikan schedule cron run, setup node, install, generate prisma client, dan run verification script.

---

## Keputusan Teknis (Dikonfirmasi ✅)

| # | Keputusan | Jawaban | Catatan |
|---|-----------|---------|---------|
| 1 | **Database** | ✅ Supabase (PostgreSQL) | Free tier: 500MB DB, 1GB Storage, 50K auth users |
| 2 | **File Storage** | ✅ **Supabase Storage** (ganti Google Drive) | Lebih simpel, sudah bundled, tidak perlu setup GCP. 1GB gratis. Semua upload (produk, KYC, rental foto, deposit bukti) ke Supabase Storage buckets |
| 3 | **Google OAuth** | ✅ Aktif | Email/password + Google OAuth. Setup via Supabase Auth dashboard |
| 4 | **Domain** | ✅ Vercel free (`gadgetvault.vercel.app`) | Bisa upgrade ke custom domain nanti |
| 5 | **Email** | ✅ Resend | Gratis 100 email/hari. Untuk notifikasi KYC, transaksi, deposit |
| 6 | **Konten Awal** | ✅ Foto produk ada | Logo, FAQ, testimonial → dummy data dulu, diganti nanti |

> [!IMPORTANT]
> **Perubahan dari plan awal:** File storage diubah dari **Google Drive** → **Supabase Storage**. Alasan: user belum punya Google Cloud Project, dan Supabase Storage sudah tersedia gratis + API lebih sederhana. Semua referensi `gdrive.ts` diganti menjadi `storage.ts` (Supabase Storage client).

### Dampak Perubahan Storage:

| Sebelum (Google Drive) | Sesudah (Supabase Storage) |
|------------------------|---------------------------|
| `src/lib/gdrive.ts` | `src/lib/storage.ts` |
| `npm install googleapis` | Sudah include di `@supabase/supabase-js` |
| Service Account JSON key | Supabase anon key + service role key |
| `gdrive_file_id` di DB | `storage_path` di DB (e.g., `products/abc/img1.jpg`) |
| Google Drive folder structure | Supabase Storage buckets: `products`, `kyc`, `rentals`, `deposits`, `sell-offers` |
| Direct link via GDrive proxy | Public URL via `supabase.storage.from('bucket').getPublicUrl()` |

### Supabase Storage Buckets:

```
📦 products/          → Foto produk (public)
📦 kyc/               → Dokumen KYC (private — hanya admin & user terkait)
📦 rentals/           → Foto pickup/return (private)
📦 deposits/          → Bukti transfer (private)
📦 sell-offers/       → Foto barang dijual (private → public setelah approved)
```

### Environment Variables (Updated):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Database (dari Supabase)
DATABASE_URL="postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="xxx"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (setup di Supabase Auth dashboard)
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"

# Resend (email)
RESEND_API_KEY="re_xxx"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_STORE_NAME="GadgetVault"
```


---

## Verification Plan

### Automated
```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Build check (no errors)
npm run build

# Lighthouse CI (opsional)
npx lhci autorun
```

### Manual Verification
- [ ] Semua halaman render tanpa error
- [ ] Responsive di 3 breakpoint (mobile, tablet, desktop)
- [ ] Auth flow: register → login → logout → login Google
- [ ] KYC flow: upload → pending → admin approve → verified
- [ ] Sewa flow: browse → pilih → reservasi → admin approve
- [ ] Beli flow: browse → request → admin confirm
- [ ] Jual flow: form → submit → admin review → offer
- [ ] Deposit flow: sewa luar kota → deposit → upload bukti → admin verify
- [ ] Admin: semua CRUD produk berfungsi
- [ ] Admin: approve/reject transaksi
- [ ] Google Maps tampil di halaman tentang & landing
- [ ] SEO: meta tags, og:image, sitemap.xml, robots.txt
- [ ] Lighthouse scores: Perf ≥90, SEO ≥95, A11y ≥90

---

## Timeline Summary

```mermaid
gantt
    title GadgetVault Development Timeline
    dateFormat  YYYY-MM-DD
    axisFormat  %d %b

    section Minggu 1 - Foundation
    M1 Project Setup           :m1, 2026-06-09, 2d
    M2 Database & Schema       :m2, after m1, 2d
    M3 Design System           :m3, after m1, 3d

    section Minggu 2 - Core
    M4 Auth & KYC              :m4, after m2, 3d
    M5 Layout & Navigation     :m5, after m3, 2d
    M6 Katalog Produk (start)  :m6a, after m2, 2d

    section Minggu 3 - Features
    M6 Katalog Produk (end)    :m6b, after m6a, 1d
    M7 Sistem Sewa             :m7, after m6b, 4d

    section Minggu 4 - Business
    M8 Sistem Beli & Jual      :m8, after m7, 3d
    M9 Sistem Deposit          :m9, after m8, 2d

    section Minggu 5 - Dashboard
    M10 Admin Dashboard        :m10, after m9, 5d
    M11 Halaman Publik (start) :m11a, after m5, 2d

    section Minggu 6 - Final
    M11 Halaman Publik (end)   :m11b, after m10, 1d
    M12 SEO & Deploy           :m12, after m11b, 4d
```
