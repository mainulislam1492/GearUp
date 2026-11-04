# GearUp 🏋️

**Rent Sports & Outdoor Gear Instantly**

GearUp is a backend API for a sports and outdoor equipment rental platform. Customers browse gear, place rental orders, pay online and review gear after returning it. Providers (rental shops) manage their inventory and fulfil orders. Admins oversee the platform, manage users, moderate listings and manage categories.

**Live API:** https://gear-up-peach.vercel.app

---

## Roles

| Role | What they can do |
|------|------------------|
| **Customer** | Browse gear, place rental orders, pay (Stripe / SSLCommerz), view payment history, track order status, leave reviews, manage profile |
| **Provider** | Add, edit and remove gear, manage stock and availability, view incoming orders, confirm / mark picked up / mark returned |
| **Admin** | View all users, suspend or activate users, view all gear and rentals, hide or restore listings, manage categories |

Users choose **customer** or **provider** at registration. Admin accounts cannot be self-registered: they are created with the seed script.

---

## Tech Stack

- **Runtime:** Node.js, Express 5, TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** JWT (access + refresh tokens in HTTP-only cookies), bcryptjs
- **Payments:** Stripe Checkout, SSLCommerz
- **Bundler / hosting:** tsup, Vercel
- **Architecture:** MVC, one module per feature (route, controller, service, interface)

---

## Project Structure

```
GearUp/
├─ api/                    # tsup output (api/index.js), run by Vercel
├─ prisma/
│  ├─ schema/              # Prisma schema files (user, gear, rental, payment, review...)
│  └─ migrations/
├─ prisma.config.ts
├─ public/                 # placeholder required by Vercel
├─ src/
│  ├─ app.ts               # express app
│  ├─ config/              # environment config
│  ├─ lib/                 # prisma + stripe clients
│  ├─ middlewares/         # auth, globalErrorHandler, notFound
│  ├─ utils/               # catchAsync, sendResponse, jwt
│  ├─ scripts/
│  │  └─ seedAdmin.ts      # creates the admin account
│  └─ modules/
│     ├─ auth/             # login, refresh token, logout, change password
│     ├─ user/             # register, profile
│     ├─ category/         # public list, admin manage
│     ├─ gear/             # public browse + details
│     ├─ provider/         # gear CRUD, incoming orders, status updates
│     ├─ rental/           # customer orders
│     ├─ payment/          # Stripe + SSLCommerz
│     ├─ review/           # reviews after return
│     └─ admin/            # users, gear, rentals
├─ tsup.config.ts
└─ vercel.json
```

---

## Database

Main tables: **User**, **Profile**, **Category**, **GearItem**, **RentalOrder**, **RentalItem**, **Payment**, **Review**.

- `Profile` holds phone, address and provider shop details (one-to-one with `User`).
- `RentalItem` stores a price snapshot, so later price changes don't affect old orders.
- One order can have many `Payment` rows, so failed payments can be retried.
- A review is unique per customer, gear item and order.

---

## Getting Started

### 1. Install

```bash
git clone <your-repo-url>
cd GearUp
npm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/dbname

APP_URL=http://localhost:3000
SERVER_URL=http://localhost:5000

BCRYPT_SALT_ROUNDS=10
JWT_ACCESS_SECRET=your_long_random_access_secret
JWT_REFRESH_SECRET=your_long_random_refresh_secret
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

SSLCOMMERZ_STORE_ID=your_sandbox_store_id
SSLCOMMERZ_STORE_PASSWORD=your_sandbox_store_password
SSLCOMMERZ_IS_LIVE=false

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeThisPassword
```

| Variable | Purpose |
|----------|---------|
| `APP_URL` | Frontend URL: used for CORS and payment redirects |
| `SERVER_URL` | Backend URL: used for SSLCommerz callbacks |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used only by the admin seed script (local) |

Generate a secret with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Database

```bash
npx prisma migrate dev --name init
```

### 4. Create the admin account

```bash
npx tsx src/scripts/seedAdmin.ts
```

The script creates an `ADMIN` user from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. If the admin already exists, it does nothing.

### 5. Run

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

---

## Order Status Flow

```
PLACED ──(provider confirms)──► CONFIRMED ──(payment verified)──► PAID
   │                                                               │
(customer cancels)                                          (provider)
   ▼                                                               ▼
CANCELLED                                  RETURNED ◄──(provider)── PICKED_UP
```

| Change | Who |
|--------|-----|
| Create order (`PLACED`) | Customer |
| `PLACED → CONFIRMED` | Provider |
| `CONFIRMED → PAID` | Automatic, after a verified Stripe / SSLCommerz payment |
| `PAID → PICKED_UP` | Provider |
| `PICKED_UP → RETURNED` | Provider |
| `PLACED → CANCELLED` | Customer |

Reviews are allowed only after the order is `RETURNED`.

---

## API Endpoints

