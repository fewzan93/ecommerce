# ShopVerse — Full-Featured MERN Ecommerce App

A production-style ecommerce platform with customer storefront + admin dashboard, inspired by Amazon/eBay.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite 8, React Router v7, Redux Toolkit + RTK Query, redux-persist, Tailwind CSS v4, React Hook Form, React Toastify, recharts |
| Backend | Node.js + Express 5, MongoDB + Mongoose, JWT auth (httpOnly cookie), Stripe Checkout + Webhooks, Nodemailer |
| Deploy | Single Node service (Express serves the built client) — Render / Railway / Fly.io, MongoDB Atlas |

## Getting Started

```bash
npm install          # installs all workspaces
cp server/.env.example server/.env   # then fill in values
npm run seed         # seed database with demo products + admin account
npm run dev          # runs API (:5000) + client (:5173) together
```

Demo accounts (seeded):

- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`

### Stripe payments (test mode)

1. Create test keys at https://dashboard.stripe.com/test/apikeys
2. Add `STRIPE_SECRET_KEY` to `server/.env`
3. To receive payment confirmations locally, install the Stripe CLI and run:
   ```bash
   stripe listen --forward-to localhost:5000/api/orders/webhook
   ```
4. Paste the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET`
5. Checkout with the test card **4242 4242 4242 4242** (any future date/CVC)

## Scripts

- `npm run dev` — API + client concurrently
- `npm run dev:server` / `npm run dev:client` — individually
- `npm run build` — production build of client (into `client/dist`)
- `npm run start` — run the API in production (also serves the built client)
- `npm run seed` — seed database

## Environment Variables (`server/.env`)

| Var | Required | Purpose |
|---|---|---|
| `PORT` | no (default 5000) | API port |
| `MONGODB_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Signing auth tokens |
| `CLIENT_URL` | yes | CORS origin + Stripe success URL (e.g. `http://localhost:5173`) |
| `STRIPE_SECRET_KEY` | yes | Stripe server key |
| `STRIPE_WEBHOOK_SECRET` | yes* | Webhook signature verification (required for payment events) |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` | no | SMTP for order/verification emails |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | no | Image uploads to Cloudinary (admin panel) |
| `PRESET_NAME` | no | Optional Cloudinary upload preset applied to admin uploads |

## Deployment

The server serves the built client in production, so it deploys as a **single Node service**:

1. Set `NODE_ENV=production`, `PORT=10000` (Render default), and all env vars above.
2. Build command: `npm install && npm run build`
3. Start command: `npm run start`
4. Run `npm run seed` once (Render Shell / Railway shell) to create demo data and the admin account.
5. Point `CLIENT_URL` at your live domain, and re-create the Stripe webhook for that domain (endpoint: `/api/orders/webhook`).

Notes:

- CORS + cookies: keep the app on one origin (client + API same domain) so the auth cookie works without extra CORS config. If you split them, set `CLIENT_URL` accordingly and enable `sameSite: none` in the cookie settings.
- Render free tier: use MongoDB Atlas free cluster; webhook needs a public URL (Stripe CLI can't reach localhost in prod).
- The `express.raw` Stripe webhook middleware runs before JSON parsing in `server/app.js` — do not reorder.

## Project Structure

```
├── client/            # React frontend
│   └── src/
│       ├── api/       # RTK Query API slices
│       ├── features/  # Redux slices (auth, cart, wishlist)
│       ├── components/
│       ├── pages/     # customer pages
│       ├── admin/     # admin dashboard
│       └── store.js
└── server/            # Express API
    ├── config/        # db connection
    ├── models/        # Mongoose schemas
    ├── controllers/
    ├── routes/
    ├── middleware/
    ├── utils/
    └── seed/
```

## Roadmap

1. ✅ Scaffolding (monorepo, Vite+Tailwind, Express, Mongo config)
2. ✅ Backend core (models, auth, product/category APIs, seed)
3. ✅ Storefront (layout, shop w/ filters, product detail)
4. ✅ Cart, wishlist, checkout, Stripe webhooks
5. ✅ Orders (history, status timeline, emails)
6. ✅ Admin panel (dashboard, product/order/user/coupon/review management)
7. ✅ Polish (About/Contact/FAQ, SEO, production serving, deploy-ready)