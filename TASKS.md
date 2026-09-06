# URBANOVA — Task Tracker

A task is only `[x]` when the feature is verified working — not just coded.

---

## Phase 1 — Foundation

- [ ] Scaffold Next.js project (App Router, TypeScript strict mode)
- [ ] Configure Tailwind CSS with URBANOVA design tokens (colors, typography)
- [ ] Set up Vercel Postgres + Prisma ORM
- [ ] Write Prisma schema (categories, products, product_variants, product_images, customers, orders, order_items, delivery_zones)
- [ ] Run initial Prisma migration
- [ ] Seed database with sample catalog data (per Reference doc Part C, Section C.6 examples)
- [ ] Set up `.env.example` with all required variable names (no secrets)
- [ ] Verify project runs locally with `npm run dev`

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
