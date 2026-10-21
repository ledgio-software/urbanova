# URBANOVA — Complete Project Reference

> **Single source of truth.** All development decisions must trace back to a section of this document.
> Last compiled: September 2026 — assembled from v1.0 drafts of all six reference documents.

---

## PART A — BUILD INSTRUCTIONS

### A.1 Project Overview

Build a mobile-first e-commerce website for URBANOVA, a streetwear brand. Customers browse products (t-shirts, hoodies), add to cart, check out with mobile money or card, and receive order confirmation. There is a lightweight admin area to manage products and view orders.

Brand tone carries into the UI: bold, high-contrast, confident. Apply colors and typography as design tokens — do not hardcode brand values throughout components.

---

### A.2 Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) | Single codebase for frontend + API routes/Server Actions |
| Language | TypeScript | Strict mode on |
| Database | Vercel Postgres | Use `@vercel/postgres` or Prisma/Drizzle ORM |
| ORM | Prisma (recommended) | Simpler migrations for a solo/small team |
| Styling | Tailwind CSS | Use design tokens from Brand Brief |
| Auth (admin) | Auth.js (NextAuth) | Credential-based admin login only |
| Payments | Paystack | Supports MTN MoMo, Vodafone Cash, AirtelTigo Money, cards |
| Image hosting | Vercel Blob | Product images |
| Email | Resend | Order confirmation emails |
| Hosting | Vercel | Frontend + API/serverless functions |

Do NOT introduce additional infrastructure — everything runs on Vercel's platform.

---

### A.3 Repository & Folder Structure

```
/app
  /(storefront)
    /page.tsx                       → Home
    /shop/page.tsx                  → Shop (all products)
    /shop/[category]/page.tsx       → Category page
    /product/[slug]/page.tsx        → Product Detail Page
    /cart/page.tsx                  → Cart
    /checkout/page.tsx              → Checkout
    /order-confirmation/[id]/page.tsx
    /about/page.tsx
    /contact/page.tsx
    /account/page.tsx               → Order history (phase 2)
    /legal/[slug]/page.tsx          → Shipping/Returns, Privacy, Terms
  /admin
    /page.tsx                       → Admin dashboard
    /products/                      → Product CRUD
    /orders/                        → Order management
  /api
    /checkout/route.ts
    /webhooks/paystack/route.ts
    /products/route.ts
    /orders/route.ts
/lib
  /db.ts
  /paystack.ts
  /validators.ts
/components
  /storefront/
  /admin/
/prisma
  /schema.prisma
/public
/docs
  /URBANOVA_REFERENCE.md            ← this file
```

---

### A.4 Database Schema

**categories** — id, name, slug, description

**products** — id, name, slug, category_id (FK), description, base_price, featured (boolean), tags, created_at

**product_variants** — id, product_id (FK), sku (unique, format `URB-[CATEGORY]-[STYLE]-[COLOR]-[SIZE]`), size, color, stock_quantity, price_override (nullable)

**product_images** — id, product_id (FK), variant_id (nullable FK), url, sort_order

**customers** — id, name, email, phone, created_at

**orders** — id, customer_id (nullable FK), status (enum: pending_payment | paid | packed | shipped | delivered | cancelled | returned), subtotal, delivery_fee, total, delivery_zone, delivery_address, payment_method, payment_reference, created_at

**order_items** — id, order_id (FK), variant_id (FK), quantity, unit_price

**delivery_zones** — id, name, estimated_days, fee (editable from admin)

Indexes on: `sku`, `slug`, `order.status`. Foreign key constraints required. Use Prisma Migrate — never hand-edit the production schema.

---

### A.5 Environment Variables

```
POSTGRES_URL=
POSTGRES_PRISMA_URL=
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
NEXTAUTH_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
RESEND_API_KEY=
BLOB_READ_WRITE_TOKEN=
NEXT_PUBLIC_SITE_URL=
```

Never commit secrets. Use `.env.local` locally; Vercel dashboard for preview/production. Use Paystack test mode in preview.

---

### A.6 Coding Standards

