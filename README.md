# DCAport — ระบบการเงินส่วนบุคคล & DCA Tracker

ระบบติดตามพอร์ต ETF แบบ Dollar Cost Averaging (DCA) พร้อมจัดการรายรับ-รายจ่าย สร้างด้วย Next.js 14, Prisma, PostgreSQL และ Recharts

## ฟีเจอร์หลัก

- **DCA Portfolio** — บันทึกการลงทุนอัตโนมัติตาม % allocation (SCHG, SMH, AVUV, GLDM)
- **Real-time Pricing** — ดึงราคา ETF จาก Finnhub API แบบ real-time
- **Unrealized P&L** — ติดตามกำไร/ขาดทุนที่ยังไม่ได้ขาย พร้อม Pie Chart
- **Finance Dashboard** — บันทึกรายรับ-รายจ่ายพร้อมกราฟรายเดือน
- **Slip OCR** — อัพโหลดสลิปซื้อหุ้น (Dime!, Finnomena ฯลฯ) แล้วระบบอ่านข้อมูลอัตโนมัติด้วย Tesseract.js OCR + DeepSeek AI
- **Authentication** — ระบบสมัครสมาชิก/เข้าสู่ระบบด้วย NextAuth (Credentials)
- **Responsive** — รองรับทั้ง Desktop และ Mobile

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | Next.js 14 (App Router)           |
| Database    | PostgreSQL + Prisma ORM           |
| Auth        | NextAuth.js (JWT + Credentials)   |
| Charts      | Recharts                          |
| Validation  | Zod                               |
| Styling     | CSS Variables + Tailwind CSS      |
| Market Data | Finnhub API                       |

## เริ่มต้นใช้งาน

### 1. ติดตั้ง dependencies

```bash
npm install
```

### 2. ตั้งค่า environment variables

คัดลอกไฟล์ `.env.example` เป็น `.env` แล้วกรอกค่าให้ครบ:

```bash
cp .env.example .env
```

| Variable          | คำอธิบาย                                      |
|-------------------|-----------------------------------------------|
| `DATABASE_URL`    | Connection string ของ PostgreSQL/Supabase      |
| `NEXTAUTH_SECRET` | Secret สำหรับ NextAuth (ใช้ `openssl rand -base64 32`) |
| `NEXTAUTH_URL`    | URL ของแอป เช่น `http://localhost:3000`        |
| `FINNHUB_API_KEY` | API Key จาก [finnhub.io](https://finnhub.io)  |
| `DEEPSEEK_API_KEY`   | API Key จาก [DeepSeek](https://platform.deepseek.com/api_keys) (สำหรับอ่านสลิป) |

### 3. สร้างฐานข้อมูล

```bash
npx prisma migrate dev
```

### 4. รันโปรเจค

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

## โครงสร้างโปรเจค

```
├── app/
│   ├── api/           # API routes (auth, portfolio, trades, transactions, dca)
│   ├── auth/          # หน้า Sign in / Sign up
│   ├── finance/       # Finance Dashboard
│   ├── invest/        # DCA Portfolio Dashboard
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Landing page
├── components/
│   ├── dashboard/     # Dashboard components
│   ├── finance/       # Finance components
│   ├── invest/        # DCA investment components
│   └── layout/        # AppShell, Sidebar
├── lib/
│   ├── auth.ts        # NextAuth configuration
│   ├── config.ts      # DCA allocation weights
│   ├── finance.ts     # Business logic (CRUD)
│   ├── metrics.ts     # คำนวณ P&L, totals
│   ├── prices.ts      # Finnhub API client
│   ├── prisma.ts      # Prisma client singleton
│   └── validation.ts  # Zod schemas
├── prisma/
│   └── schema.prisma  # Database schema
└── types/             # TypeScript types
```

## License

MIT
