# How the Nuvelist website is built (learning notes)

This is the “why” behind the code. Read this while you click around the live site.

## 1. Three layers of an e-commerce + CRM site

1. **Frontend** — what the customer sees (`src/app/(store)` and `src/components`).
2. **Backend** — APIs that change data (`src/app/api`). Next.js lets us keep these in the same repo.
3. **Database** — tables defined in `prisma/schema.prisma`. Prisma turns that file into a typed client so we never write raw SQL by hand.

CRM is the same idea for staff: `/admin` pages read the same orders, customers and inquiries.

## 2. Money is stored in paise

Never store `1499.00` as a float. We store **paise** (₹1 = 100 paise). `src/lib/money.ts` formats INR for India (`en-IN`) and splits **GST-inclusive** prices for invoices.

## 3. Auth (login)

- Passwords are hashed with bcrypt (`src/lib/auth.ts`).
- After login we mint a JWT and put it in an **httpOnly** cookie (`nv_session`). JavaScript on the page cannot steal it.
- `getSession()` runs on the server. Admin pages call `getSession()` and bounce non-admins to `/account`.

## 4. Cart

The bag lives in a cookie (`nv_cart`) as `{ productId, qty }[]`. **Prices always come from the database**, never from the browser. That stops someone from editing HTML and paying ₹1.

## 5. Checkout (Indian system)

`src/app/api/checkout/route.ts`:

- Validates Indian mobile, PIN and state (`src/lib/india.ts` + Zod).
- Applies coupon, shipping (free over ₹999), GST-inclusive total.
- **COD** confirms immediately and decrements stock.
- **Razorpay** creates a Razorpay Order, the browser opens Checkout.js, then `/api/payments/verify` checks the HMAC signature before we mark PAID.

## 6. Security habits in this repo

- Zod on every write endpoint
- Rate limits on login, register, checkout, contact
- Timing-safe Razorpay signature compare
- Security headers in `next.config.ts`
- Admin mutations go through `requireAdmin()`
- `.env` is gitignored — keys never belong in GitHub

## 7. Where to look when you want to change something

| You want to… | Open |
| --- | --- |
| Add a product | `prisma/seed.ts` or Admin → Catalogue |
| Change homepage copy | `src/app/(store)/page.tsx` |
| Change brand colours | `src/app/globals.css` |
| Change GST / shipping | `src/lib/money.ts` |
| Change login rules | `src/lib/validators.ts` |

When you are ready, we can add: Shiprocket, WhatsApp order alerts, GST invoices PDF, and PostgreSQL.
