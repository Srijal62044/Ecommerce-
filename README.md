# Sūtradhār: Production Multi-Vendor Artisan Marketplace for India

**Sūtradhār** is a full-stack, multi-vendor e-commerce marketplace engineered for Indian artisan collectives, handloom weavers, and traditional craft guilds. It implements split-order fulfillment, atomic inventory reservations, integer paise financial calculations, and auditable ledger management under Indian e-commerce statutory regulations (Consumer Protection E-Commerce Rules 2020, CGST Act Sec 52).

---

## 1. Architecture & Route Map

### Customer Routes
- `/` — Curated Homepage with Hero campaign, 3D craft inspector, and guild spotlights
- `/shop` — Filterable Catalog (Category, Guild, Price slider, Rating, In-Stock)
- `/category/:slug` — Category-specific collections (Handloom Silk, Dhokra & Brass, Botanicals)
- `/product/:slug` — Contiguous Purchase Module (PDP), variants, reviews, 6-digit Indian Pincode delivery check
- `/seller/:slug` — Artisan Guild Showcase with verified credentials and works
- `/cart` & `/checkout` — Multi-vendor split review, coupon discount engine, UPI QR & Card payment adapter
- `/order-success/:id` — Multi-vendor split fulfillment breakdown & consignment airway bills (AWB)
- `/track-order` — Consignment tracking timeline with milestones (Delhivery / Blue Dart)
- `/account` — Collector Desk: Profile, Saved Addresses, Purchases, Wishlist, Return requests
- `/help` & `/contact` — Grievance Redressal Desk under Rule 5(9) of E-Commerce Rules
- `/policies/:type` — Statutory Policies (`privacy`, `terms`, `shipping`, `returns`, `refunds`)

### Seller Portal (`/seller/portal`)
- Authenticated seller desk with strict Cross-Seller Isolation
- Multi-vendor fulfillment orders: Mark packed, assign courier AWB tracking
- Product management: Submit works for GI quality review
- Auditable Ledger: Gross sales credits, 12% category commission debits, 18% GST on platform fees, 1% TCS debits, and net balance settlements

### Admin Portal (`/admin/portal`)
- Executive metrics: GMV, commission earnings, verified guilds, orders
- Seller KYC review & verification
- Product GI standards moderation queue
- Orders & split fulfillment oversight
- Automated Invariant Test Runner executing live integration assertions

---

## 2. Database & Supabase Integration

All PostgreSQL DDL migrations and Row Level Security policies are located in:
- `supabase/migrations/20261011000001_initial_schema.sql` (32 tables, integrity constraints, enums, indexes, paise checks)
- `supabase/migrations/20261011000002_rls_policies.sql` (Strict RLS policies preventing cross-seller leaks and role escalation)

### Isolated Database Adapter
- When `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured in `.env`, the server binds directly to the live Supabase instance.
- In sandbox or local test mode, the server operates on an in-memory relational engine faithfully mirroring the exact relational tables, constraints, integer paise math, and RBAC rules.

---

## 3. Financial Model & Indian Statutory Compliance

| Invariant | Implementation Rule |
| :--- | :--- |
| **Monetary Storage** | Stored exclusively as integer paise (`3850000` = ₹38,500.00) to prevent floating-point rounding errors. |
| **Marketplace Commission** | Calculated per item category (default 10%–12%). Snapshot on order item at purchase time. |
| **GST on Platform Fee** | 18% Service Tax on the marketplace commission debit. |
| **TCS (Tax Collected at Source)** | 1% of net taxable supply under Section 52 of the CGST Act 2017. |
| **Refund Reversals** | Auditable debit of gross sales with full credit reversal of commission. |

---

## 4. Payment Provider Adapter

- **UPI**: Generates dynamic UPI intent strings (`upi://pay?pa=...&pn=...&am=...&cu=INR`) and scan-and-pay QR codes.
- **Cards**: Tokenized payment authorization simulation with 3DS sandbox validation.
- **Cash on Delivery (COD)**: Separate confirmation, dispatch, delivery, and seller ledger reconciliation flow.
- **Webhook Idempotency & HMAC**: Webhooks verified via HMAC-SHA256 signature; duplicates flagged and prevented from double-crediting.

---

## 5. Automated Tests

Run the full invariant test suite via CLI:
```bash
npm test
```
Or click **"Run Invariant Tests"** inside the Admin Portal (`/admin/portal`) to execute all 7 core assertions:
1. Cross-Seller Access Denial
2. Atomic Overselling Prevention
3. Duplicate Payment Webhook Idempotency
4. Failed Payment Inventory Rollback
5. Refund & Ledger Reversal Calculations
6. Role Escalation Denial
7. Integer Paise Arithmetic Precision

---

## 6. Architecture Status Checklist

- [x] **Implemented**: Multi-vendor split fulfillments, atomic inventory reservation, integer paise calculations, 32-table DDL migrations, auditable seller ledger, Three.js 3D craft inspector, Indian pincode delivery estimator, coupons, return requests.
- [x] **Tested**: 7/7 automated invariant test suite passing (cross-seller isolation, webhook idempotency, failed payment rollback, paise math).
- [x] **Configured**: Supabase adapter via environment secrets, UPI/Cards/COD payment gateway adapter, .env.example with zero committed secrets.
- [!] **External Limitations**: Direct automated banking payout API (requires corporate escrow account KYC) and live carrier webhook push (requires enterprise Delhivery token). Isolated sandbox adapter handles these flows faithfully.