- TypeScript strict mode; no `any` unless absolutely unavoidable (and commented why)
- Validate all external input with Zod before touching the database
- Server Actions/API routes return typed responses; handle errors explicitly
- All prices as integers (pesewas) internally; format to GHS at display only
- Run `npm run lint` and `npm run typecheck` before every commit/PR
- Never commit `.env` files or secrets

---

### A.7 Build Phases

| Phase | What gets built |
|---|---|
| 1 — Foundation | Next.js project, DB schema, seed data, Tailwind theme |
| 2 — Storefront Core | Home, Shop, Category, PDP, Cart |
| 3 — Checkout & Payments | Paystack integration, webhook handler, Order Confirmation, email |
| 4 — Admin | Admin login, product CRUD, order management |
| 5 — Remaining Pages & Polish | About, Contact, Legal, SEO, mobile pass |
| 6 — Testing & Launch | Full checkout test, load test, copy sign-off |

**Rule:** Do not start a phase's UI work before its data model exists — always build schema/API before the page that depends on it.

---

### A.8 Payment Integration Policy

- Use Paystack's official SDK/API — no custom card-handling logic
- Mark an order `paid` ONLY after Paystack webhook signature is verified — never trust client redirects alone
- Store only the payment reference/transaction ID — never store card numbers, CVVs, or mobile money PINs

---

### A.9 Security Policy

- HTTPS enforced by Vercel — do not disable it
- Sanitize and validate all user input server-side
- Rate-limit the checkout and login endpoints
- Admin routes protected by authentication middleware — verify session on every admin API route, not just in the UI

---

### A.10 Open Items Blocking Full Launch

These items must be resolved by the founder before go-live — build them as configurable/editable fields, not hardcoded values:

1. Final logo/visual assets
2. Confirmed pricing per product
3. Confirmed delivery zones and fees
4. Chosen fulfillment approach (self-delivery vs. courier)
5. Finalized returns/exchange policy

---

## PART B — BRAND BRIEF

### B.1 Brand Foundation

**Name meaning:** URBANOVA fuses "Urban" with "Nova" (a star that suddenly brightens and rises) — bold new energy rising out of city life.

**Brand Story:** URBANOVA is built around an imagined city — not a real place on a map, but a state of mind. Fast-moving, unafraid, always rising.

**Mission:** To make clothing that gives young people the confidence to move through the world boldly — unapologetically visible, unmistakably themselves.

**Vision:** To become the defining streetwear label for a generation of young people who treat the city as their stage.

**Core Values:**
- Boldness — never blend in when you can stand out
- Courage — wear confidence like armor
- Movement — always rising, always going somewhere
- Authenticity — the city persona is aspirational, never fake

---

### B.2 Target Audience

Bold, ambitious young people who want to feel seen and confident. They want:
- A brand story they can relate to and repeat to friends
- Designs and drops that feel current, not generic
- Quality and consistency that proves the brand is "real"

---

### B.3 Brand Personality & Voice

**Traits:** Confident, Energetic, Street-smart, Aspirational

**Voice rules:**
- Short, punchy sentences — speak directly to "you"
- Lean on city/rising/movement themes
- Never apologetic or corporate
- Avoid generic fashion clichés

**Sample voice lines:**
- "The city doesn't wait. Neither do you."
- "Wear the version of you that isn't afraid."
- "New drop. New nova."

---

### B.4 Messaging

**Primary tagline:** Bold City. Bold You.

**Alternate taglines:**
- Rise Like a Nova.
- Your City. Your Rules.
- Built for the Bold.

---

### B.5 Visual Identity Direction

**Color Palette:** Navy + Red accent + off-white/concrete white (exact hex values to be confirmed by founder — build as CSS design tokens, not hardcoded).

**Typography:**
- Headlines: bold, condensed, all-caps sans-serif (style of Bebas Neue, Anton)
- Body: clean, modern sans-serif (style of Inter, Helvetica)
- Avoid: script fonts, serif fonts, anything formal or delicate

