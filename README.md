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
| `STRIPE_SECRET_KEY` | Enables card checkout. Without it the shop offers the order-request flow only. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for `/api/stripe/webhook`. Without it the webhook returns 503 and no payment emails are sent. |
| `INTAKE_TOKEN_SECRET` | Signs the tokenized facility-intake links emailed after payment. Generate with `openssl rand -base64 32`. |
| `ENABLE_STRIPE_TAX` | `true` turns on Stripe Tax. Default off — read the sales-tax note below first. |

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
- **Two ways to order, on purpose.** Card checkout (Stripe) and the
  order-request form both live in the shop. Many facilities pay by check,
  so the request path is never removed — it's the fallback whenever Stripe
  keys are absent, and a first-class option when they aren't.
- **Prices are never trusted from the browser.** The cart sends item *ids*
  only; `src/app/api/checkout/route.ts` looks every id up in the catalog and
  builds Stripe `price_data` server-side. Editing the catalog file changes
  what customers are charged — there is no separate Stripe product list to
  drift out of sync.
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

## Payment → intake, end to end

The loop the site is built around:

```
cart → Stripe Checkout → payment → webhook → two emails
                                      ↓
                         signed intake token (30-day)
                                      ↓
              /intake?token=…  pre-filled + scoped to the purchase
                                      ↓
                    submit → owner email tagged with the order
```

**The webhook is authoritative, not the success page.** If the customer
closes the tab the instant they pay, `checkout.session.completed` still
fires and both emails still go out. The success page
(`/order/confirmed`) is a courtesy: it retrieves the session server-side
and, if the webhook hasn't landed yet, shows a calm "finishing up" state
with a *Check again* button — never an error for someone who just paid.

**The intake token** (`src/lib/intake-token.ts`) is a signed, stateless
HMAC — no database needed. It carries the Stripe session id, the item
ids, the customer email, the facility name, and a 30-day expiry. The
wizard verifies it server-side and uses it to:

- pre-fill step 1 (facility name, contact email) — every field stays editable;
- show *only* the supplements the purchase calls for (bundles expand to
  their component binders first, via `expandItems` in the catalog);
- key `localStorage` progress per session id, so two facilities using one
  office computer never overwrite each other;
- tag the final submission with the order so the owner can match intake
  to purchase.

A tampered, wrong-secret, or expired link doesn't dead-end: it shows a
short "request a new link" form that emails the owner.

`/intake` with **no** token still works exactly as it did before — the
pre-purchase intake, minus prefill and scoping.

### Rotating `INTAKE_TOKEN_SECRET`

Rotating the secret invalidates every outstanding intake link (that's the
point — do it if a link is leaked). Anyone hitting an old link lands on
the "request a new link" form, so nobody is stranded:

1. Generate a new value: `openssl rand -base64 32`
2. Update `INTAKE_TOKEN_SECRET` in the host's environment and redeploy.
3. For any customer mid-intake, re-send a link. Their saved answers live in
   *their* browser keyed to the Stripe session id, so a fresh link for the
   same order restores their progress.

### Testing the whole loop locally

You need the Stripe CLI (`stripe login`) and test-mode keys.

1. Put test keys in `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_test_…
   INTAKE_TOKEN_SECRET=<openssl rand -base64 32>
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
2. Forward webhooks in a second terminal — it prints the signing secret:
   ```
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the printed `whsec_…` into `STRIPE_WEBHOOK_SECRET` and restart `npm run dev`.
3. Walk the loop:
   - Add a bundle at `/shop`, open `/cart`, click **Checkout**.
   - Pay with test card `4242 4242 4242 4242`, any future expiry, any CVC,
     any US address.
   - You land on `/order/confirmed` with the order summary and the
     **Start Your Facility Intake** button.
   - The `stripe listen` terminal shows `checkout.session.completed`, and
     the server console prints both emails (owner + customer) — with
     `RESEND_API_KEY` set they're delivered instead of logged.
   - Follow the intake link: step 1 is pre-filled and only the
     supplements for what you bought appear.
4. Worth testing deliberately:
   - **Close the tab right after paying.** Both emails still arrive; the
     link in them works.
   - **Cancel** on the Stripe page — you return to `/cart` with the cart intact.
   - **Tamper with the token** (change a character) — you get the
     "request a new link" page, not a broken wizard.
   - **Remove the Stripe keys** and restart — the shop still builds and
     serves the order-request flow.

### Minnesota sales tax — read before enabling

`ENABLE_STRIPE_TAX` ships **off**, and it should stay off until the
paperwork is done. Printed binders shipped to Minnesota facilities are
tangible goods, and **tangible goods are taxable in Minnesota** — this is
not a service exemption.

Before setting `ENABLE_STRIPE_TAX=true`:

1. Register for a Minnesota sales tax account with the Department of
   Revenue and get your permit.
2. In the Stripe dashboard, enable Stripe Tax, set the origin address,
   and register the Minnesota jurisdiction under Tax Settings.
3. Confirm the product tax code — the code is applied in
   `src/lib/stripe.ts` (`PHYSICAL_GOODS_TAX_CODE`, currently the general
   tangible-goods code). Adjust it there if your accountant advises a
   more specific code.
4. Flip the flag and run one test-mode purchase to a Minnesota address to
   confirm tax appears on the Checkout page.

Turning the flag on without steps 1–2 means Stripe either collects no tax
or collects tax you aren't registered to remit. Neither is where you want
to be. This is a summary for developers, not tax advice — confirm with
the owner's accountant.

### Optional database

Orders and intakes are emailed by default and that is a complete system of
record. `src/lib/store.ts` defines a `StorageAdapter` interface (plus the
in-memory default that also provides webhook idempotency) so a real
database can be added without touching the webhook or submit handlers —
implement the interface and return it from `getStore()`.

Note the honest limit of the in-memory default: processed session ids live
per server instance and reset on redeploy. That stops same-instance
webhook retries, which is the common case; worst case on a cold start is a
duplicate owner email, never a lost or double-charged order. A database
adapter upgrades this to true cross-instance idempotency.

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
5. **Register the live webhook.** In the Stripe dashboard (live mode), add
   an endpoint at `https://<your-domain>/api/stripe/webhook` subscribed to
   `checkout.session.completed`, then copy its signing secret into
   `STRIPE_WEBHOOK_SECRET` and redeploy. Without this, payments succeed but
   no order emails or intake links are sent.
6. Set `INTAKE_TOKEN_SECRET` to a long random value (`openssl rand -base64 32`).
   Keep it stable — changing it invalidates outstanding intake links.
7. Switch the Stripe keys from test to live only once you've walked the
   full loop in test mode.

The API routes (`/api/submit`, `/api/checkout`, `/api/stripe/webhook`) need
a server runtime — this project is not a static export.
