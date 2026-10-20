# URBANOVA — Status Log

Reverse-chronological. Update this file after every meaningful change.

---

## 2026-10-20 — Phase 5: Movement, Vision & Mission, and policy pages

**What:** Added the four founder-approved documents to the site: new `/vision-mission` and `/movement` pages, and replaced the three hand-written legal pages with the approved Policies & Terms (12 policies under `/legal/[slug]`).

**Files added:**
- `docs/approved/*.md` — the four approved documents (Vision & Mission, Movement, Foundation Phases, Policies & Terms), converted to Markdown for traceability
- `docs/URBANOVA_REFERENCE.md` — new Part H (approved additions, pages, rule changes, what is not published, open items); F.5 marked superseded
- `lib/site-config.ts` — business identity (env-driven) and suggested policy numbers, editable in one place
- `lib/content/{types,store-policies,movement-policies,policies,policy-index}.ts` — typed policy content; shipping zones read live from `delivery_zones`
- `components/storefront/PolicyDocument.tsx`, `components/storefront/PageHero.tsx`
- `app/(storefront)/vision-mission/page.tsx`, `app/(storefront)/movement/page.tsx`

**Files changed:** `app/(storefront)/legal/[slug]/page.tsx` (now renders from content modules; `terms-of-service` is now Terms & Conditions of Sale), `app/(storefront)/about/page.tsx` (link band to new pages), `app/(storefront)/contact/page.tsx` (FAQ exchange answer now states the 14-day rule), `components/storefront/{Header,Footer}.tsx`, `app/sitemap.ts`, `.env.example`.

**Behaviour changes:** returns policy is now the 14-day right to cancel (was 7-day exchange-only) per Act 772; data retention is 6 years (was 7); privacy page no longer mentions customer accounts (none exist yet).

**Not published (see Reference H.4):** Cookie Policy (no banner yet), Nova Market Seller Terms, internal policies, placeholder figures, and the internal parts of Foundation Phases.

**Verified:** `npm run typecheck` passes; `next build` succeeds; all 12 `/legal/*`, `/movement`, `/vision-mission` return 200 against a production build, unknown slugs 404, no bracketed placeholders in rendered policies. Not verified: visual review on a phone (no browser pass done); policies are unreviewed by a lawyer.

---

## 2026-09-06 — Phase 1: Foundation

**What:** Full Phase 1 implementation — Next.js scaffold, Tailwind design tokens, Prisma schema, seed data, lib helpers, CI fix.

**Files added:**
- `package.json` — Next.js 15, React 19, Prisma 5, Zod, TypeScript strict
- `tsconfig.json` — strict mode, `@/*` path alias
- `next.config.ts` — Vercel Blob image domain
- `tailwind.config.ts` — URBANOVA design tokens (brand-navy, brand-red, brand-white, headline/body font families, display font sizes)
- `postcss.config.mjs`
- `.env.example` — all required env vars documented, no secrets
- `.gitignore`
- `prisma/schema.prisma` — all 8 tables: Category, Product, ProductVariant, ProductImage, Customer, Order, OrderItem, DeliveryZone; OrderStatus enum; indexes on slug, sku, status
- `prisma/seed.ts` — 2 categories, 2 products, 20 SKUs (Skyline Tee × 2 colors × 5 sizes, Nova Hoodie × 2 colors × 5 sizes), 2 delivery zones
- `lib/db.ts` — Prisma singleton (prevents dev hot-reload duplicates)
- `lib/validators.ts` — Zod schemas: CheckoutSchema, ContactSchema, NewsletterSchema
- `lib/paystack.ts` — initializePayment, verifyPayment, validateWebhookSignature, generateReference
- `app/layout.tsx` — root layout with Bebas Neue (headline) + Inter (body) via next/font, full metadata
- `app/globals.css` — Tailwind base + brand CSS custom properties
- `app/(storefront)/page.tsx` — Phase 1 placeholder homepage (navy/red brand colours applied)
- All remaining storefront pages (shop, category, PDP, cart, checkout, order-confirmation, about, contact, legal) as Phase 2/3/5 placeholders
- `app/admin/page.tsx` — Phase 4 placeholder
- `app/api/products/route.ts` — GET all products (live, queries DB)
- `app/api/checkout/route.ts`, `app/api/orders/route.ts`, `app/api/webhooks/paystack/route.ts` — Phase 3 stubs
- `components/storefront/`, `components/admin/` — directory structure created
- `.github/workflows/ci.yml` — fixed for Next.js monorepo (was wrongly referencing backend/ and frontend/ dirs)

**Why:** Establish the complete data model and project structure before any Phase 2 UI work. Schema-first as per CLAUDE.md policy.

**Verified:** `prisma validate` passes. `npm install` succeeds. Schema matches all 8 tables and relations defined in docs/URBANOVA_REFERENCE.md Part A, Section A.4.

---

## 2026-09-06 — Project scaffold

**What:** Initial repository setup.

**Files added:**
- `README.md` — project overview and stack summary
- `CLAUDE.md` — agent constitution and mandatory pre-coding policy
- `docs/URBANOVA_REFERENCE.md` — complete consolidated reference (all 6 source documents combined into a single source of truth)
- `STATUS.md` — this file
- `TASKS.md` — task tracker

**Why:** Establish the project foundation and ensure all agents have a single authoritative reference document before any code is written.

**Next:** Phase 1 — Next.js project scaffold, Prisma schema, Tailwind theme setup, seed data.
