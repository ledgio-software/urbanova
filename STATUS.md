# URBANOVA — Status Log

Reverse-chronological. Update this file after every meaningful change.

---

## 2026-11-11 — Fix: Market Categories page did nothing when the server failed

**What:** Founder report: couldn't add market categories. When the live database hadn't been updated with the new columns (`npx prisma db push`), the categories API crashed, and the page swallowed the error: it showed "No market categories yet" and the Add buttons silently did nothing.
- The page now reads server replies safely and shows the real error; the empty-state panel is hidden when loading failed.
- `lib/api-errors.ts`: admin APIs answer a missing table/column (Prisma P2021/P2022) with a plain message — "The database hasn’t been updated for this version of the site yet. Run “npx prisma db push” on the live database" — used by the market categories API.

**Verified:** browser test with the `kind` column dropped (as on an un-updated database): message shown on load and on Add, no misleading empty state; after `prisma db push`, suggested categories and a custom one add fine. Nova Market suite (45) passes.

**Action for founder:** run `npx prisma db push` against the live database (it applies all columns from the Nova Market, Stockist and partner-website updates).

---

## 2026-11-11 — Product photos: one look for everything posted

**What:** Founder request — every product posted by URBANOVA or partners should look like the example tee photo (Reference B.5 "Product photo standard").
- **Same frame everywhere:** product cards, product pages (main site and partner websites), thumbnails and the bag use a 3:4 portrait frame with the whole item visible (`object-contain`) on the off-white product-photo background (`brand.white`). Existing photos included.
- **Photo guide:** example photo (`public/images/product-photo-example.jpg`) + tips next to the photo uploads in the admin and partner product forms.
- **Crop step:** chosen photos open one by one in a cropper (drag, zoom, "Show the whole photo", "Leave out"); saved as 1200 × 1600 JPEG on the product-photo background, then uploaded. No new dependencies (canvas).

**Verified:** typecheck + production build; 14-check browser test (guide shown, cropper queue "1 of 2 / 2 of 2", drag, fit-whole, leave out, upload is 1200 × 1600 JPEG in admin and partner forms, 3:4 frames on shop card and product page, `object-contain`, no page errors). Partner websites (40), stockists (51), Nova Market (45, updated for the crop step), partners (36), delivery (46): all pass.

---

## 2026-11-10 — Partner websites (own address + .com) and checkout redirect fix

