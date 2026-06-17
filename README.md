# GadgetVault

GadgetVault is a premium, high-end ecosystem for buying, selling, and renting flagship gadgets (handphones, mirrorless cameras, cinematic drones, and accessories) in Bandung & Cimahi. 

Designed with a boutique light-mode editorial aesthetic (inspired by Leica camera bodies, Apple, and Teenage Engineering), it focuses on tactile details, fluid client-side animations, and strict security standards.

---

## Key Features

- **Dynamic Curated Catalog**: Clean classification of products for Rent, Purchase, or both.
- **tactile 3D Product Cards**: real-time pointer calculation creates an organic client-side 3D tilt effect with ambient cursor glass reflections.
- **OTP Verification Flow**: 2-step registration process requiring phone and email verification code before database record creation.
- **Admin Dashboard**: Comprehensive management interface for KYC queue verification, reservation deposits, product creation, and store settings.
- **Responsive Web Design (RWD)**: Optimized for all screens, featuring fixed bottom bars on mobile, and a collapsible slide-over navigation drawer in the admin console.
- **Security Hardened**: 
  - Strict upload validation (limiting file sizes to 5MB and allowing only secure image/PDF MIME types).
  - Global secure HTTP response headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and HSTS).
  - Clean separation of database schemas and data.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, Partial Prerendering)
- **Database / ORM**: Prisma ORM with PostgreSQL (Supabase DB)
- **Storage**: Supabase Storage Buckets
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Styling**: Tailwind CSS v4 & custom animations (`tw-animate-css`)
- **State & Forms**: Zustand (store management), React Hook Form, Zod (schema validations)
- **Icons**: Lucide React

---

## Folder Structure

```text
├── prisma/               # Database schemas and seed scripts
├── public/               # Static assets
├── scripts/              # Automation scripts (verify connection, seed, etc.)
└── src/
    ├── app/              # Next.js App Router (Auth, User, Admin, API routes)
    ├── components/       # UI, layout, and domain-specific React components
    ├── lib/              # Client/Server utilities, Prisma client, storage wrapper
    └── auth.ts           # NextAuth configuration
```

---

## Getting Started

### 1. Prerequisites
Ensure you have Node.js (version 20+) and npm installed.

### 2. Environment Variables
Create a `.env` or `.env.local` file in the root directory and configure the following variables:

```env
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
NEXTAUTH_SECRET="your-nextauth-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

### 3. Installation & Database Setup
```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed
```

### 4. Running the Project
```bash
# Start development server (using Turbopack)
npm run dev

# Compile and verify production build
npm run build

# Start production server
npm run start
```
