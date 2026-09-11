# Nuvelist Website — Technical Documentation

**Document owner:** Anand Dwivedi, Fullstack Developer (SDE)  
**Product:** Nuvelist Clinical Skin Actives — Indian D2C e-commerce + CRM  
**Codebase:** Next.js (frontend + backend) + Prisma (database) + Razorpay (payments)

This document explains **what the website is**, **how a request flows**, and **what each major file does**. It is written so a developer, a CEO, or a future teammate can understand the system without guessing.

---

## 1. Purpose

Nuvelist needed a professional, mobile-responsive store like an international clinical skincare house (clean layout, actives, claims) but built for **India**:

- Prices in **INR**, **GST included**
- Indian **state, PIN, 10-digit mobile**
- **Cash on Delivery** and **Razorpay** (UPI / cards / netbanking)
- Customer accounts and order history
- Staff **CRM** for orders, catalogue stock, customers, and contact-form leads

The application is a **single repository**. There is no separate “frontend repo” and “backend repo”. Next.js serves pages **and** JSON APIs.

---

## 2. High-level architecture

```
Browser (Chrome / phone)
    │
    │  HTML pages + cookies
    ▼
Next.js App Router
    ├── (store)  → shop UI  (Header, product pages, checkout)
    ├── admin    → CRM UI   (orders, catalogue, customers)
    └── api      → backend  (login, cart, checkout, Razorpay)
            │
            ▼
     Prisma Client
            │
            ▼
     PostgreSQL (tables: User, Product, Order, …)
```

**Anand Dwivedi (SDE)** structured the app in three layers:

| Layer | Folder | Responsibility |
| --- | --- | --- |
| Presentation | `src/app/(store)`, `src/components` | What the customer and admin see |
| Application / API | `src/app/api` | Rules: login, cart, pay, permissions |
| Persistence | `prisma/schema.prisma` | Tables and relations |

Shared business rules live in `src/lib` so pages and APIs do not duplicate GST, PIN validation, or password hashing.

---

## 3. Technology choices (and why)

| Technology | Why it is used |
| --- | --- |
| **TypeScript** | Catch mistakes before the site runs (wrong types on Order, Product, etc.) |
| **Next.js App Router** | Server-rendered shop pages (good SEO and first load) plus API routes in one app |
| **Prisma** | Database schema in one file; typed queries instead of handwritten SQL |
| **PostgreSQL** | Production-grade database for users and orders (hosted e.g. on Neon) |
| **JWT + httpOnly cookie** | Login session the page JavaScript cannot steal |
| **bcrypt** | Passwords stored as hashes, never as plain text |
| **Zod** | Every POST body (register, checkout, contact) is validated before the database |
| **Razorpay** | Standard Indian payment gateway; signature verified on the server |
| **Tailwind CSS** | Responsive layout (desktop and mobile) using brand colours (ivory, navy, teal) |

---

## 4. What users can do (storefront)

| Page | URL | What it does |
| --- | --- | --- |
| Home | `/` | Brand story, featured products, campaign art |
| Shop | `/shop` | Full catalogue, INR prices, GST note |
| Product | `/product/[slug]` | Description, actives, reviews, Add to bag |
| Bag | `/cart` | Quantities, subtotal, shipping, pay total |
| Checkout | `/checkout` | Indian address form, coupon, COD or Razorpay |
| Order | `/order/[id]` | Confirmation and line items |
| Account | `/account` | Logged-in order list |
| Sign in / Register | `/login`, `/register` | Session cookie after success |
| Clinical / About / Contact | `/clinical`, `/about`, `/contact` | Brand + inquiry form |
| Legal | `/shipping`, `/privacy`, `/terms` | Indian shipping and privacy copy |

Header and footer wrap all store pages via `src/app/(store)/layout.tsx`. Admin pages use a different layout so the shop chrome does not appear in the CRM.

---

## 5. What staff can do (CRM)

URL prefix: `/admin`. Only users with `role = ADMIN` in the database.

| Screen | URL | What it does |
| --- | --- | --- |
| Overview | `/admin` | Counts: orders, revenue, customers, inquiries, SKUs |
| Orders | `/admin/orders` | Address, items, payment method; status dropdown |
| Catalogue | `/admin/products` | SKU, price, **stock edit** |
| Customers | `/admin/customers` | Name, email, mobile, order count |
| Inquiries | `/admin/inquiries` | Messages from `/contact` |

If a customer opens `/admin`, they are redirected to `/account`. If nobody is logged in, they go to `/login`.

---

## 6. Database model

Defined in `prisma/schema.prisma`. Prisma generates a TypeScript client in `node_modules/@prisma/client`. Application code imports it from `src/lib/prisma.ts` (one shared client).