### Authentication and profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register as customer or provider |
| POST | `/api/auth/login` | Login, sets access and refresh token cookies |
| POST | `/api/auth/refresh-token` | Get a new access token |
| POST | `/api/auth/logout` | Clear cookies |
| PATCH | `/api/auth/change-password` | Change password |
| GET | `/api/users/me` | Current user profile |
| PUT | `/api/users/my-profile` | Update profile (shop fields: provider only) |

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gear` | Browse gear |
| GET | `/api/gear/:id` | Gear details, reviews, average rating |
| GET | `/api/categories` | List categories |

`GET /api/gear` query parameters: `searchTerm`, `category` (id or slug), `brand`, `minPrice`, `maxPrice`, `available` (`true` / `false`), `sortBy` (`pricePerDay` / `createdAt` / `name`), `sortOrder` (`asc` / `desc`), `page`, `limit`.

### Customer
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rentals` | Place a rental order |
| GET | `/api/rentals` | My orders (`?status=`) |
| GET | `/api/rentals/:id` | Order details |
| PATCH | `/api/rentals/:id/cancel` | Cancel (only while `PLACED`) |
| POST | `/api/payments/create` | Start a Stripe or SSLCommerz payment |
| POST | `/api/payments/confirm` | Confirm a Stripe payment after paying |
| GET | `/api/payments` | Payment history |
| GET | `/api/payments/:id` | Payment details |
| POST | `/api/reviews` | Review gear after the order is `RETURNED` |

### Provider
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/provider/gear` | Add gear |
| PUT | `/api/provider/gear/:id` | Update gear, stock, availability |
| DELETE | `/api/provider/gear/:id` | Remove gear (hidden if it has rental history) |
| GET | `/api/provider/orders` | Incoming orders (`?status=`) |
| PATCH | `/api/provider/orders/:id` | Set status: `CONFIRMED`, `PICKED_UP`, `RETURNED` |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | All customers and providers (`role`, `status`, `searchTerm`, `page`, `limit`) |
| PATCH | `/api/admin/users/:id` | Suspend or activate (`ACTIVE` / `SUSPENDED`) |
| GET | `/api/admin/gear` | All gear, including hidden |
| PATCH | `/api/admin/gear/:id` | Hide or restore a listing (`ACTIVE` / `HIDDEN`) |
| GET | `/api/admin/rentals` | All rental orders |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category (refused if gear uses it) |

### Payment gateway callbacks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/stripe/webhook` | Stripe webhook (signature verified) |
| POST | `/api/payments/sslcommerz/success` | SSLCommerz success callback |
| POST | `/api/payments/sslcommerz/fail` | SSLCommerz fail callback |
| POST | `/api/payments/sslcommerz/cancel` | SSLCommerz cancel callback |

---

## Business Rules

- Prices and totals are always calculated on the server from the database.
- Stock is checked per date range: overlapping orders in `PLACED`, `CONFIRMED`, `PAID` or `PICKED_UP` reduce availability.
- Rental days count both the start and end date (Jan 1 to Jan 3 = 3 days).
- All items in one order must belong to the same provider.
- Payment is allowed only for `CONFIRMED` orders. The gateway amount is checked against the order amount.
- Providers can manage only their own gear and orders.
- Suspended users cannot log in or use protected routes.
- Admins cannot suspend themselves or other admins.

---

## Payments

### Stripe (test mode)
1. Create a payment with `POST /api/payments/create` using `"provider": "STRIPE"`.
2. Open the returned `paymentUrl` and pay with test card `4242 4242 4242 4242`.
3. The order becomes `PAID` through the webhook, or by calling `POST /api/payments/confirm` with the `transactionId`.

**Webhook setup (production):** in the Stripe dashboard, add an endpoint `https://<your-domain>/api/payments/stripe/webhook` for the events `checkout.session.completed`, `checkout.session.expired` and `checkout.session.async_payment_failed`, and put its signing secret in `STRIPE_WEBHOOK_SECRET`.

**Webhook (local):**
```bash
stripe listen --events checkout.session.completed,checkout.session.expired,checkout.session.async_payment_failed --forward-to localhost:5000/api/payments/stripe/webhook
```

### SSLCommerz (sandbox)
Use `"provider": "SSLCOMMERZ"`. Set `SSLCOMMERZ_IS_LIVE=false` and your sandbox store id and password.

---

## Testing

A Postman collection covering the whole API is included: `GearUp.postman_collection.json`.

1. Import it into Postman.
2. In the collection variables, set `baseUrl`, `adminEmail` and `adminPassword`.
3. Run the folders in order (0 to 7). The Stripe payment step needs one manual action: open the `paymentUrl` in a browser and pay before sending the confirm request.

Requests marked "(should fail)" are negative tests and pass when the API rejects the request.

---

## Deployment (Vercel)

The app is bundled with **tsup** into `api/index.js`, which Vercel runs as a function.

1. Set all environment variables in the Vercel project (set `SERVER_URL` and `APP_URL` to your deployed URLs). Do not set `NODE_ENV`.
2. Build locally and commit the output:
   ```bash
   npm run build        # prisma generate && tsup
   git add -A
   git commit -m "build"
   git push
   ```
3. Deploy:
   ```bash
   vercel --prod
   ```

After every code change, run `npm run build` and commit `api/index.js` before deploying.

Cookies use `secure: true` and `sameSite: "none"` in production (detected through `NODE_ENV` or the `VERCEL` variable).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Generate the Prisma client and bundle with tsup |
| `npx prisma migrate dev` | Create and apply a migration |
| `npx prisma studio` | Browse the database |
| `npx tsx src/scripts/seedAdmin.ts` | Create the admin account |

---

## Author

Mainul Islam
