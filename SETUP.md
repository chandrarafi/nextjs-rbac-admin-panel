# Setup Admin Dashboard dengan NextAuth & Prisma

## Prerequisites

- Node.js (v18 atau lebih baru)
- MySQL Server
- npm atau yarn

## Langkah-langkah Setup

### 1. Install Dependencies

Dependencies sudah terinstall. Jika perlu install ulang:

```bash
npm install
```

### 2. Setup Database MySQL

Buat database baru di MySQL:

```sql
CREATE DATABASE admin_panel_nextjs;
```

### 3. Konfigurasi Environment Variables

Edit file `.env` dan sesuaikan dengan konfigurasi MySQL Anda:

```env
DATABASE_URL="mysql://username:password@localhost:3306/admin_panel_nextjs"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

Ganti:

- `username` dengan username MySQL Anda
- `password` dengan password MySQL Anda
- `admin_panel_nextjs` dengan nama database yang Anda buat

### 4. Generate Prisma Client & Migrate Database

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Seed Database dengan User Admin

```bash
npm run db:seed
```

Ini akan membuat user admin dengan kredensial:

- Email: `admin@example.com`
- Password: `admin123`

### 6. Jalankan Development Server

```bash
npm run dev
```

Buka browser dan akses: `http://localhost:3000`

## Struktur Project

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth API routes
│   │   └── register/            # Register API endpoint
│   ├── dashboard/               # Admin dashboard page
│   ├── login/                   # Login page
│   └── layout.tsx               # Root layout dengan SessionProvider
├── components/ui/               # shadcn/ui components
├── lib/
│   ├── auth.ts                  # NextAuth configuration
│   ├── prisma.ts                # Prisma client
│   └── utils.ts                 # Utility functions
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── seed.ts                  # Database seeder
└── types/
    └── next-auth.d.ts           # NextAuth type definitions
```

## Fitur

- ✅ Authentication dengan NextAuth
- ✅ Database MySQL dengan Prisma ORM
- ✅ Login page dengan form validation
- ✅ Admin dashboard dengan shadcn/ui components
- ✅ User management
- ✅ Session management
- ✅ Role-based access (admin/user)

## Kredensial Default

**Admin:**

- Email: admin@example.com
- Password: admin123

## Troubleshooting

### Error: Can't reach database server

- Pastikan MySQL server sudah berjalan
- Cek konfigurasi DATABASE_URL di file .env

### Error: Prisma Client not generated

Jalankan:

```bash
npx prisma generate
```

### Error: Table doesn't exist

Jalankan migration:

```bash
npx prisma migrate dev
```

## Menambah User Baru

Anda bisa menambah user melalui API:

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"User Name"}'
```

## Prisma Studio

Untuk melihat dan mengelola data database secara visual:

```bash
npx prisma studio
```

Akan membuka Prisma Studio di `http://localhost:5555`
