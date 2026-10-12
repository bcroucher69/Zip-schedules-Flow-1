# ZipSchedules × Altametrics purchase flow — v3 flow, v10 (Plum POS hardware with product photos)

## What changed in v10
- **Real Plum product photos** (supplied) in `assets/img/hardware/`: POS terminal, handheld, PAX A35, kiosk,
  receipt printer, cash drawer, scanner and the Tunes device. Photos sit on white, blended into the card.
- **Two new items:** **PAX A35 Payment Terminal** (new **Payments** filter) and **Zip Tunes Player**
  (new **Guest experience** filter). Confirm the Tunes Player's name and description with Plum POS.
- **Plum KDS** and **Plum Time Clock** still use illustrations; add their photos in `HARDWARE` (`image`, `photo: true`).
- Hardware-only carts no longer show "$0.00/mo" rows in the order summary.


## What changed in v9 — Plum POS hardware

- **Products page** now has a **Plum POS hardware** section below the apps: POS Terminal, Handheld,
  Self-Service Kiosk, KDS, Receipt Printer, Cash Drawer, Scanner and Time Clock. Names, descriptions and
  specs follow the product pages on plumpos.com.
- **Filters:** a **Hardware** tab (shows hardware only) plus type chips with counts: All, Counter & POS,
  Mobile & self-order, Kitchen, Accessories, Time & attendance. Search covers apps and hardware.
- **Quantity:** **Add** turns into a − / qty / + stepper (typed quantities 1–99 work too; − at 1 removes).
  The same stepper is in the order summary.
- **Billing:** apps stay monthly; hardware is one-time. Every total shows both:
  Total due today = first month of apps + hardware, then the monthly amount. This flows through the email
  page, registration recap, the Forte authorize amount and the confirm page.
- **Data** lives in `HARDWARE` and `HARDWARE_GROUPS` in `app.js`; the cart stores `{ id: qty }` under
  `hardware`. `api.subscribe(ids, hardwareQty)` receives the hardware order.

### Before launch
- **Prices are placeholders.** plumpos.com doesn't publish hardware prices, so the cards show an "Est." tag.
  Set the real prices in `HARDWARE`, then set `HARDWARE_PRICES_FINAL = true` to remove the tag.
- **Images:** product photos for 8 devices are in place; KDS and Time Clock still need photos.
- **Shipping/tax** for hardware isn't calculated yet; add it to `store.totals()` when the rules are known.


## What changed in v8 (visual refresh of the v3 flow)

- **Same flow, same page names, same `app.js` integration points.** Only the UI changed.
- **Palette** from current Altametrics product screens: blue `#1554d1` for actions, navy `#0b1d3a` for app chrome
  and dark sections. Tokens are in the `v6` block near the end of `style.css`.
- **Landing (`index.html`)**: Altametrics dashboard and "AI Schedule Optimized" card in the hero, AI forecasting,
  workforce and scheduling-app images, and real customer testimonials with portraits (excerpts from altametrics.com).
- **Products**: customer-proof card (Nadia Lynn, Peet's) and customer logos under the order summary.
- **Email page (`signup.html`)**: refreshed cards, dashboard showcase ("One login for every Altametrics app"),
  Steve Cale testimonial and customer logos beside the cart.
- **Registration**: the approved mockup design (logo, "get started." accent, Your order with per-app icons,
  restaurant POS photo, Continue →). The inline Verify step keeps the same look.
- **Payment Modes**: navy app shell, rounded panel, realistic card visual (chip, contactless), illustrated empty
  state with its own **Add card** button.
- **Confirm**: same card visual; Subscription summary shows each app's artwork.
- **Manage**: plan card shows the app's artwork; new "Get more from Altametrics" cards (AI Forecasting,
  Food Safety & Checklists, Enterprise Reporting) with Altametrics imagery.
- **Images** load from altametrics.com / agcdn.altametrics.com; `assets/img/` holds the registration photo and
  logo mark cropped from the mockup (replace with high-resolution originals). If any image fails, a branded
  panel shows its description instead of a broken icon.
- **Checked** with no horizontal scroll on every page at 320–2560 px.


Static HTML/CSS/JS, no framework or build step. Open `index.html` and click **Buy Now** to walk the whole flow.

## Flow