**Website application:**
- Logo in header, navy background sections with red accent buttons/CTAs
- Bold, full-width hero imagery on homepage
- Product photography on clean off-white background

**Photography style:**
- High-contrast, urban settings (streets, rooftops, night lighting)
- Real models with confident poses
- Avoid: soft pastel tones, overly polished studio-only shots

---

### B.6 Logo Concept Directions (for designer)

- **Direction A (recommended):** Bold condensed all-caps "URBANOVA" wordmark with star/spark motif on the "O"
- **Direction B:** Monogram "UN" or "U" from abstract skyline shapes — works as small chest logo
- **Direction C:** Circular/shield badge combining brand name and skyline/star icon

> **Open decision:** Founder must confirm logo direction before it is used in the site header.

---

## PART C — PRODUCT CATALOG STRUCTURE

### C.1 Category Structure

**Launch categories:**
- T-Shirts
- Hoodies
- Accessories (caps, tote bags) — optional at launch

**Future categories:** Sweatpants/Joggers, Jackets, Limited Drops/Collabs

**Recommendation:** Launch with T-Shirts and Hoodies done well.

---

### C.2 Product Attributes

Every product must carry: name, slug, category, description, base_price, featured flag, tags, and at least one image. Variants carry: size, color, sku, stock_quantity, price_override.

---

### C.3 Size Range

- T-Shirts & Hoodies: S, M, L, XL, XXL
- Caps/Accessories: One Size (where applicable)
- Every PDP must link to a size guide (chest width + length in cm and inches)

---

### C.4 Color Naming Convention

Use brand-flavored names, not generic terms. Examples:
- Midnight City (black)
- Night Navy (navy)
- Concrete White (off-white/white)

Keep 3–5 core colors at launch.

---

### C.5 Pricing Structure

*(Placeholder — to be confirmed by founder based on production costs)*

**Principles:**
- Price must cover production cost + healthy margin + payment gateway fees
- Keep pricing consistent within a category
- Slightly premium pricing for "Limited Drop" items
- Display prices in GHS; handle all prices internally as integers (pesewas)

---

### C.6 SKU Naming Convention

Format: `URB-[CATEGORY]-[STYLE]-[COLOR]-[SIZE]`

| Component | Values |
|---|---|
| CATEGORY | TS (T-Shirt), HD (Hoodie), CP (Cap), AC (Accessory) |
| STYLE | Short style code (e.g., SKYLINE, NOVA, CITY) |
| COLOR | BLK, NVY, WHT, etc. |
| SIZE | S, M, L, XL, XXL, OS |

**Examples:**
- `URB-TS-SKYLINE-BLK-M` → Skyline T-Shirt, Midnight City (Black), Medium
- `URB-HD-NOVA-NVY-XL` → Nova Hoodie, Night Navy, Extra Large
- `URB-CP-CITY-WHT-OS` → City Cap, Concrete White, One Size

---

### C.7 Inventory Rules

- Track stock per SKU (not per product)
- Zero stock → show "Sold Out", do not hide the variant
- Low-stock threshold: 3 units (flag for restock)
- Limited Drop items: strict no-restock messaging

---

## PART D — SITEMAP & PAGE SPECIFICATIONS

### D.1 Customer Journey

Home → Shop / Category → Product Detail → Cart → Checkout → Order Confirmation

Account, Contact, About, and Legal accessible from header/footer at any point.

---

### D.2 Home Page

**Purpose:** First impression — establishes bold city identity, drives toward shopping.

**Sections:**
1. Hero: full-width bold imagery/video + tagline + "Shop Now" CTA
2. Featured/new arrivals product carousel
3. Brand story teaser + "Learn more" link to About
4. Category highlights (T-Shirts, Hoodies) as clickable tiles
5. Newsletter signup block
6. Instagram/social proof section (optional at launch)

**Performance note:** Compress hero imagery/video for mobile connections.

---

### D.3 Shop (All Products)

**Sections:**
- Product grid (image, name, price, quick add-to-cart on hover/tap)
- Filter sidebar: category, size, color, price range
- Sort: newest, price low–high, price high–low, best-selling
- Pagination or infinite scroll

