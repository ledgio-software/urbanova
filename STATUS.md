# URBANOVA — Status Log

Reverse-chronological. Update this file after every meaningful change.

---

## 2026-10-21 — Link previews (share images)

**What:** Shared links (WhatsApp, Instagram/Facebook, X, iMessage) now show a picture card, not just a title. `app/opengraph-image.jpg` is the site-wide card (crew group shot + "URBANOVA / Bold City. Bold You." + hero line from Reference E.1); `app/(storefront)/movement/opengraph-image.jpg` is the Movement card ("Be yourself, loudly. Build something of your own."). Both 1200×630 JPEG (125 KB / 88 KB), headlines in Bebas Neue (OFL), alt text in `*.alt.txt`. Product pages keep their own product photo.

**Verified:** production build emits `og:image` / `twitter:image` with absolute URLs, 1200×630 size and alt text on `/`, `/movement`, `/contact`, `/legal/*`; the Movement image URL serves as `image/jpeg`. Not verified: an actual WhatsApp/Facebook fetch (needs the public URL). Messaging apps cache previews, so a link shared before this deploy may keep its old card for a while.

---

## 2026-10-21 — Working mobile menu + WhatsApp number

**What:**
- **Mobile menu:** the header's ☰ button on phones was a non-working placeholder. New `components/storefront/MobileMenu.tsx` opens a panel under the sticky header with Shop (+ categories), About, Movement, Vision & Mission, Track Order, Contact and Cart; current page highlighted. Closes on link tap, ✕, tap outside or Esc; page scroll locked while open. Desktop nav unchanged.
- **WhatsApp:** contact phone is now +233 55 778 6833 (founder-supplied 055 778 6833; `CONTACT_PHONE` overrides). Contact page "Message Us" opens `https://wa.me/233557786833` (was the `233000000000` placeholder); policy pages show the number next to the email. The floating WhatsApp button and "Join WhatsApp Group" links still open the VIP group invite.

**Verified:** typecheck + production build; scripted phone test (360px, touch): menu opens with all links, header stays usable, link tap navigates and closes, outside tap / ✕ / Esc close, scroll locked and restored, menu sits under the header when scrolled, no page errors; desktop shows the normal nav and no ☰. Contact "Message Us" → `https://wa.me/233557786833`; Terms and Complaints pages show the number. Category sub-links not exercised locally (no database), they use the same data as the desktop dropdown.

---

## 2026-10-21 — Contact email switched to Gmail

**What:** The customer contact email is now urbanovaclothing6@gmail.com (founder request). The Contact page (email button + wholesale FAQ) now reads `siteConfig.email` instead of a hardcoded `hello@urbanova.store`, so it and the policy pages show the same address. `CONTACT_EMAIL` env still overrides.

**Verified:** production build — `/contact`, `/legal/privacy-policy`, `/legal/shipping-returns`, `/legal/terms-of-service` show the Gmail address and no `hello@urbanova.store`.

---

## 2026-10-21 — Partner enquiry email

**What:** "Become a Partner" on `/movement` now emails urbanovaclothing6@gmail.com (founder-confirmed), via a new `partnerEmail` setting (`PARTNER_EMAIL` env overrides). The general contact email is unchanged.

**Verified:** production build renders `mailto:urbanovaclothing6@gmail.com?subject=Partnering%20with%20URBANOVA`.

---

## 2026-10-21 — Ad pixels with cookie consent, installable app, copyright notice

**What:**
- **Retargeting pixels:** Meta and TikTok pixels (`META_PIXEL_ID`, `TIKTOK_PIXEL_ID`) load only after the visitor taps Accept in a new cookie banner (`components/storefront/MarketingConsent.tsx`); choice stored in the browser (`lib/consent.ts`), changeable via a footer "Cookie settings" link; withdrawing consent reloads the page without the pixels. Page views are reported on client-side navigation too. No IDs set → no banner, no tracking.
- **Cookie Policy** (`/legal/cookie-policy`, Policies s.4) published now that the banner exists; Privacy Policy lists the ad platforms only when a pixel is configured.
- **Installable app:** `app/manifest.ts`, placeholder icons (`public/icons/`, `app/icon.png`, `app/apple-icon.png`), theme colour and iOS web-app metadata; footer shows an "Add to home screen" button (Android/Chrome) or Share → Add to Home Screen hint (iPhone). Brand colours read from `tailwind.config.ts` via `lib/brand.ts`.
- **Copyright:** footer notice that names, logos, designs, graphics and photos are protected, linking to Website Terms.

