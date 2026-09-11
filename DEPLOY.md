# Get a Vercel link for the CEO

Vercel cannot use the SQLite file on your laptop. The live site uses a free **Neon** Postgres database plus **Vercel**.

## A. Create the free database (Neon)

1. Open https://console.neon.tech and sign up with GitHub.
2. Create a project named `nuvelist`. Region: **Asia Pacific (Singapore)** or Mumbai if shown.
3. Open **Dashboard → Connection details**.
4. Copy **both**:
   - Pooled connection string → this is `DATABASE_URL`
   - Direct connection string → this is `DIRECT_URL`  
   If you only see one string, paste that same string into both.

## B. Put the site on Vercel

1. Open https://vercel.com/signup and sign up with the **same GitHub** account (`anandwivedi1503-bit`).
2. Click **Add New… → Project**.
3. Import **nuvelist**.
4. Before Deploy, click **Environment Variables** and add:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Neon pooled string |
| `DIRECT_URL` | Neon direct string (or the same as DATABASE_URL) |
| `AUTH_SECRET` | any long random text, e.g. `nuvelist-ceo-preview-secret-2026-xx` |
| `NEXT_PUBLIC_SITE_URL` | `https://placeholder.vercel.app` (you will fix this after first deploy) |
| `ADMIN_EMAIL` | `leo.a@example.org` |
| `ADMIN_PASSWORD` | `Nuvelist@Admin1` |

5. Click **Deploy**. Wait 2–4 minutes.
6. Vercel shows a URL like `https://nuvelist-xxxx.vercel.app`.
7. Edit `NEXT_PUBLIC_SITE_URL` to that exact URL, then click **Redeploy**.

Send **that `https://….vercel.app` link** to your CEO. It stays live even if your laptop is off.

## C. After you pull this update on your PC

Your old `file:./dev.db` URL will no longer work. In `nuvelist-1/.env` set `DATABASE_URL` and `DIRECT_URL` to the same Neon strings, then:

```powershell
npx prisma db push
npm run db:seed
npm run dev
```