**Notes:** Show "out of stock" clearly. Category page = Shop page with a category filter pre-applied.

---

### D.4 Product Detail Page

**Sections:**
- Multiple product images (front, back, close-up/fabric detail)
- Product name, price, short description
- Size selector (with size guide link/modal)
- Color selector (if multiple colorways)
- Stock availability per size/color
- Related/"you may also like" products

**Rules:**
- Disable "Add to Cart" until a size is selected
- Show clear messaging for sold-out sizes

---

### D.5 Cart

**Sections:** Item list (image, name, size/color, quantity, price), subtotal, promo code field

**CTAs:** Update quantity, Remove item, Proceed to Checkout, Continue Shopping

**Empty state:** "Your cart's as empty as a Monday morning. Let's fix that." + [Shop Now]

---

### D.6 Checkout

**Sections:**
- Contact details (name, phone, email)
- Delivery address / delivery zone selection
- Order summary (items, subtotal, delivery fee, total)
- Payment method: MTN MoMo, Vodafone Cash, AirtelTigo Money, card

**Rules:**
- Guest checkout must always be available — never force account creation
- Payment through Paystack only

---

### D.7 Order Confirmation

**Sections:** Order number + item summary, estimated delivery window, receipt confirmation

**CTAs:** Continue shopping, View order (if account exists)

---

### D.8 About URBANOVA

**Sections:** Brand story (imagined bold city), core values, optional founder note, city/street photos

**CTA at end:** Shop Now

---

### D.9 Contact / Support

**Sections:**
- Contact form (name, email, message)
- Direct contact info (WhatsApp/phone, email, social handles)
- FAQ (sizing, delivery, returns)

**Note:** WhatsApp click-to-chat is expected and common in the Ghanaian market.

---

### D.10 Account / Order History (Phase 2)

**Sections:** Login/register form, order history with status, saved delivery details

**Note:** Phase 1 can launch with guest checkout only.

---

### D.11 Legal Pages

- Shipping & Returns Policy
- Privacy Policy
- Terms of Service

**Note:** Especially important for a new brand — customers check these before trusting the site with payment.

---

### D.12 Navigation & Footer

**Header:** Logo (Home link), Shop (category dropdown), About, Contact, Cart icon (item count badge), Account icon

**Footer:** Quick links (Shop, About, Contact, Legal), Social icons, Newsletter signup, Payment method icons (trust signal), Copyright line

---

## PART E — CONTENT & COPYWRITING PLAN

> All copy below is draft — approved by the brand brief but must be confirmed/signed off by the founder before final launch.

### E.1 Homepage Copy

**Hero:**
```
BOLD CITY. BOLD YOU.
Streetwear made for the ones who don't wait to be noticed.
[Shop Now]
```

**Brand story teaser:**
```
URBANOVA isn't just a city. It's a state of mind — fast-moving, unafraid, always rising.
This is where that energy becomes something you wear.
[Learn Our Story →]
```

**Category tiles:**
- T-SHIRTS — "The everyday uniform for the bold."
- HOODIES — "City nights start here."

**Newsletter:**
```
JOIN THE RISE.
Be first to know about new drops. No spam, just nova energy.
[Email address] [Join]
```

---

### E.2 Shop / Category Copy

**Shop header:**
```
THE FULL COLLECTION
Every piece built for the bold. Find your fit.
```

**Category headers:**
- T-Shirts: "CLASSICS WITH AN EDGE — Everyday tees, city-coded."
- Hoodies: "HEAVYWEIGHT ENERGY — Built for cool nights and bold moves."

**Empty filter state:** "Nothing here yet — try a different filter or check back for the next drop."

**Sold-out badge:** "SOLD OUT — back soon."

---

### E.3 Product Description Template

```
Line 1 (hook): one bold, energetic sentence tying the piece to the brand identity
Line 2 (details): fabric, fit, and construction details
Line 3 (care/fit note): sizing note or care instruction
```

