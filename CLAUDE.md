# CLAUDE.md — URBANOVA Agent Constitution

This file governs all AI-assisted development on the URBANOVA e-commerce project.
All agents MUST follow these rules exactly.

---

## MANDATORY PRE-CODING CHECKLIST

**Before writing a single line of code, an agent MUST:**

1. **Read `docs/URBANOVA_REFERENCE.md` in full.**
   - This file is the single source of truth for every product, design, copy, and operations decision.
   - Do not invent brand copy, schema fields, SKU formats, color names, or page layouts — everything is specified there.
   - If something is not in the reference doc, flag it to the founder before proceeding.

2. **Identify which build phase you are implementing** (Reference doc Part A, Section A.7).
   - Confirm the phase's data model/schema is complete before building any UI for that phase.
   - Never start a phase's UI work before its API and schema exist.

3. **Identify which page or feature you are building** (Reference doc Part D — Sitemap & Page Specs).
   - Cross-reference the required content sections and CTAs for that page.
   - Cross-reference the copy from Part E — Content & Copywriting Plan. Use exact draft copy; do not improvise brand language.

4. **Confirm the relevant schema tables** (Reference doc Part A, Section A.4).
   - All database work must use the defined table names, column names, and SKU format (`URB-[CATEGORY]-[STYLE]-[COLOR]-[SIZE]`).
   - All prices stored as integers (pesewas) internally; display in GHS only.

5. **Check Open Items** (Reference doc Appendix).
   - If a feature depends on an unresolved open item (e.g., exact delivery fees, pricing, logo), build it as a configurable/editable field — never hardcode a placeholder as a final value.

**This checklist is not optional. If you skip it and an implementation conflicts with the reference doc, your work will be rejected and must be redone.**

---

## Project Overview

URBANOVA is a mobile-first e-commerce website for a Ghanaian streetwear brand. Customers browse products, add to cart, check out with mobile money or card (Paystack), and receive order confirmation. A lightweight admin area manages products and orders.

**All project requirements are in `docs/URBANOVA_REFERENCE.md`.** This CLAUDE.md file contains agent policy only — not product requirements.

---

## Branch Policy

- Work on feature branches (`feature/<descriptive-name>`) created from `main`
- Every push MUST have a corresponding Pull Request
- Direct commits to `main` are forbidden
- Commit message format: `feat:`, `fix:`, `chore:`, `refactor:` — descriptive, not generic

---

## Tech Stack (non-negotiable)

| Layer | Choice |
|---|---|
| Framework | Next.js App Router + TypeScript (strict mode) |
| Database | Vercel Postgres + Prisma ORM |
| Styling | Tailwind CSS — design tokens from Brand Brief (Part B), never hardcoded |
| Auth (admin) | Auth.js / NextAuth — credential-based only |
| Payments | Paystack — hosted checkout or inline popup only |
| Images | Vercel Blob |
| Email | Resend |
| Hosting | Vercel — no additional infrastructure |

---

## Coding Standards

- **TypeScript strict mode** — no `any` unless absolutely unavoidable (comment why if used)
- **Validate all external input with Zod** before touching the database
- **No raw stack traces to the client** — handle errors explicitly, return typed responses
- **Prices as integers (pesewas)** internally; format to GHS only at display time
- **No mock data** — use real backend data or seed data from the Prisma schema
- **Componentize by feature** — e.g., `ProductCard`, `SizeSelector`, `CartLineItem`; not generic dumping grounds
- **Admin code must never leak into the public bundle** — keep storefront and admin paths strictly separated

---

## Security Rules

- HTTPS enforced by Vercel — do not disable it
- Mark orders `paid` ONLY after Paystack webhook signature is verified — never trust client redirects
- Store only the Paystack payment reference — never store card numbers, CVVs, or mobile money PINs
- Admin routes protected by authentication middleware on every API route (not just the UI)
- Rate-limit the checkout and login endpoints

---

## Documentation Protocol

- Every meaningful code change must be documented in `STATUS.md` (reverse-chronological)
- `TASKS.md` tracks task progress — a task is only `[x]` when verified working, not just coded

---

## Hard Rules

| Rule | Detail |
|---|---|
| No invented brand copy | All copy comes from Reference doc Part E — Content & Copywriting Plan |
| No invented schema | All schema comes from Reference doc Part A, Section A.4 |
| No invented page layouts | All page specs come from Reference doc Part D — Sitemap & Page Specs |
| No hardcoded open items | Every unresolved founder decision must be a configurable/editable field |
| Schema before UI | Never build a page before its data model and API exist |
| Read the reference first | No exceptions — the checklist at the top of this file is mandatory |
