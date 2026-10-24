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
    admin/                auth, orders (status, verify/reject payment), products, categories, materials, bank-accounts, settings
    store/                account, checkout, payment (receipt upload)
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

## Deploying to Vercel

Set the variables from `.env.example` in the project settings. Uploads go through server actions, so images are limited
to 3.5 MB (Vercel caps request bodies at 4.5 MB).