**Skyline Tee example:**
```
Bold skyline graphic tee for those who move like the city never sleeps.
100% cotton, regular fit, breathable everyday wear.
Runs true to size — check our size guide if you're between sizes.
```

**Nova Hoodie example:**
```
Heavyweight fleece built for city nights and bold entrances.
Brushed fleece interior, front spark print, relaxed fit.
For an oversized look, size up.
```

---

### E.4 About Page Copy (Full Draft)

```
URBANOVA was born from an idea, not a place.

Picture a city that never dims its lights — where every street corner belongs to someone bold
enough to claim it. That's URBANOVA. Not a location you'll find on a map, but an energy every
ambitious, unafraid young person already carries inside them.

We make clothing for that energy. Bold graphics. City-coded design. Pieces built to move with
you — through the everyday hustle and the nights that turn into stories.

This is streetwear for the ones who don't wait to be noticed. Welcome to URBANOVA.

[Shop the Collection]
```

---

### E.5 Cart & Checkout Microcopy

| Element | Copy |
|---|---|
| Cart header | YOUR CART |
| Empty cart | "Your cart's as empty as a Monday morning. Let's fix that." + [Shop Now] |
| Checkout button | "Checkout →" |
| Delivery section | DELIVERY DETAILS |
| Payment section | HOW DO YOU WANT TO PAY? |
| Trust line | "Secure checkout. Your details are safe with us." |
| Final CTA | Place Order |

---

### E.6 Order Confirmation Copy

**On-screen:**
```
YOU'RE IN.
Order #[XXXX] confirmed — your URBANOVA pieces are on the way.
Estimated delivery: [X–X business days]
```

**Confirmation email:**
```
Subject: Your URBANOVA order is confirmed

Hey [Name],
Your order #[XXXX] is locked in. We're getting it ready to move.
Expect delivery within [X–X business days].
Questions? Just reply to this email or reach us on WhatsApp.
— Team URBANOVA
```

---

### E.7 Contact / FAQ Copy

**Page header:**
```
NEED SOMETHING? WE GOT YOU.
Reach out and we'll get back to you fast.
```

**Starter FAQ questions:**
1. What sizes do you carry, and how do I pick the right one?
2. How long does delivery take?
3. What payment methods do you accept?
4. Can I exchange or return an item?
5. Do you deliver outside [city/region]?

*(Answers to be finalized once shipping/returns policy is confirmed by founder.)*

---

### E.8 Legal Page Intros

- **Shipping & Returns:** "We want you moving in your URBANOVA gear as fast as possible. Here's how delivery and returns work."
- **Privacy Policy:** "Your information stays yours. Here's exactly how we handle it."
- **Terms of Service:** "The fine print — straightforward, no surprises."

---

### E.9 Social Media Caption Bank

| Context | Copy |
|---|---|
| New drop | "New drop, new nova. Link in bio — don't sleep on this one." |
| Product feature | "City nights were made for this. The Nova Hoodie is live now." |
| Lifestyle | "The city doesn't wait. Neither do you. That's the URBANOVA energy — always rising." |
| Restock | "Back by popular demand. [Item name] just restocked — grab yours before it's gone again." |

---

## PART F — E-COMMERCE OPERATIONS

### F.1 Payment Methods

- **Primary:** Mobile money — MTN MoMo, Vodafone Cash, AirtelTigo Money
- **Secondary:** Card payments
- **Gateway:** Paystack (licensed, secure)
- Payment captured before order is confirmed and sent to fulfillment — never ship on a promise to pay

---

### F.2 Order Lifecycle / Status Enum

| Status | Meaning |
|---|---|
| `pending_payment` | Order created, awaiting payment confirmation |
| `paid` | Payment confirmed by Paystack webhook |
| `packed` | Items picked, quality-checked, and packaged |
| `shipped` | Handed to rider/courier, dispatch confirmation sent |
| `delivered` | Customer received order |
| `cancelled` | Order cancelled before dispatch |
| `returned` | Item returned after delivery |

---

### F.3 Shipping & Delivery

