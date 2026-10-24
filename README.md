# EVORN — jewellery store

Next.js 16 storefront with a customer account area and an admin panel.
Data lives in **MongoDB** (Mongoose); product photos and payment receipts live in **Cloudinary**.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill it in (MongoDB URI, Cloudinary keys, admin password, session secret).
3. `node --env-file=.env scripts/seed.mjs` adds sample categories, materials and products.
4. `npm run dev`, then open http://localhost:3000 (admin: `/admin/login`).

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
scripts/seed.mjs          Sample data
```

## Payments

- **Cash on delivery**: nothing to verify.
- **Bank transfer**: the admin lists bank accounts under *Admin → Bank accounts*. At checkout the customer picks bank
  transfer, places the order, transfers the money and uploads the receipt on the order page. The receipt is stored as a
  private (authenticated) Cloudinary image. The admin opens the order, checks the receipt, then either confirms the
  payment (the order becomes CONFIRMED) or rejects it with a reason so the customer can upload a new one.

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

## Deploying to Vercel

Set the variables from `.env.example` in the project settings. Payment receipts go through a server action, so they are
limited to 3.5 MB (Vercel caps request bodies at 4.5 MB). `SESSION_SECRET` is required in production.