### Main tables

| Table | Meaning |
| --- | --- |
| `User` | Customer or admin (`Role`). Email unique. `passwordHash` only. |
| `Address` | Saved Indian addresses (PIN, state, phone). |
| `Category` | Cleanse / Lips / Rituals. |
| `Product` | SKU, slug, INR **paise**, GST %, stock, images, claims JSON. |
| `Coupon` | Code, percent off, minimum subtotal. |
| `Order` | Snapshot of shipping + totals + Razorpay ids + status. |
| `OrderItem` | Frozen product name/price at purchase time. |
| `Review` | Rating; `approved` must be true to show on PDP. |
| `Inquiry` | Contact-form lead for CRM. |
| `AuditLog` | Staff actions (e.g. order status change). |

### Money

All amounts are **integers in paise** (₹1 = 100 paise). Example: ₹1,499 is stored as `149900`. This avoids floating-point errors.

GST is treated as **inclusive** (Indian D2C). `src/lib/money.ts` splits taxable vs GST for display/invoices. Shipping is ₹79 below ₹999 subtotal, free at or above ₹999.

### Seed data

`prisma/seed.ts` inserts:

- Three products from brand campaigns  
- Coupon `GLOW10`  
- Admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD`  
- Sample approved reviews  

Run: `npm run db:seed`.

---

## 7. How a typical request works

### 7.1 Open the shop

1. Browser requests `/shop`.  
2. Next.js runs `src/app/(store)/shop/page.tsx` **on the server**.  
3. The page calls Prisma `product.findMany({ where: { active: true } })`.  
4. HTML is sent with prices formatted by `formatINR()`.  
5. Layout also reads the cart cookie and session to show bag count and Sign in / Account.

### 7.2 Add to bag

1. `AddToCart` (client component) POSTs to `/api/cart`.  
2. `src/app/api/cart/route.ts` checks the product exists and is active.  
3. Quantity is clamped (max 8, never above stock).  
4. Lines `{ productId, qty }` are saved in httpOnly cookie `nv_cart`.  
5. **Price is not stored in the cookie.** At checkout, prices are loaded again from `Product`.

### 7.3 Register / login

1. `/api/auth/register` validates with Zod (`registerSchema`: name, email, Indian mobile, strong password).  
2. Password → `bcrypt.hash` (12 rounds).  
3. User row created with `role: CUSTOMER`.  
4. `createSession()` signs a JWT (`jose`, HS256, 14 days) and sets cookie `nv_session`.  
5. Login compares bcrypt hashes; generic error if email or password is wrong (no user enumeration).  
6. Both routes use `src/lib/rate-limit.ts` so brute force is slowed.

### 7.4 Checkout (COD)

1. Checkout form POSTs to `/api/checkout` (`checkoutSchema`: PIN, state from Indian list, mobile `^[6-9]\d{9}$`).  
2. Server recomputes subtotal from DB prices, applies coupon, shipping, GST split.  
3. Creates `Order` + `OrderItem` rows and an order number `NVL-YYYYMMDD-XXXX`.  
4. If `paymentMethod === COD`: status `CONFIRMED`, stock decremented, cart cookie cleared.  
5. Browser redirects to `/order/[id]`.

### 7.5 Checkout (Razorpay)

1. Same order row is created with status `PENDING_PAYMENT`.  
2. Server calls Razorpay Orders API (`amount` in paise, `currency: INR`).  
3. Browser loads Checkout.js; customer pays UPI/card.  
4. `/api/payments/verify` checks HMAC: `HMAC_SHA256(orderId + "|" + paymentId, KEY_SECRET)`.  
5. Timing-safe compare; only then status becomes `PAID` / `CAPTURED` and stock drops.  
6. `/api/payments/webhook` is the backup path if the browser closes after pay.

Without Razorpay keys in env, the API returns a clear error and **COD still works**.

### 7.6 Contact form → CRM

`/api/contact` validates the message, writes `Inquiry`, optional link to logged-in `User`. Staff read it under `/admin/inquiries`.

---

## 8. Frontend structure

| File | Role |
| --- | --- |
| `src/app/layout.tsx` | Root HTML, fonts (Outfit + Cormorant Garamond), `lang="en-IN"` |
| `src/app/globals.css` | Brand tokens: ivory, navy, teal; buttons and inputs |
| `src/app/(store)/layout.tsx` | Shop header/footer + cart count |
| `src/components/Header.tsx` | Nav, bag badge, mobile menu |
| `src/components/Footer.tsx` | Shop + legal links |
| `src/components/Brand.tsx` | Logo mark (teal ring + navy disc) matching campaign art |
| `src/components/ProductCard.tsx` | Catalogue tile |
| `src/components/AddToCart.tsx` | Client POST to cart API |
| `src/app/(store)/checkout/page.tsx` | Address + COD/Razorpay; loads Razorpay script only when needed |

`(store)` is a **route group**. It does **not** appear in the URL. `/shop` is still `/shop`.

Admin UI: `src/app/admin/*` plus small client forms for stock and order status.

---

## 9. Backend API map

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create customer + session |
| POST | `/api/auth/login` | Session |
| POST | `/api/auth/logout` | Clear cookie |
| GET | `/api/me` | Current user or null |
| GET/POST | `/api/cart` | Read / update bag |
| POST | `/api/checkout` | Create order, COD or Razorpay order |
| POST | `/api/payments/verify` | Confirm Razorpay payment |
| POST | `/api/payments/webhook` | Razorpay server callback |
| POST | `/api/contact` | CRM inquiry |
| GET | `/api/health` | Liveness |
| GET/PATCH | `/api/admin/overview` | Dashboard + order status |
| GET/PATCH | `/api/admin/products` | Catalogue / stock |
| GET | `/api/admin/crm` | Orders, customers, inquiries JSON |

Admin APIs call `requireAdmin()` (`src/lib/auth.ts`): valid JWT **and** `User.role === ADMIN` in the database.

---

## 10. Security (as implemented)

- Passwords hashed with bcrypt; never logged.  
- Session cookie: `httpOnly`, `sameSite=lax`, `secure` in production.  
- `AUTH_SECRET` required (min 16 characters).  
- Zod on mutating endpoints.  
- Rate limits on register, login, checkout, contact.  
- Cart and checkout **re-price from database**.  
- Razorpay signatures compared with `crypto.timingSafeEqual`.  
- Security headers in `next.config.ts` (`X-Frame-Options: DENY`, nosniff, referrer policy).  
- `.env` is gitignored. `.env.example` has no real secrets.  
- Admin UI and APIs are role-gated.

---

## 11. Environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres URL (pooled on Neon) |
| `DIRECT_URL` | Postgres URL for migrations (`prisma db push`) |
| `AUTH_SECRET` | JWT signing key |
| `NEXT_PUBLIC_SITE_URL` | Public origin |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key (browser) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret (server only) |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook HMAC |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded CRM user |

`NEXT_PUBLIC_*` is visible in the browser. Secrets must never use that prefix except the Razorpay **key id**.

---

## 12. Local development

```bash
cp .env.example .env
# set DATABASE_URL and DIRECT_URL to PostgreSQL
npm install
npx prisma db push
npm run db:seed
npm run dev
```

| Command | Meaning |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Generate Prisma client, sync schema, seed, production build |
| `npx prisma studio` | Visual table browser |
| `npm run lint` | ESLint |

---

## 13. Brand and catalogue (as shipped)

Assets in `public/brand` and `public/images` come from official Nuvelist logo and campaign posters.

| Product | Slug | Role on site |
| --- | --- | --- |
| Daily Barrier Cleanser | `daily-barrier-cleanser` | Ceramide + amino acids + panthenol gel |
| Peptide Lip Repair | `peptide-lip-repair` | Peptides + ceramides lip treatment |
| Clinical Ritual Duo | `clinical-ritual-duo` | Bundle of the two |

Copy, claims, and actives in `prisma/seed.ts` follow the provided artwork (fragrance free, pH balanced, dermatologically tested, Indian GST/shipping language).

---

## 14. How to change common things

| Goal | Where |
| --- | --- |
| Homepage headline | `src/app/(store)/page.tsx` |
| Colours | `src/app/globals.css` |
| GST % / free-shipping threshold | `src/lib/money.ts` |
| Allowed states / PIN / mobile | `src/lib/india.ts`, `src/lib/validators.ts` |
| New product | Admin catalogue or `prisma/seed.ts` + `db:seed` |
| Order pipeline statuses | `OrderStatus` enum + admin dropdown |

---

## 15. Future work (not in this version)

- Shiprocket / Delhivery tracking  
- GST tax invoice PDF  
- WhatsApp order alerts  
- Live Razorpay keys and webhook on the production domain  
- Custom domain (e.g. nuvelist.in) on the host  

---

## 16. Authorship

This platform — storefront, API design, Prisma data model, Indian checkout (COD + Razorpay verification), session security, and admin CRM — was designed and implemented by:

**Anand Dwivedi**  
**Fullstack Developer (SDE)**

For questions about the code, start with this file, then `LEARNING.md`, then the source paths in the tables above.
