# Admin Dashboard dengan NextAuth & Prisma

Project Next.js dengan sistem autentikasi menggunakan NextAuth v5, database MySQL dengan Prisma ORM, dan UI menggunakan shadcn/ui.

## Fitur

- ✅ Authentication dengan NextAuth v5
- ✅ Database MySQL dengan Prisma ORM
- ✅ Login page dengan form validation
- ✅ Admin dashboard dengan shadcn/ui
- ✅ Dynamic menu system 3-level dari database
- ✅ Role-based access control (RBAC)
- ✅ Collapsible sidebar dengan nested navigation
- ✅ Protected routes dengan middleware
- ✅ Session management
- ✅ Responsive design (mobile & desktop)

## Quick Start

### 1. Setup Database

```bash
# Buat database MySQL
CREATE DATABASE nextauth_db;
```

### 2. Konfigurasi Environment

Edit file `.env`:

```env
DATABASE_URL="mysql://username:password@localhost:3306/nextauth_db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Setup Prisma & Database

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Kredensial Default

**Admin:**

- Email: `admin@example.com`
- Password: `admin123`

## Dokumentasi Lengkap

Lihat [SETUP.md](./SETUP.md) untuk dokumentasi lengkap dan troubleshooting.

## Tech Stack

- Next.js 16
- NextAuth v5
- Prisma ORM
- MySQL
- shadcn/ui
- Tailwind CSS
- TypeScript
