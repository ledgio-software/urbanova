# Moving the URBANOVA database to Supabase

Founder decision (Nov 2026): the production database moves from Vercel Postgres to **Supabase** (also PostgreSQL), keeping all existing data. The website code doesn't change. Prisma connects to Supabase like any other Postgres. Only the connection settings change.

This takes about 20–30 minutes. The old database is never modified, so it stays as a fallback until you delete it.

---

## 1. Create the Supabase project

1. Go to supabase.com → **New project**.
2. Choose a name (e.g. `urbanova`) and a **strong database password**. Save the password in your password manager.
3. For the region, choose **West EU (London)** or **Central EU (Frankfurt)**. Supabase has no Africa region, and these are the closest to Ghana.
4. Wait until the project says it is ready.

## 2. Collect the connection strings

In the project, click **Connect** (top bar) → **ORMs** → **Prisma**. You need two URLs. Replace `[YOUR-PASSWORD]` in both with the database password.

| Name | Which one | Looks like |
|---|---|---|
| **DATABASE_URL** | Transaction pooler (port **6543**) | `postgresql://postgres.abcd…:PASSWORD@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1` |
| **DIRECT_URL** | Session pooler (port **5432**) | `postgresql://postgres.abcd…:PASSWORD@aws-0-eu-west-2.pooler.supabase.com:5432/postgres` |

- Make sure `?pgbouncer=true&connection_limit=1` is at the end of DATABASE_URL. Without it, Prisma breaks on the transaction pooler.
- Use the **session pooler** URL for DIRECT_URL, not the "Direct connection" (`db.xxxx.supabase.co`). The direct connection is IPv6-only, and Vercel and GitHub Actions can't reach it.

You also need the **current** database's direct URL. In Vercel, go to **Project → Settings → Environment Variables** and copy `DIRECT_URL` (or `POSTGRES_URL_NON_POOLING`).

## 3. Copy the data (on your computer)

You need **Node.js** and the **PostgreSQL client tools** (`pg_dump`, `psql`), version 15 or newer:
- Mac: `brew install postgresql@16`
- Windows: install PostgreSQL from postgresql.org and tick "Command Line Tools".

Do this at a quiet time. Orders placed during the copy won't be copied.

From the project folder, on the branch being deployed (it carries the newest schema):

```bash
npm install
OLD_DATABASE_URL='paste the current DIRECT_URL' \
SUPABASE_DIRECT_URL='paste the Supabase session URL (port 5432)' \
bash scripts/move-db-to-supabase.sh
```

The script:
1. Checks both connections.
2. Refuses to run if the Supabase database already has tables, so it can't overwrite anything.
3. Saves a full backup file, `urbanova-backup-<date>.sql`. **Keep this file safe.** It contains customer data.
4. Restores everything into Supabase in one step. If anything fails, nothing is half-copied.
5. Adds this branch's new columns (`prisma db push`).
6. Compares the row count of every table between the old database and Supabase.

Go on only when it ends with **"✓ Done. Every table matches."**

## 4. Point the website at Supabase

1. In Vercel, go to **Project → Settings → Environment Variables**. For **Production** (and Preview, if you want previews on Supabase too), set:
   - `DATABASE_URL` = the Supabase transaction pooler URL (6543, with `?pgbouncer=true&connection_limit=1`)
   - `DIRECT_URL` = the Supabase session pooler URL (5432)
2. If the old Vercel Postgres store is still **connected** to the project (Storage tab), disconnect it. Otherwise it keeps setting its own `POSTGRES_*` variables. The app only reads `DATABASE_URL` and `DIRECT_URL`.
3. Go to **Deployments → latest Production deployment → ⋯ → Redeploy**. Settings only take effect after a redeploy.
4. In GitHub, go to **Settings → Secrets and variables → Actions** and update the `DATABASE_URL` and `DIRECT_URL` secrets to the Supabase **session pooler** URL (5432). The Migrate DB workflow will then update Supabase on future merges, once GitHub Actions runs again.

## 5. Check the live site

- The home page, shop and a product page load.
- You can log in to admin and see the existing orders and products.
- Place a test order, check it appears in admin, then cancel it.
- Partner and rider logins still work.

**If something is wrong:** put the old `DATABASE_URL`/`DIRECT_URL` back in Vercel and redeploy. The old database was never changed.

## 6. Afterwards

- Keep the old database for a week or two. Delete it only when you're happy with Supabase.
- Supabase **free** projects pause after 7 days without activity, and only paid plans have daily backups. For a live shop, use the **Pro** plan.
- Treat the backup `.sql` file like customer data: store it privately and delete old copies.
- Photos stay on Vercel Blob. Only the database moves.