| # | Page | Screen(s) from the design | Next |
|---|------|---------------------------|------|
| 1 | `index.html` | Landing | **Buy Now** adds ZipSchedules → `products.html` |
| 2 | `products.html` | Add more apps + order summary | **Continue to checkout** → `signup.html` |
| 3 | `signup.html` | Email + "Your cart" (replaces the old email popup) | **Continue** → `registration.html` |
| 4 | `registration.html` | Account details → Verify Your Account (inline) | **Verify** → `payment-modes.html` |
| 5 | `payment-modes.html` | In-app Payment Modes (empty state + "Your payment detail is not updated" banner) | **Add** opens Forte checkout |
| 6 | (Forte checkout) | Payment method → Billing information → Authorize | Card saved → `confirm.html` |
| 7 | `confirm.html` | Payment Method: card details + **Confirm**; "The product is already purchased" toast | Payment Message → **Ok** → `manage.html` |
| 8 | `manage.html` | Manage (app): plan card with **Unsubscribe** | Unsubscribe confirm → Payment Message |

Preview in-app pages directly:
`payment-modes.html?demo=1` (account + cart, no card) · `confirm.html?demo=card` (card on file) ·
`confirm.html?demo=card&already=1` (already-purchased toast) · `payment-modes.html?edit=1` (opens checkout).

## Files

```
index.html, signup.html, products.html, registration.html      public / funnel pages
payment-modes.html, confirm.html, manage.html                   in-app pages (My Apps shell)
assets/css/style.css    tokens at the top; one section per page; v3 sections at the end
assets/js/app.js        state, catalog, validation, Forte adapter, API stubs
```

## Where to connect the backend (assets/js/app.js)

- **`api.*`** — `checkEmail`, `registerAccount`, `sendVerificationCode`, `verifyCode`, `saveCard`,
  `subscribe` (return `{ ok:false, code:'ALREADY_PURCHASED' }` to show the toast), `unsubscribe`.
- **`payments.open({ amount, onSuccess })`** — the Forte checkout adapter (see below).
- **`CATALOG`** and **`PLANS`** — products and Manage-page plan tiers.
- **`store`** — flow state in `sessionStorage` (`zs_flow_v3`). Card numbers and CVV are never stored;
  only the Forte token, brand, last 4, expiry and billing address.

### Forte checkout — important
The three modals (Payment method → Billing information → Authorize, with the dark
"Powered by CSG Forte Payments, Inc." bar) are **Forte's hosted checkout UI**. In production Forte renders
them, not your page. They're rebuilt in `payment-modes.html` only so the flow can be demoed and QA'd.
To go live, replace the mock inside `payments.open` with Forte's checkout launch and call
`onSuccess({ token, brand, last4, expMonth, expYear, name, billing })` from Forte's success callback.
Keeping card entry inside Forte is what keeps you out of PCI DSS SAQ D scope.

## Decisions I made (change if needed)

1. **Order of screens 2–3.** Products first, then the email page (Buy Now → products → checkout → email →
   registration). The email page's cart also has **Add more apps**, which returns to products.
2. **One in-app shell.** The designs use two different app headers (dark "My Apps" bar vs an "ALta Growth"
   nav on Manage). All in-app pages use the dark "My Apps" bar, which appears on most screens.
3. **Subscription summary on the confirm page.** The design asks the customer to confirm without showing
   what they're buying or the amount. I added a small summary (apps + total) inside Card Details.
4. **Payment Message wording.** The design's "subscribed/unsubscribed" is split into the two real cases,
   keeping the design's phrasing.
5. **Unsubscribe** asks for confirmation first (the design goes straight to the message).
6. **Manage plan grid.** The design reserves slots for "Standard" and "51+ Employees" tiers with no content;
   only "Professional" renders. Add tiers in `PLANS`. Its price uses the app's catalog price, not the
   design's "55", which didn't match the cart.

## Open questions

- **Merchant name** in the Forte header: the designs show both "HUBWORKS, LLC" and "Altametrics LLC"
  (`MERCHANT_NAME`). Forte shows whatever is configured on the merchant account.
- **Authorization text** says "one-time electronic payment", but the charges are monthly. Confirm with legal/Forte.
- **"Adding credit card info will not initiate your billing"** vs the Authorize step showing the cart amount —
  confirm whether Authorize is a $0 card verification or a real charge.
- **Phone numbers differ:** sign-up page shows 800-993-8756 (from the design); funnel header shows
  (800) 676-1281 (from altametrics.com). Pick one.
- **Compliance seals** (PCI DSS / CompliAssure) are placeholders. Only display seals you're certified for,
  using the official artwork from your assessor or Forte.
- **Marketing consent** is bundled into the sign-up Continue button. Confirm this is acceptable in your markets.
- **Sample personal data** in the designs (name, email, phone, card) was replaced with neutral placeholders.
- Carry-overs from v2: completed product descriptions, Zip Tunes artwork, category mapping, customer logos.

## Breakpoints
1440 / 1280 desktop, 1024 tablet-landscape, 768 tablet, 375 mobile. Forte modals open as bottom sheets on phones.
Respects `prefers-reduced-motion`.
