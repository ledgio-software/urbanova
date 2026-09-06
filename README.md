# URBANOVA

Streetwear e-commerce website — built with Next.js, Vercel Postgres, Tailwind CSS, and Paystack.

## Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Database:** Vercel Postgres + Prisma ORM
- **Styling:** Tailwind CSS
- **Payments:** Paystack (mobile money + card)
- **Images:** Vercel Blob
- **Email:** Resend
- **Hosting:** Vercel

## Development

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

## Build Phases

1. Foundation — schema, seed data, Tailwind theme
2. Storefront — Home, Shop, Category, PDP, Cart
3. Checkout & Payments — Paystack integration, webhooks, order confirmation
4. Admin — product/order management
5. Remaining Pages & Polish — About, Contact, Legal, SEO
6. Testing & Launch
