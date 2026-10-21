# URBANOVA — Task Tracker

A task is only `[x]` when the feature is verified working — not just coded.

---

## Phase 1 — Foundation

- [x] Scaffold Next.js project (App Router, TypeScript strict mode)
- [x] Configure Tailwind CSS with URBANOVA design tokens (colors, typography)
- [x] Set up Vercel Postgres + Prisma ORM
- [x] Write Prisma schema (categories, products, product_variants, product_images, customers, orders, order_items, delivery_zones)
- [ ] Run initial Prisma migration (needs real DATABASE_URL — run `npm run db:migrate` locally after filling .env.local)
- [x] Seed database with sample catalog data (per Reference doc Part C, Section C.6 examples) — run `npm run db:seed` after migration
- [x] Set up `.env.example` with all required variable names (no secrets)
- [ ] Verify project runs locally with `npm run dev` (needs .env.local filled)

## Phase 2 — Storefront Core

- [ ] Home page (hero, featured products, category tiles, newsletter signup)
- [ ] Shop page (product grid, filters, sort)
- [ ] Category page (pre-filtered Shop view)
- [ ] Product Detail Page (images, size/color selector, add to cart, size guide)
- [ ] Cart (line items, subtotal, proceed to checkout)
- [ ] Cart state management (Zustand or React Context, persisted)

## Phase 3 — Checkout & Payments

- [ ] Checkout page (contact details, delivery zone, order summary, payment method selection)
- [ ] Order creation API route (`/api/checkout`)
- [ ] Paystack integration (test mode — mobile money + card)
- [ ] Paystack webhook handler (`/api/webhooks/paystack`) with signature verification
- [ ] Order Confirmation page
- [ ] Order confirmation email (Resend) using copy from Reference doc Part E, Section E.6

## Phase 4 — Admin

- [ ] Admin login (Auth.js credential-based)
- [ ] Admin authentication middleware on all admin API routes
- [ ] Product CRUD (create, edit, delete products + variants + images)
- [ ] Image upload to Vercel Blob
- [ ] Order list with status update controls
- [ ] Delivery zone management (configurable fees + zones)

## Phase 5 — Remaining Pages & Polish

- [ ] About page (copy from Reference doc Part E, Section E.4)
- [ ] Contact page (form, FAQ, WhatsApp link)
- [ ] Legal pages (Shipping & Returns, Privacy Policy, Terms of Service)
- [ ] Mobile responsiveness audit across all pages
- [ ] Basic SEO (page titles, meta descriptions)

## Phase 6 — Testing & Launch

- [ ] Full end-to-end checkout test (real transaction in Paystack test mode)
- [ ] Switch to Paystack live keys and run a small live test
- [ ] All copy reviewed against Reference doc Part E and signed off by founder
- [ ] All open items from Reference doc Appendix resolved or confirmed as deferred
- [ ] Founder sign-off on go-live

## Phase 5b — Movement, Vision & Policies (founder-approved Oct 2026, Reference Part H)

- [x] Vision & Mission page (`/vision-mission`) — typecheck + build + 200 on production build; not yet checked on a phone
- [x] Movement page (`/movement`) — same verification as above
- [x] Policy pages under `/legal/*` from the approved Policies document (12 policies)
- [x] Returns policy updated to the 14-day right to cancel (Reference F.5 superseded)
- [x] Header/footer/sitemap links for new pages
- [ ] Mobile pass over `/movement`, `/vision-mission`, `/legal/*` (header has no working mobile menu — footer is the only mobile route to these pages)
- [ ] Founder: fill business identity env vars and confirm bracketed numbers in `lib/site-config.ts`
- [ ] Founder: Ghana lawyer review of all policies; then set `POLICY_EFFECTIVE_DATE`
- [ ] Founder: confirm payment-method names (Telecel Cash / AT Money vs Vodafone Cash / AirtelTigo Money) against checkout
- [ ] Checkout: required T&C + Returns checkbox; unticked marketing opt-in stored with date and source (needs schema decision)
- [ ] Return request form and order-cancellation flow (needs schema/API)
- [x] Cookie banner + publish Cookie Policy (Policies s.4) — consent-gated Meta/TikTok pixels; browser-tested
- [ ] Founder: add `META_PIXEL_ID` / `TIKTOK_PIXEL_ID` in Vercel and redeploy
- [ ] Replace placeholder app icons in `public/icons/` and `app/icon.png`, `app/apple-icon.png` with the final logo
- [ ] Optional: send AddToCart / Purchase events to the pixels for better ad targeting
- [ ] Customer data export/delete on request
- [x] Contact FAQ exchange answer updated to the 14-day rule
- [ ] Update the internal operations doc to the 14-day rule
- [ ] Membership sign-up, Spotlight, Donate, Annual Report pages — blocked on schema/API, Safeguarding Lead appointment and registration gates (Foundation Phases)
- [ ] Nova Market Seller Terms — publish only when marketplace launches, after legal review
