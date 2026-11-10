# Partner websites: setup guide

Every live partner gets their own website. It shows their logo, their name in the header, only their products, and their own About page. Checkout and payments run through URBANOVA underneath. The address can be either or both of these:

1. **Free address:** `their-shop.urbanova.com`, under URBANOVA's own domain. It works as soon as the partner is live.
2. **Their own domain:** for example `kumasidrip.com`, if the partner buys one.

Everything stays on the same Vercel project (`urbanova`). There's no separate site per partner.

---

## One-time setup (URBANOVA)

### 1. URBANOVA's domain on Vercel
Free addresses need a "wildcard" domain (`*.urbanova.com`). Vercel can only issue wildcard certificates when the domain uses **Vercel's nameservers**.

1. In Vercel, open **urbanova → Settings → Domains** and add `urbanova.com`. Your real domain may be different; use whatever URBANOVA owns.
2. Add `*.urbanova.com` there too.
3. Where the domain was bought, change its **nameservers** to the two Vercel shows (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`).
   - Any email records (MX) for the domain must be re-added in Vercel's DNS before switching. Otherwise email on that domain stops.
4. Wait until Vercel shows green ticks. This takes minutes to a few hours.

### 2. Settings
In **Vercel → urbanova → Settings → Environment Variables (Production)**:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | The main site address, e.g. `https://urbanova.com` |
| `PARTNER_ROOT_DOMAIN` | `urbanova.com` |
| `MAIN_SITE_HOSTS` | *(only if the main site has extra domains)* e.g. `urbanova.com.gh` |

Then go to **Deployments → latest → ⋯ → Redeploy**.

> Important: any domain added to this Vercel project that isn't listed above is treated as a **partner's** website. If the main site has a second domain, put it in `MAIN_SITE_HOSTS`. Otherwise that domain shows "not found".

---

## For each partner

**Free address:** nothing to do. When the partner is **Live**, `their-page-address.urbanova.com` works, using the "Page address" set in Admin → Partners. Admin and the partner's dashboard both show the link.

**Their own .com:**
1. The partner buys the domain, e.g. from Namecheap, GoDaddy or Truehost Ghana. It costs roughly GHS 150–250 a year.
2. In **Admin → Partners → (partner) → Website**, type the domain (e.g. `kumasidrip.com`) and save.
3. In **Vercel → urbanova → Settings → Domains**, add `kumasidrip.com` and `www.kumasidrip.com`.
4. The partner, or whoever manages their domain, adds the DNS records Vercel shows. Usually that's:
   - `A` record, name `@`, value `76.76.21.21`
   - `CNAME` record, name `www`, value `cname.vercel-dns.com`
5. Vercel shows a green tick when it's connected, usually within a few hours.

Once connected, search engines are pointed at the partner's own domain (canonical links and sitemap), so the free address doesn't compete with it.

---

## Getting found on Google
- Each partner site has its own `robots.txt` and `sitemap.xml`, with page titles and descriptions taken from their name and tagline.
- New sites usually appear in Google within days to a few weeks.
- To speed it up, the partner (or URBANOVA) can add the domain in **Google Search Console** (search.google.com/search-console), verify it with a DNS record, and submit `https://their-domain/sitemap.xml`.
- The best boost is sharing the link: WhatsApp status, Instagram/TikTok bio, Google Business Profile.

---

## What lives where
- **On the partner's address:** home, product pages, cart, checkout, order confirmation, About/Contact.
- **On the main URBANOVA site:**
  - partner and admin dashboards (`/partner`, `/admin`)
  - policies (`/legal/...`)
  - delivery tracking
  
  Visitors to those addresses on a partner domain are sent to the main site.
- **Bags are separate per address:** a bag on `kumasidrip.com` only holds that shop's items.
- **Who receives payment:**
  - Stockists: the customer pays the stockist directly.
  - Nova Market partners: the customer pays URBANOVA, as on the main site.
- If a partner is suspended or set back to pending, their address shows "not found" until they're live again.

## Not included yet
- The browser-tab icon and "Add to home screen" name still use URBANOVA's icon on partner sites.
- Domains have to be added in Vercel by hand. Automatic adding needs a Vercel API token and can be built later.
- The Vercel **Hobby** plan is for non-commercial use. A live shop, especially one serving partners, should be on **Vercel Pro**.
