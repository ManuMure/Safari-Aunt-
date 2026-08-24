# Travel Agency Platform — Phase 0

Foundation layer: project scaffold, MongoDB connection, the five core
schemas, and session-based auth. No public-facing UI yet — that's Phase 1.

## What's in this phase

```
app/
  layout.tsx, page.tsx, globals.css   → minimal scaffold, confirms the app boots
  api/auth/
    register/route.ts                → POST create a customer account
    login/route.ts                   → POST authenticate, sets session cookie
    logout/route.ts                  → POST clears session cookie
    session/route.ts                 → GET current logged-in user (or null)

lib/
  db.ts                               → cached Mongoose connection
  auth.ts                             → password hashing + signed JWT session cookies

models/
  User.ts                             → customers + staff (role, staffRole)
  Destination.ts                      → country → region → destination
  Tour.ts                             → itinerary, pricing, seasonal pricing, availability
  Booking.ts                          → auto-generated ref (TRV-2026-00001), travelers, status
  Payment.ts                          → tracks M-Pesa/card/bank transactions against a booking

scripts/
  seed.ts                             → creates a super_admin account for testing
```

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy the env template and fill in real values:
   ```
   cp .env.example .env.local
   ```
   - `MONGODB_URI`: a free MongoDB Atlas cluster works fine to start
   - `JWT_SECRET`: generate with `openssl rand -base64 32`

3. Seed a test admin account:
   ```
   npm run seed
   ```
   Logs in as `admin@travelagency.test` / `ChangeMe123!` — change this password
   before going anywhere near production.

4. Run the dev server:
   ```
   npm run dev
   ```
   Visit http://localhost:3000 — you should see the Phase 0 placeholder page.

## Testing the auth API before there's a UI

```bash
# Register a customer
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Traveler","email":"jane@example.com","password":"password123"}'

# Log in
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"password123"}' \
  -c cookies.txt

# Check the session (reuses the cookie jar)
curl http://localhost:3000/api/auth/session -b cookies.txt
```

## Design notes for later phases

- **Sessions are stateless JWTs in an httpOnly cookie**, not DB-backed.
  Simple and enough for launch. If you need to revoke a single session later
  (e.g. "log out this device"), that's when to add a `Session` collection —
  don't build it now, you don't need it yet.
- **`staffRole` exists on `User` already** but nothing enforces it yet.
  Phase 4 (RBAC) is where `requireStaff()` in `lib/auth.ts` grows into
  proper per-role permission checks. For Phase 1's admin routes, checking
  `role === "staff"` is enough.
- **`Tour.availability`** already supports per-date capacity and price
  overrides, and **`Tour.pricing.seasonalPricing`** supports date-ranged
  seasonal rates — both modeled now so Phase 2 (dynamic pricing,
  availability management) is just UI + business logic, no schema changes.
- **`Booking.customer` is optional** — guest checkout is supported by
  design; `customerInfo` is always captured regardless of whether the
  person has an account.

## Next: Phase 1

Public site (homepage, destinations, tours, search, tour details, booking
flow, contact form) + admin CRUD for tours/bookings/customers.