**Verified:** typecheck + production builds with and without pixel IDs. Browser test (mobile): no pixel requests before a choice; Reject → none; Cookie settings reopens banner; Accept → both pixel scripts load and a PageView fires on client navigation; choice persists across reloads; withdrawing consent removes the pixels; no page errors. Manifest and icons served; iPhone UA shows the install hint. Without IDs: no banner, Cookie Policy says essential only. Not verified: the Android install prompt (needs a real device) and live pixel delivery to Meta/TikTok (needs real IDs).

---

## 2026-10-21 — Movement gallery: tap-to-view lightbox

**What:** Every gallery tile on `/movement` (24 photos + the crew video) now opens a full-screen viewer showing the whole uncropped image. Navigate with ‹ › buttons, ← → keys or swipe; close with ×, Esc or a tap outside the photo. The video opens with playback controls. Built on the native `<dialog>` element in a new client component, `components/storefront/LookbookGallery.tsx` (no new dependency); page scroll is locked while it is open.

**Verified:** typecheck + production build; scripted browser test at 1366px and 390px (touch): 24 photo tiles + 1 video tile clickable, Next/←/wrap-around/swipe all move the counter correctly, Esc and outside-tap close it and restore scroll, video opens with controls, no page errors.

---

## 2026-10-21 — Movement hero background photo

**What:** The `/movement` hero ("Be yourself, loudly. Build something of your own.") now has a background photo (`lookbook-17`, the three-person group shot) under a navy gradient overlay so the text stays legible. `PageHero` gains an optional `background` prop; other pages using it are unchanged.

**Verified:** typecheck + production build; screenshots at 390px and 1366px show the photo with readable white text and no horizontal overflow.

---

## 2026-10-21 — Movement gallery: 4 more lookbook photos

**What:** Added 4 founder-supplied photos (courtyard walk ×2, café ×2) to the `/movement` gallery, spread through the grid. Gallery is now the video + 24 photos (4×7 on desktop, 2 columns on phones).

**Files added:** `public/movement/lookbook-18…21.webp` (35–126 KB each).

**Verified:** typecheck + production build; at 390px and 1366px all 24 images load with no horizontal overflow.

---

## 2026-10-21 — Movement gallery: 17 more lookbook photos

**What:** Added 17 founder-supplied lookbook photos to the `/movement` gallery (now the video + 20 photos). The video is a 2×2 feature tile so the grid stays even (4×6 on desktop, 2 columns on phones).

**Files added:** `public/movement/lookbook-01…17.webp` (resized to max 1200px, ~1.8 MB total; lazy-loaded and resized per device by `next/image`).

**Verified:** typecheck + production build; at 390px and 1366px all 20 images load, no horizontal overflow, video tile 358×477 on phone and 544×720 on desktop.

---

## 2026-10-21 — Movement page: crew photo & video gallery

**What:** Added a gallery to `/movement` (below the hero) with the 3 crew photos and the crew video supplied by the founder. People pictured agreed to appear on the site (confirmed by the requester).

**Files added:** `public/movement/crew-{front,temple,back}.webp` (converted from JPEG, 135–290 KB), `public/movement/crew-video.mp4` (audio stripped — it plays muted; faststart), `public/movement/crew-video-poster.webp`.

**Copy:** heading is the approved voice line from Reference B.3; lead line from Vision & Mission s.2.1.

**Verified:** typecheck + production build; screenshots at 390px and 1366px — gallery renders as 2×2 on phones and 4-across on desktop, no horizontal overflow on `/movement`, `/vision-mission`, `/legal/shipping-returns`.

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
