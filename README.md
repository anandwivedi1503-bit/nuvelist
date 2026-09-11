# Nuvelist — Clinical Skin Actives

**E-commerce + CRM platform for Nuvelist (India)**

| | |
| --- | --- |
| **Product** | Direct-to-consumer skincare store with staff CRM |
| **Developed by** | **Anand Dwivedi** |
| **Role** | Fullstack Developer (SDE) |
| **Repository** | [github.com/anandwivedi1503-bit/nuvelist](https://github.com/anandwivedi1503-bit/nuvelist) |

This repository is the complete Nuvelist website: customer storefront, checkout (Cash on Delivery + Razorpay), accounts, and an admin CRM for orders, catalogue, customers, and inquiries.

**Full technical documentation:** [DOCUMENTATION.md](./DOCUMENTATION.md)  
**How the code works (learning guide):** [LEARNING.md](./LEARNING.md)  
**Public hosting notes:** [DEPLOY.md](./DEPLOY.md)

---

## What the website does

Customers can browse Nuvelist actives (Daily Barrier Cleanser, Peptide Lip Repair, Clinical Ritual Duo), add to bag, and pay in **INR with GST included**. Staff can log in at `/admin` and manage the house like a small CRM.

Prices, stock, and orders live in a database. The browser is never trusted for price.

## Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS  
- **Backend:** Next.js Route Handlers (`src/app/api`)  
- **Database:** Prisma ORM + PostgreSQL (Neon in production)  
- **Auth:** JWT in an httpOnly cookie, bcrypt password hashes  
- **Payments:** Razorpay (UPI / cards / netbanking) and Cash on Delivery  
- **Validation:** Zod  
- **Region:** Indian addresses, PIN, mobile, GST-inclusive money in paise  

## Run on your computer

```bash
git clone https://github.com/anandwivedi1503-bit/nuvelist.git
cd nuvelist
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| | |
| --- | --- |
| Shop | http://localhost:3000 |
| CRM | http://localhost:3000/admin |
| Admin email | `leo.a@example.org` |
| Admin password | `Nuvelist@Admin1` (change after first login) |
| Demo coupon | `GLOW10` (10% off, min ₹999) |

PostgreSQL connection strings go in `.env` as `DATABASE_URL` and `DIRECT_URL`. Never commit `.env` to GitHub.

## Author

**Anand Dwivedi**  
Fullstack Developer (SDE)  
Designed and implemented the Nuvelist storefront, APIs, data model, checkout (COD + Razorpay), and admin CRM.

© Nuvelist brand assets belong to the company. Application source in this repository is the engineering work of Anand Dwivedi.