**Fulfillment options (founder to decide):**
- Self-delivery (founder/team manages riders directly)
- Courier partner (outsource fulfillment)

**Timelines (placeholder — confirm with founder):**
- Same city: 1–2 business days
- Other regions: 3–5 business days

**Policy:** Always under-promise on delivery time slightly.

---

### F.4 Delivery Zones & Fees

*(Placeholder — to be filled in once founder confirms coverage areas and courier/rider costs)*

Build as editable records in the `delivery_zones` table, manageable from the admin panel. Consider free delivery above GHS 300 as a promotional incentive.

---

### F.5 Returns & Exchanges Policy

> **Superseded (Oct 2026):** the founder-approved Policies document (Part H, `docs/approved/URBANOVA_Policies_Terms.md` s.6) replaces the 7-day exchange-only rule below with a 14-day right to cancel and refund, as required by Ghana's Electronic Transactions Act 2008 (Act 772, s.49). The table below is kept for history only; the published Shipping & Returns page follows Part H.

| Rule | Detail |
|---|---|
| Exchange window | 7 days from delivery (size exchanges only — not full refunds) |
| Condition | Unworn, unwashed, tags attached |
| Return shipping | To be decided by founder |
| Final sale items | No returns/exchanges — must be stated clearly on product page |
| Damaged/wrong items | Replacement or full refund at no cost; request photo via WhatsApp first |

---

### F.6 Order Fulfillment Workflow

1. Order placed and payment confirmed on website
2. Founder/team receives order notification (email + admin dashboard)
3. Item(s) picked from inventory and quality-checked
4. Items packed with branded packaging/inserts (e.g., thank-you card)
5. Order handed to rider/courier; dispatch confirmation sent to customer
6. Customer receives order; status updated to `delivered`
7. Optional: follow-up message asking for feedback

---

### F.7 Customer Service

**Channels:**
- WhatsApp (primary — fast, familiar, low friction for Ghanaian market)
- Email (formal inquiries, written records)
- Contact form on website (routes to email or WhatsApp)

**Response time target:** All inquiries within 24 hours; aim for same-day during business hours.

---

### F.8 Risk & Fraud Basics

- Never release goods until payment confirmed by Paystack webhook
- Watch for unusually large/repeated orders from new accounts; verify by WhatsApp/phone if suspicious
- Keep a log of orders and payment references for dispute resolution

---

## APPENDIX — Open Decisions (Founder Action Required)

These items are unresolved and will block final launch. Build them as configurable fields:

| Item | Where to configure |
|---|---|
| Final logo/visual assets | Replace placeholder in `/public` |
| Confirmed product pricing | Admin → Products |
| Delivery zones and fees | Admin → Delivery Zones |
| Fulfillment approach (self vs. courier) | Operations policy only |
| Returns/exchange policy details | Admin → Settings / Legal page |
| Color palette hex values | `tailwind.config.ts` design tokens |
| Payment gateway transaction fees | Inform pricing strategy |
| Brand contact channels (WhatsApp, email) | `.env.local` / Admin → Settings |
| Primary tagline confirmation | Content copy |
| About page founder note | About page CMS field |

---

## PART G — WEBSITE REQUIREMENTS (PRD)

### G.1 Project Overview

URBANOVA is a new streetwear and lifestyle clothing brand built around the identity of a bold, imagined city. This document defines the requirements for the e-commerce website — the digital storefront where URBANOVA will sell branded apparel directly to customers.

**Vision:** To become the go-to streetwear label for young people who see the city as their playground — a brand and website that feel as bold, current, and unapologetic as the people who wear it.

---

### G.2 Brand & Target Audience

**Target audience:**
- Primary: young adults (~16–30) who identify with bold, confident self-expression through fashion
- Secondary: streetwear collectors and local fashion-forward youth culture communities
- Psychographics: values individuality, confidence, ambition; active on Instagram, TikTok, Snapchat; price-conscious but willing to pay for identity and quality

**Positioning:** For young people who refuse to blend in, URBANOVA is the streetwear brand that turns city energy into wearable confidence.

---