**What:** Each live partner gets their own branded website on the same Vercel project (Reference I.7).
- **Addresses:** free `<page-address>.<PARTNER_ROOT_DOMAIN>`, plus their own domain (`partners.customDomain`, unique, normalised; URBANOVA's domains and `*.vercel.app` refused). Admin "Website" card with DNS steps; links in admin and the partner dashboard.
- **Routing:** middleware runs on every request; non-URBANOVA hosts are rewritten to `/site/[host]/…` (home, product, cart, checkout, order confirmation, about/contact, robots.txt, sitemap.xml); dashboards/policies/tracking go to the main site via `/site/[host]/to-main` (absolute redirect, same-site paths only). `/site/…` is 404 on the main site. Handled before the Auth.js wrapper, which re-bases URLs onto the main site. `MAIN_SITE_HOSTS` lists extra main-site domains.
- **Pages:** partner-branded header/footer (logo, Shop/About/Cart, WhatsApp/email, "Powered by URBANOVA", stockist badge), only that partner's live products, metadata/OG per partner, canonical to their own domain, per-site robots + sitemap. Shared `PartnerProductSections` for `/partners/[slug]` and the site home.
- **Fix (pre-existing, affected every order):** after **Place Order**, the checkout's "empty bag → /shop" effect fired when the bag was cleared and replaced the jump to the confirmation page, so customers never saw their MoMo payment instructions. Checkout also had a hydration mismatch on direct loads (bag only exists in the browser): the form now renders after mount and the empty-bag redirect waits for it.

**Verified:** typecheck + production build; 40-check browser test with real host names (sub-address, own domain, www, branding, sections, canonical, title, browse → cart → checkout → confirmation on the partner domain with the stockist's MoMo, other partners'/URBANOVA products 404, about/contact, robots, sitemap, redirects to main site, no open redirect, APIs + admin API protection, market-partner site, pending/unknown/suspended → 404, main site unchanged, main-site Place Order lands on confirmation, no page errors). Stockist (51), Nova Market (45), partners (36), delivery (46) re-run: all pass. Known: the partners suite showed an intermittent React hydration warning (#418) on Admin → Add partner in ~1 of 5 runs after the Website card was added; React recovers on its own and nothing visible changes; cause not pinned down.

**Deploy:** new column `partners.customDomain` → `npx prisma db push`. Then follow `docs/PARTNER_WEBSITES.md`.

---

## 2026-11-10 — URBANOVA Stockists: partners selling URBANOVA stock + their own items, paid directly

**What:** New partner type for shops that buy URBANOVA clothing and resell it alongside their own goods, with no commission (Reference I.6).
- **Schema:** `partners.type` (`market` | `stockist`), `products.sourceProductId` (a stockist's listing of an URBANOVA item, unique per stockist), `orders.sellerPartnerId` (paid directly to that stockist).
- **Admin:** partner type picker (stockists: no commission field; Mobile Money details required before going live); type column in the partner list; "Paid to {stockist}" on orders; URBANOVA product edits sync to stockist copies; a product stockists list can't be deleted.
- **Stockist dashboard:** "Add URBANOVA item" catalogue → set price + stock per size (name/photos/description locked to URBANOVA's); own items as before; **Orders** page (confirm payment, packed, sent, delivered, cancel — forward-only, own orders only) with call/WhatsApp/email for the customer; dashboard checklist + "orders to handle" alert; Sales shows no commission.
- **Storefront:** stockist page badged "Official URBANOVA Stockist" with WhatsApp button and URBANOVA / own-items sections; product pages show "Official URBANOVA" + "You pay {stockist} directly"; Nova Market shows stockists' own goods only; Shop unchanged.
- **Checkout:** one payee per order — bag blocks mixing (notice with link to the bag), checkout refuses mixed carts; the confirmation page shows the stockist's Mobile Money name/number instead of URBANOVA's.
- Shared `lib/phone.ts` WhatsApp link helper.

**Verified:** typecheck + production build; 51-check browser test on Postgres 16 (admin type/validation, stockist login, catalogue add, locked fields, later-added size, own item, public page sections + badge + WhatsApp, Nova Market/Shop separation, bag + server mixing refusal, confirmation shows stockist MoMo while URBANOVA orders still pay URBANOVA, admin banner, stockist order flow incl. skip refused, isolation between partners, Sales, payment details guard, rename sync, delete guard, type switch withdraws/restores copies, no page errors). Nova Market (45), partners (36) and delivery (46) suites re-run: all pass.

**Deploy:** new columns/enum — included in the Supabase migration script's `prisma db push` (or run `npx prisma db push`).

---

## 2026-11-06 — Database moving to Supabase (prepared, not yet switched)

**What:** Founder decision to move the production database from Vercel Postgres to Supabase, keeping all data.
- `scripts/move-db-to-supabase.sh`: backs up the current database, restores it into an empty Supabase project in one transaction (refuses a non-empty target), applies this branch's schema with `prisma db push`, then compares row counts for every table. It never writes to the old database.
- `docs/SUPABASE_MIGRATION.md`: step-by-step for the founder (create project, which URLs to use, run the script, update Vercel + GitHub secrets, redeploy, check, roll back).
- Supabase connection format in `.env.example`: `DATABASE_URL` = transaction pooler (6543, `?pgbouncer=true&connection_limit=1`), `DIRECT_URL` = session pooler (5432). Tech stack updated in README, CLAUDE.md, CONTRIBUTING (also corrected the stale Render rollback rows) and Reference A.
- `.gitignore` excludes `urbanova-backup-*.sql` (customer data).

**Verified:** script run locally against Postgres 16: database built from `main`'s schema with data → empty database owned by a non-superuser (like Supabase's `postgres` role) → all 13 tables match, new Nova Market columns added with defaults; a second run refuses to overwrite.

**Not done here:** the switch itself — needs the founder's Supabase project and Vercel access (this environment can't reach outside databases). Running the script also applies the Nova Market schema, which replaces the separate `prisma db push` step for PR #28.

---

## 2026-11-06 — Nova Market: partners list and sell their products

**What:** Partners can now list products, and customers can browse and buy them (Reference Part I, phases 2–3).
- **Schema:** `categories.kind` (`store` | `market`) + `sortOrder`; `products.isActive` (partner's show/hide) + `adminHidden` (URBANOVA override).
- **One visibility rule everywhere** (`lib/market.ts`): Shop, product pages, product API, sitemap and checkout only show/sell items that are active, not admin-hidden and (for partner items) from an active partner. Checkout refuses anything else with "no longer available".
- **Partner dashboard:** Products (list with Live / Hidden / Hidden by URBANOVA, quick Hide/Show, View), add/edit form (name, market category, price, description, up to 6 photos, options with size/type, colour, stock and optional price; simple items need no size/colour), delete (refused once an item has orders — hide it instead). Sales page: paid orders for their items with URBANOVA commission and their share. Checklist step "Add your first product". Partner SKUs `NM-[PARTNER]-[RANDOM]`.
- **Storefront:** `/market` (Nova Market: partners strip, category chips, product grid), `/partners/[slug]` (banner, logo, about, products), product pages show "Sold by" + Nova Market breadcrumb, option buttons for partner items and "More from {partner}". Shop stays URBANOVA-only. "Nova Market" link in header, mobile menu and footer.
- **Admin:** Market Categories page (add, rename, delete when empty, "Add suggested categories"); partner page lists their products with Hide/Unhide; order items show "Sold by {partner} (Nova Market)"; admin Products list/forms stay URBANOVA-only (partner items redirect to the partner page).
- Storefront caches are cleared whenever a listing, partner or market category changes, so hiding/suspending takes effect at once.
- **Fix (pre-existing):** the header cart badge caused a React hydration error on every page once the cart had items; it now renders after mount.

**Verified:** typecheck + production build; 45-check browser test on a real Postgres: suggested categories; partner adds a product with photos and options; Live status; appears on /market, partner page and product API but not in Shop; PDP "Sold by", sold-out option disabled, add to cart; checkout of a partner item; admin order shows "Sold by"; partner Sales shows the sale, 10% commission and share; partner hide → 404 + checkout refused, show again; admin hide overrides partner, unhide; other partner can't edit/hide/delete (404); Shop categories refused for partners; can't delete ordered products or remove ordered options; duplicate options rejected; admin Products stays store-only; suspended partner's page/products disappear; no page errors. Partner (36) and delivery (46) suites re-run: all pass.

**Deploy warning:** new columns — the production database needs `npx prisma db push` before this is merged, otherwise product queries fail and the shop breaks. Then add market categories in admin.

**Found, not changed:** stock is never deducted when orders are placed or paid (whole store). Needs a founder decision.

---

## 2026-11-06 — URBANOVA Delivery core: riders, delivery jobs, tracking, delivery codes

**What:** First part of the URBANOVA delivery system (Reference Part J).
- **Schema:** `riders`, `delivery_jobs`, `delivery_events`; `orders` ↔ one delivery.
- **Rider role** (`/rider`, `/api/rider`) alongside admin and partner; admin-created logins with one-time passwords, forced password change, rate-limited login.
- **Admin:** Riders page (add, suspend/reactivate, reset password); Deliveries list (Open / Delivered / Cancelled / All), "New booking" for parcels booked by phone/WhatsApp, delivery detail (code, pickup/drop-off with call + map, rider, timeline, assign/reassign, cancel, "mark delivered" override); "Send with URBANOVA Delivery" on paid/packed order pages. Sidebar: Deliveries, Riders. `STORE_PICKUP_ADDRESS` pre-fills pickup.
- **Rider dashboard** (phone-first): assigned jobs with big Call / Map buttons, "I've picked it up", "On my way", "Delivered — enter code" (4-digit, 5 tries), "Can't complete" with reason; recent jobs.
- **Customers:** delivery code + "Track your delivery" on the order confirmation page; public `/track/[code]` timeline (first names only, no addresses/phones/code).
- **Order sync:** picked up → order `shipped`, delivered → order `delivered`.
- **Fix:** admin login now refreshes after signing in, so the sidebar appears without a manual reload (pre-existing bug).
- Shared password-change handler and form for partners and riders.

**Verified:** typecheck + production build; 46-check browser test on a real Postgres: order → paid → sent with delivery from the order page; unpaid/duplicate refused; customer sees code + tracking; tracking page leaks no address/phone/surname/code on a fresh load; rider first login, sees only own jobs, can't skip steps, wrong code counted, correct code delivers; order goes shipped → delivered; manual booking; another rider's job → 404; 5 wrong codes lock out; reassign blocked once picked up; admin override + timeline note; failed → reassign; cancel is final; role isolation (rider ↔ admin ↔ partner ↔ anonymous); suspended rider logged out and can't be assigned; no page errors. Partner suite (36 checks) re-run: all pass.

**Deploy warning:** new tables — the production database needs `npx prisma db push` (see Part I entry).

**Not built yet:** WhatsApp messages, partner-order delivery choice, outside-business booking page + distance pricing — Reference J.4.

---

## 2026-11-06 — Partner marketplace, part 1: roles, partner accounts, dashboard

**What:** Foundations for Nova Market (Reference Part I) — partners get a login and a dashboard; the admin onboards and manages them.
- **Roles (security fix):** sessions now carry `role` (`admin` | `partner`). Previously any signed-in session was treated as admin. Middleware gates `/admin`+`/api/admin` to admins and `/partner`+`/api/partner` to partners; route handlers re-check (`lib/authz.ts`). Auth split into edge-safe `auth.config.ts` (middleware) and `auth.ts` (providers). Admin and partner logins rate-limited (10 per IP per 15 min). **Existing admin sessions must log in again after deploy.**
- **Schema:** `partners`, `partner_users`, `products.partnerId` (nullable).
- **Admin:** `/admin/partners` list, add (creates the partner + first login with a one-time password, copy/WhatsApp share), edit (status, commission %, page, contact, payouts), extra logins, password reset. Going live requires a commission.
- **Partner dashboard** (`/partner`): login, forced password change on first login, dashboard (status, set-up checklist, commission, payout), "My Page" editor (tagline, about, logo, banner, contact, payout details). Partners can't change their name, page address, status or commission.
- **Uploads:** shared `lib/upload.ts`; new `/api/partner/upload` accepts only JPG/PNG/WebP up to 5 MB.

**Verified:** typecheck + production build; 36-check browser test against a real Postgres (seeded): signed-out access blocked; admin creates partners (commission required to go live, duplicate login rejected); partner first login forced to set password (page + API blocked until then); profile + logo + payout save; partner cannot reach admin pages/APIs and admin cannot use partner APIs; partner can't change protected fields or another partner; no password hashes in API output; password reset invalidates old password; suspension ends the session and blocks login; storefront unaffected; no page errors.

**Deploy warning:** `products.partnerId` is a new column. If the production database doesn't get the schema change (Migrate DB workflow has been failing on main), product queries will fail and the shop will show nothing. Run `npx prisma db push` against production (or fix the workflow) **before or at merge**.

**Not built yet:** partner products, public partner pages, partner orders/earnings, Paystack split — see Reference I.4.

---

## 2026-10-21 — Snapchat link in footer

**What:** Footer social row gains a Snapchat icon linking to https://www.snapchat.com/add/urban264474 (founder-supplied; `share_id`/`locale` tracking params dropped), opening in a new tab. URL in `siteConfig.snapchatUrl` (`SNAPCHAT_URL` overrides). Order: TikTok, Snapchat, Instagram, X.

**Verified:** typecheck + production build; footer shows both TikTok and Snapchat links with correct hrefs and `target="_blank"`; visual check at 390px.

---

## 2026-10-21 — TikTok link in footer

**What:** Footer social row gains a TikTok icon linking to https://www.tiktok.com/@urbanova55771 (founder-supplied; share-tracking query params dropped), opening in a new tab. URL lives in `siteConfig.tiktokUrl` (`TIKTOK_URL` overrides). The existing Instagram and X icons still point to `#` until handles are supplied.

**Verified:** typecheck + production build; on `/`, `/movement`, `/legal/privacy-policy` the footer shows the TikTok link with the correct href and `target="_blank"`; visual check at 390px.

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
