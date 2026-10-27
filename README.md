# EVORN — Your Everyday Accessories

An online jewellery store: a Next.js 16 storefront with a customer account area and an admin panel.
Data lives in **MongoDB** (Mongoose); product photos and payment receipts live in **Cloudinary**.
The brand name and tagline are defined once in `STORE` in `src/lib/config.ts`.

## Features

**Storefront**
- Browse by category, search, and a home page with featured pieces
- Product pages with a multi-photo 3D carousel and full-screen zoom viewer
- Cart, checkout, and order confirmation pages
- Pay by cash on delivery or bank transfer (with receipt upload)
- Customer accounts: sign up, log in, edit details, view orders
- Verified-purchase reviews with star ratings, written from the product page or from the order

**Admin panel**
- Manage products (up to 8 photos each), categories and materials
- Process orders: update status, check bank-transfer receipts, confirm or reject payments
- Manage bank accounts, delivery settings, and customer reviews

**Notifications**
- The admin gets an email and an SMS when a new order is placed
- The customer gets an email and an SMS when their order is confirmed

**Stack:** Next.js 16 (App Router, server actions), React 19, Tailwind CSS 4, MongoDB with Mongoose, Cloudinary, Resend (email), SMSAPI.lk (SMS), JWT sessions (`jose`).

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill it in (MongoDB URI, Cloudinary keys, admin password, session secret; the email and SMS settings are optional, see Notifications).
3. `npm run dev`, then open http://localhost:3000 (admin: `/admin/login`).

## Project layout

```
src/
  app/                    Routes only (pages, layouts)
    (store)/              Public shop: home, shop, product, cart, checkout, order, login, signup, account
    admin/                Admin: login + (panel)/ orders, products, categories, materials, bank-accounts, settings
  actions/                Server actions (every mutation)
    admin/                auth, orders (status, verify/reject payment), products, categories, materials, bank-accounts, reviews, settings
    store/                account, checkout, payment (receipt upload), reviews
  components/
    store/                Storefront UI (Navbar, ProductCard, CheckoutForm, ReceiptUpload, ...)
    account/              Login/signup/profile forms
    admin/                Admin forms and panels
    ui/                   Small shared pieces (status badges)
  server/                 Server-only code
    db.ts                 Cached MongoDB connection
    models/               Mongoose schemas
    services/             Reads and business logic (catalog, orders, settings, bank-accounts, cloudinary)
    auth/                 Admin and customer sessions
    serialize.ts, types.ts
  lib/                    Shared by server and browser: config, formatting, cart store
```

## Payments

- **Cash on delivery**: nothing to verify.
- **Bank transfer**: the admin lists bank accounts under *Admin → Bank accounts*. At checkout the customer picks bank
  transfer, places the order, transfers the money and uploads the receipt on the order page. The receipt is stored as a
  private (authenticated) Cloudinary image. The admin opens the order, checks the receipt, then either confirms the
  payment (the order becomes CONFIRMED) or rejects it with a reason so the customer can upload a new one.

## Notifications

Two messages are sent, each by email (Resend) and SMS (SMSAPI.lk):

- **New order:** to the admin, using `ADMIN_NOTIFY_EMAIL` and `ADMIN_NOTIFY_PHONE`.
- **Order confirmed:** to the customer, using the email and phone given at checkout.

How it works:

- Messages are sent after the response is returned (`after()` from `next/server`), so checkout never waits on them and a
  failed email or SMS can never break an order.
- An order sends its confirmation only once: `confirmPendingOrder` in `src/server/services/confirm-order.ts` moves it from
  PENDING to CONFIRMED in a single update and returns the order only when it made the change. Re-selecting CONFIRMED does
  not send again.
- If a variable is missing, that channel is skipped silently. Errors returned by Resend or SMSAPI.lk, and network failures,
  are logged. A customer without an email only gets the SMS.
- Replies to the emails go to `EMAIL_REPLY_TO`, so it should be an inbox that is checked.
- Emails are sent from `EMAIL_FROM`, which must be on a domain verified in Resend. Until a domain is verified, Resend
  delivers only to the account's own email address.
- SMS uses the sender ID in `SMS_SENDER_ID`. Use the approved brand sender ID once the provider has approved it.
- Message text is built in `src/server/services/notifications.ts`; the senders are `email.ts` and `sms.ts` in the same folder.
- Receipt links and order-page links are never put in messages, because the order page is readable by anyone who has the
  order number.

## Security

- Admin and customer logins are **JWTs** (HS256, signed with `SESSION_SECRET`) in httpOnly, SameSite cookies. Each token is
  issued for one audience, so a customer token is never accepted as an admin token; expired, tampered and `alg: none` tokens
  are rejected. In production the app refuses to issue or check tokens if `SESSION_SECRET` is missing.
- Passwords are hashed with scrypt. Receipts are private Cloudinary images, shown to the admin through signed links.

## Product photos and reviews

- Each product can have up to 8 photos (the first is the cover). The admin uploads them straight from the browser to
  Cloudinary using a signature created by the server, so size is not limited by the 4.5 MB request cap.
- The product page shows them in a 3D depth carousel; clicking the centre photo opens a full-screen viewer that expands
  from the photo, with zoom, keyboard and swipe support.
- Customers can leave one review per product (1–5 stars and an optional note), and only once an order containing the
  product is **Delivered** (`REVIEWABLE_STATUSES` in `src/lib/config.ts`). The check runs on the server. The admin can
  remove reviews under *Admin → Reviews*.
- Reviews can be written in two places, both using the same `ReviewForm` and `submitReview` action:
  - the **product page**, and
  - the **order page** (`/order/[number]`): once an order is Delivered, its owner sees a "Rate your purchase" form for
    each item (existing reviews are pre-filled and can be updated). *Account → Your orders* shows a "to review" badge
    on delivered orders that still have unreviewed items.

## Roadmap

- Email reminder a few days after delivery, linking to the order's review section (the email helper in `src/server/services/email.ts` can be reused).

## Running with Docker

The image is stateless (data is in MongoDB Atlas and Cloudinary) and contains no secrets. They are read from the
environment when the container starts. `.env` is excluded from the build by `.dockerignore`.

```bash
cp .env.example .env        # fill it in
docker compose up -d --build
```

Or without Compose:

```bash
docker build -t evorn .
docker run -d --name evorn -p 3000:3000 --env-file .env --restart unless-stopped evorn
```

The site is then at http://localhost:3000. Variables read at run time: `MONGODB_URI`, `CLOUDINARY_URL` (or
`CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`), `ADMIN_PASSWORD`, `SESSION_SECRET`, and, for notifications, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, `ADMIN_NOTIFY_EMAIL`,
`ADMIN_NOTIFY_PHONE`, `SMS_API_URL`, `SMS_API_TOKEN`, `SMS_SENDER_ID`. There are no `NEXT_PUBLIC_` variables, so nothing needs to be set at build time.

To update: `git pull`, then `docker compose up -d --build`. Check the container with `docker compose ps`; the healthcheck
requests `/admin/login`, which does not need the database.

## Deploying to Vercel

Set the variables from `.env.example` in the project settings. Payment receipts go through a server action, so they are
limited to 3.5 MB (Vercel caps request bodies at 4.5 MB). `SESSION_SECRET` is required in production.
