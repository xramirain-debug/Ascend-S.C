# Ascend Senior Consulting — website

Marketing site, binder shop, and facility-intake wizard for
[ascendseniorconsulting.com](https://ascendseniorconsulting.com) — Minnesota
assisted living and home care consulting.

Built with Next.js (App Router) and plain CSS. No CMS, no heavy client
libraries — the intake wizard is hand-rolled React with localStorage
save-and-resume.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # serve the production build
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you have. Everything
degrades gracefully — with no variables set, the site runs and form
submissions are logged to the server console instead of emailed.

| Variable | What it does |
| --- | --- |
| `RESEND_API_KEY` | API key for the email provider (Resend). Without it, submissions are logged, not emailed. |
| `OWNER_EMAIL` | Inbox that receives all form submissions (contact, booking, orders, intakes). |
| `EMAIL_FROM` | From address on submission emails — must be a verified sender in your email provider. |
| `NEXT_PUBLIC_OWNER_EMAIL` | Email address displayed on the site (footer, contact page). |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL used in SEO metadata and the sitemap. |
| `NEXT_PUBLIC_SCHEDULER_URL` | Optional. An embeddable scheduler link — when set, the Book page shows a live calendar instead of the request form. |

## How the pieces fit

- **All form submissions** go through one handler: `src/app/api/submit/route.ts`.
  Contact, booking, order requests, and the facility intake all POST there;
  it applies a honeypot spam check, then emails the owner (or logs when no
  email key is configured).
- **The catalog lives in one file**: `src/data/catalog.ts`. Products, prices,
  bundles, section groupings, and the home-page featured items. Edit it and
  the shop grid, detail pages, order form, and sitemap all update. Each
  product's "What's customized / What we maintain" columns are marked `TODO`
  for the owner to fill in.
- **Checkout model**: this ships with an order-*request* flow (binders are
  populated to the facility, so orders start a conversation, not a card
  charge). Every product carries a stable `id` and numeric `price`, so Stripe
  Checkout can be swapped in later: map `id` → Stripe Price ID and replace
  the submit handler in `src/app/order/OrderForm.tsx` with a Checkout
  session redirect.
- **The intake wizard** (`/intake`) is schema-driven:
  `src/app/intake/intake-schema.ts` defines every step, field, and the
  conditional logic for which supplements appear (Emergency Preparedness,
  Survey Master, Customized Living, Kitchen, Dementia). Progress saves to
  localStorage; a review screen precedes submit; the visitor gets a
  printable/downloadable summary. **Privacy rule:** no field may ask for
  resident-identifiable information — resident questions are counts only.
  Keep it that way when editing the schema.
- **Site-wide contact details** (phone, owner email, service area, nav) are
  in `src/data/site.ts`.

## Content the owner still needs to supply

Search the repo for `TODO` — each spot is marked:

- **About page** (`src/app/about/page.tsx`): practice story paragraphs and
  the real headshot.
- **Product detail pages** (`src/data/catalog.ts`): per-product
  "What's customized to your facility / What we maintain" lists.
- **Logo**: `public/ascend-logo.png` is a generated placeholder wordmark.
  Replace the file with the real logo (keep the filename, ideally roughly
  the same wide aspect ratio) and header/footer pick it up automatically.
  `public/og.png` (social sharing image) and `src/app/icon.png` (favicon)
  are placeholders in the same style — replace in place.
- **Photography**: pages use styled `PhotoSlot` placeholders
  (`src/components/PhotoSlot.tsx`). Drop real photos into `public/` and
  replace each slot with a Next `<Image>`.

## Deploy notes

Any Node host that runs Next.js works:

1. Set the environment variables above in your hosting dashboard.
2. `npm run build` && `npm start` (most platforms detect Next.js and do
   this automatically).
3. Point DNS at the host; set `NEXT_PUBLIC_SITE_URL` to the final domain so
   the sitemap and OG tags emit correct URLs.
4. Verify the sending domain with the email provider so submission emails
   (`EMAIL_FROM`) deliver reliably, and set `OWNER_EMAIL` to the real inbox.

The API route (`/api/submit`) needs a server runtime — this project is not
a static export.
