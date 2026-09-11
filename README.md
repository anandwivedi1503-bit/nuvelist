# Nuvelist

Indian clinical-skincare e-commerce + CRM.

## Stack

| Piece | Role |
| --- | --- |
| Next.js App Router | Website pages and API routes |
| Prisma + PostgreSQL | Database |
| JWT httpOnly cookie | Login sessions |
| Razorpay | UPI / cards / netbanking |
| Zod | Form validation |

## Local setup

```bash
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000

### Seeded admin (CRM)

- URL: `/admin`
- Email: `leo.a@example.org`
- Password: `Nuvelist@Admin1` (change after first login)

Coupon: `GLOW10` (10% off, min ₹999)

Set `DATABASE_URL` and `DIRECT_URL` in `.env`. Do not commit `.env`.

## Razorpay

```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

Until keys are present, Cash on Delivery still works.

## Production

- Change `AUTH_SECRET`
- Keep secrets on the host, never in git
- Hosting notes: `DEPLOY.md`