### G.3 Business Goals

- Launch a functional online store to sell URBANOVA-branded apparel directly to customers
- Establish URBANOVA as a recognizable lifestyle brand, not just a clothing seller
- Build a repeatable channel for product drops and promotions
- Capture customer data (email/phone) for remarketing and community building

---

### G.4 Scope

**Phase 1 (in scope):**
- Public-facing e-commerce website (browsing, cart, checkout)
- Product catalog with size/color variants
- Secure online payment (mobile money + card)
- Order confirmation (email) and basic order status
- Brand pages: Home, Shop, About, Contact
- Mobile-responsive design (majority of users will be on phones)
- Basic admin: add/edit products, view/manage orders

**Out of scope for Phase 1:**
- Customer loyalty/rewards program
- Multi-currency / international shipping
- Native mobile app
- Live chat support
- User-generated content / community features (reviews, UGC gallery)

---

### G.5 Functional Requirements

**Customer-facing:**
- Browse full product catalog and filter by category, size, color, price
- View product detail (images, description, size guide, size/color selector, stock status)
- Add to cart, update quantities, remove items
- Guest checkout with mobile money or card payment via Paystack
- Order confirmation on-screen and by email
- Contact form and FAQ

**Admin:**
- Add, edit, remove products (name, price, images, description, sizes, colors, stock)
- View and manage orders (status: pending_payment → paid → packed → shipped → delivered → cancelled)
- Basic sales overview (order count, revenue)
- Manage stock counts per size/color
- Feature/unfeature products on the homepage (for drops and promotions)

---

### G.6 Non-Functional Requirements

- Mobile-first responsive design
- Fast load times — especially on mobile connections
- Secure payment handling (Paystack; never handle card data directly)
- HTTPS enforced (Vercel provides this)
- Rate-limiting on checkout and login endpoints
- All admin routes protected by authentication middleware

---

### G.7 E-commerce & Operations Requirements

**Payments:** MTN Mobile Money, Vodafone Cash, AirtelTigo Money, Visa/Mastercard via Paystack — all payments through the gateway; no manual card handling.

**Shipping:** Define delivery zones and costs (to be finalized with founder). Provide estimated timelines at checkout.

**Returns:** Clear policy visible before purchase. See Part F for policy framework.

**Inventory:** Track stock per size/color to prevent overselling. Size guide on every PDP.

---

### G.8 Open Questions (Founder Input Required)

- Final logo, color palette, typography (see Appendix)
- Initial product line-up: how many designs/colors/sizes at launch?
- Pricing per item (assumed GHS — confirm)
- Delivery zones and shipping costs
- Who will manage day-to-day order fulfillment after launch?
- Social media handles / domain name availability for "URBANOVA"

---

## PART H — MOVEMENT, VISION & POLICIES (founder-approved additions, Oct 2026)

> Four documents were approved by the founder in October 2026 and extend this reference. Full text is kept in `docs/approved/`. Where they conflict with Parts A–G, **Part H wins**.

| Source document | Path | Used for |
|---|---|---|
| Vision & Mission v1.0 | `docs/approved/URBANOVA_Vision_Mission.md` | `/vision-mission` page |
| The URBANOVA Movement v1.0 | `docs/approved/URBANOVA_Movement.md` | `/movement` page (programs, partners, funding, roadmap) |
| Foundation Phases v1.0 | `docs/approved/URBANOVA_Foundation_Phases.md` | Public "Road Ahead" summary on `/movement`. **Internal plan — budget, risks, team roles, gates and 30-day checklist are not published.** |
| Policies and Terms & Conditions v1.0 | `docs/approved/URBANOVA_Policies_Terms.md` | `/legal/[slug]` pages (below) |

### H.1 New and changed pages (extends Part D)

