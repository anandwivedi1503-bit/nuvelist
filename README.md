# Nuvelist

Indian clinical-skincare e-commerce + CRM for Nuvelist.

## Stack (what each piece is for)

| Piece | Role |
| --- | --- |
| Next.js App Router | Website pages and API routes in one project |
| Prisma + PostgreSQL (Neon) | Database on the live Vercel site |
| JWT httpOnly cookie | Login sessions |
| Razorpay | UPI / cards / netbanking |
| Zod | Validates every form before it hits the database |

If you are learning, read `LEARNING.md` next.

## Local setup

```bash
cp .env.example .env
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

Open http://localhost:3000

To send your CEO a public `*.vercel.app` link, follow **DEPLOY.md** (Neon + Vercel). Do not send `localhost:3000`.

### Seeded admin (CRM)

- URL: `/admin`
- Email: `leo.a@example.org`
- Password: `Nuvelist@Admin1` (change after first login)

Coupon: `GLOW10` (10% off, min ₹999)

## Razorpay

Add keys from the Razorpay dashboard to `.env`:

```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

Until keys are present, customers can still complete **Cash on Delivery**.

Webhook URL to register later: `https://your-domain/api/payments/webhook`

## Production notes

- Change `AUTH_SECRET` to a long random value
- Use PostgreSQL (`provider = "postgresql"` in `prisma/schema.prisma`)
- Put secrets in the host (Vercel / Railway / VPS), never in git
- Enable Razorpay live keys only after GSTIN and settlement account are ready