| Route | Content |
|---|---|
| `/vision-mission` | Vision, mission, values, who we serve, commitments, manifesto |
| `/movement` | Two arms, five programs, showcase & fairness, partners, funding, road ahead, movement policy links. Anchors: `#partners`, `#policies` |
| `/legal/terms-of-service` | Terms & Conditions of Sale (Policies s.2) |
| `/legal/privacy-policy` | Privacy Policy (s.3) |
| `/legal/shipping-returns` | Shipping & Delivery (s.5) + Returns, Exchanges & Refunds (s.6). Zones table is read live from `delivery_zones` |
| `/legal/website-terms` | Website Terms of Use (s.7) |
| `/legal/cookie-policy` | Cookie Policy (s.4); lists marketing cookies only when an ad pixel is configured |
| `/legal/membership-terms`, `spotlight-consent`, `partner-sponsorship`, `donations-fundraising`, `starter-fund`, `safeguarding`, `community-code` | Movement policies (s.8, 9, 11–15) |
| `/legal/complaints` | Complaints Policy (s.17) |

Header gains **Movement**; footer gains Vision & Mission, The Movement, Partner With Us, Terms & Conditions, Website Terms, Complaints, Movement Policies.

### H.2 Business rules that change

- **Returns:** 14-day right to cancel and refund for any reason (customer pays direct return cost unless faulty/wrong); faulty/wrong items always free; refunds to original payment method. Replaces F.5.
- **Delivery:** orders delivered within 14 days unless a longer time is clearly agreed (pre-orders).
- **Marketing consent** must be opt-in (unticked) with date and source stored.

### H.3 Configurable fields (do not hardcode)

Business identity (name, registration no., TIN, address, digital address, phone, email, Movement entity name, DPC number, Safeguarding Lead, effective date) is read from environment variables — see `.env.example`. Numeric policy parameters (dispatch time, report windows, refund time, retention years, etc.) are the suggested bracketed values from the Policies document, held in `lib/site-config.ts` until the founder and a Ghana-qualified lawyer confirm them. Unset identity fields are omitted from the public pages, never shown as placeholders.

### H.3a Ad pixels, cookie banner and installable app (Oct 2026, founder request)

- **Retargeting pixels:** Meta and TikTok pixels are configured by `META_PIXEL_ID` / `TIKTOK_PIXEL_ID`. They load only after the visitor taps **Accept** in the cookie banner (Policies s.4, Act 843); the choice is stored in the visitor's browser and can be changed via **Cookie settings** in the footer. With no IDs set there is no banner and no tracking.
- **Installable app:** `app/manifest.ts` + `public/icons/*` make the storefront installable ("Add to Home Screen"); the footer shows a one-tap install button on Android/Chrome and instructions on iPhone. Icons are a placeholder "U" mark until the final logo is confirmed (A.10 #1).
- **Copyright:** footer notice based on Website Terms s.7.1, linking to `/legal/website-terms`.

### H.4 Deliberately not published yet

| Item | Why |
|---|---|
| Nova Market Seller Terms (s.10) | Document says publish only when the marketplace launches; needs specific legal review |
| Conflict of Interest, Fraud & Financial Controls (s.16, 18) | Internal policies |
| Movement funding split (50/25/15/10), partner tier amounts, Year 1/3 targets, budget | Marked as placeholders by the source documents |
| Spotlight, Join the Movement, Donate, Annual Report pages | Need schema/API not defined in A.4 and the safeguarding/donation gates in the Foundation Phases plan |

### H.5 Open items (founder action required)

1. Lawyer (Ghana) review of all policies before the effective date is set — source marks them "Draft for legal review, not legal advice".
2. Confirm every bracketed number in `lib/site-config.ts`.
3. Fill the business identity env vars.
4. Confirm payment-method names (Policies s.2.6 names MTN Mobile Money, Telecel Cash, AT Money, Visa/Mastercard; this reference still says Vodafone Cash / AirtelTigo Money).
5. Register with the Data Protection Commission and supply the number.
6. Appoint a Safeguarding Lead and deputy before any under-18 joins.
7. Update the checkout and operations to match Part H (checkout T&C checkbox, unticked marketing checkbox, return request flow, cookie banner, customer data export/delete) — tracked in TASKS.md.

---

*End of URBANOVA Complete Project Reference — v1.0*
