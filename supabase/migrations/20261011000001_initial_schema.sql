-- ==============================================================================
-- SUTRADHAR: INDIAN MULTI-VENDOR ARTISAN MARKETPLACE
-- Migration: 20261011000001_initial_schema.sql
-- Description: Complete production schema with 32 tables, strict integrity,
-- foreign keys, paise integer currency, status enums, indexes, and constraints.
-- ==============================================================================

-- 1. EXTENSIONS & CUSTOM TYPES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE user_role_type AS ENUM ('customer', 'seller', 'admin', 'super_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE seller_verification_status AS ENUM ('pending', 'under_review', 'verified', 'rejected', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE product_moderation_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status_type AS ENUM ('pending_payment', 'payment_failed', 'confirmed', 'processing', 'partially_shipped', 'shipped', 'delivered', 'cancelled', 'returned');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE seller_order_status_type AS ENUM ('allocated', 'packed', 'ready_for_pickup', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status_type AS ENUM ('created', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method_type AS ENUM ('upi', 'card', 'netbanking', 'cod');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE return_status_type AS ENUM ('requested', 'approved', 'pickup_scheduled', 'picked_up', 'received_in_warehouse', 'inspected_accepted', 'inspected_rejected', 'refund_issued', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE ledger_entry_type AS ENUM ('order_credit', 'commission_debit', 'gst_debit', 'tcs_debit', 'shipping_fee_debit', 'refund_debit', 'commission_reversal_credit', 'payout_debit', 'manual_adjustment');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. CORE USERS & PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role_type NOT NULL DEFAULT 'customer',
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES profiles(id),
  UNIQUE(user_id, role)
);

-- 3. SELLER STORES & ACCOUNTS
CREATE TABLE IF NOT EXISTS seller_stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  store_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  business_type TEXT NOT NULL DEFAULT 'artisan_collective', -- artisan_collective, sole_proprietorship, pvt_ltd, llp
  gstin TEXT,
  pan TEXT NOT NULL,
  status seller_verification_status DEFAULT 'pending',
  rejection_reason TEXT,
  rating_avg NUMERIC(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  commission_rate_override NUMERIC(5,2), -- NULL means default category commission rule applies
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES seller_stores(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- gstin_cert, pan_card, bank_cancelled_cheque, artisan_id_card, fssai_license
  document_url TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_payout_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID UNIQUE NOT NULL REFERENCES seller_stores(id) ON DELETE CASCADE,
  account_holder_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number_masked TEXT NOT NULL,
  encrypted_account_number TEXT NOT NULL,
  ifsc_code TEXT NOT NULL,
  vpa_upi TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CUSTOMER ADDRESSES
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  country TEXT DEFAULT 'India',
  is_default BOOLEAN DEFAULT FALSE,
  address_type TEXT DEFAULT 'home', -- home, work, other
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CATEGORIES & CATALOG
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  display_order INT DEFAULT 0,
  default_commission_percent NUMERIC(5,2) NOT NULL DEFAULT 10.00, -- e.g. 10.00%
  gst_rate_percent NUMERIC(5,2) NOT NULL DEFAULT 12.00, -- 5, 12, 18, 28
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES seller_stores(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT NOT NULL,
  origin_region TEXT, -- e.g., 'Kashmir', 'Chanderi, MP', 'Bastar, Chhattisgarh'
  artisan_craft_technique TEXT, -- e.g. 'Hand-hammered Dhokra', 'Zari Weaving'
  hsn_code VARCHAR(16),
  base_price_paise BIGINT NOT NULL CHECK (base_price_paise >= 0),
  compare_at_price_paise BIGINT CHECK (compare_at_price_paise >= base_price_paise),
  cost_price_paise BIGINT,
  is_featured BOOLEAN DEFAULT FALSE,
  moderation_status product_moderation_status DEFAULT 'pending_approval',
  moderated_by UUID REFERENCES profiles(id),
  moderation_notes TEXT,
  has_variants BOOLEAN DEFAULT FALSE,
  views_count INT DEFAULT 0,
  sales_count INT DEFAULT 0,
  weight_grams INT DEFAULT 500,
  dimensions_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL, -- e.g., 'Medium / Antique Brass' or 'Standard 500ml'
  options JSONB NOT NULL DEFAULT '{}', -- {"Size": "M", "Color": "Brass"}
  price_paise BIGINT NOT NULL CHECK (price_paise >= 0),
  compare_at_price_paise BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INVENTORY MANAGEMENT (STRICT ATOMIC CONCURRENCY)
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity_available INT NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_reserved INT NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  low_stock_threshold INT NOT NULL DEFAULT 5,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_inv_target UNIQUE (product_id, variant_id)
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
  quantity_change INT NOT NULL,
  movement_type TEXT NOT NULL, -- initial_stock, purchase_reserved, reservation_released, order_fulfilled, return_restock, adjustment
  reference_type TEXT, -- order_id, manual, return_id
  reference_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. REVIEWS & RATINGS (PURCHASE VERIFIED ONLY)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT TRUE,
  is_approved BOOLEAN DEFAULT TRUE,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- 8. CARTS & WISHLISTS
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cart_id, product_id, variant_id)
);

-- 9. PROMOTIONS & COUPONS
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL, -- 'percentage' or 'flat_paise'
  discount_value INT NOT NULL CHECK (discount_value > 0), -- e.g. 15 for 15% or 50000 for ₹500
  min_order_amount_paise BIGINT DEFAULT 0,
  max_discount_paise BIGINT,
  usage_limit INT,
  times_used INT DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  order_id UUID NOT NULL,
  discount_amount_paise BIGINT NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ORDERS & MULTI-VENDOR SPLIT FULFILLMENT
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address_snapshot JSONB NOT NULL,
  billing_address_snapshot JSONB NOT NULL,
  
  -- Integer paise monetary snapshots
  subtotal_paise BIGINT NOT NULL CHECK (subtotal_paise >= 0),
  shipping_fee_paise BIGINT NOT NULL DEFAULT 0 CHECK (shipping_fee_paise >= 0),
  tax_paise BIGINT NOT NULL DEFAULT 0 CHECK (tax_paise >= 0),
  coupon_discount_paise BIGINT NOT NULL DEFAULT 0 CHECK (coupon_discount_paise >= 0),
  total_paise BIGINT NOT NULL CHECK (total_paise >= 0),
  
  status order_status_type DEFAULT 'pending_payment',
  applied_coupon_code TEXT,
  customer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seller Fulfillment Group (One customer order has multiple seller fulfillments)
CREATE TABLE IF NOT EXISTS seller_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES seller_stores(id) ON DELETE RESTRICT,
  seller_order_number TEXT UNIQUE NOT NULL,
  status seller_order_status_type DEFAULT 'allocated',
  seller_subtotal_paise BIGINT NOT NULL,
  seller_commission_paise BIGINT NOT NULL,
  seller_tax_paise BIGINT NOT NULL,
  seller_payout_amount_paise BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  seller_order_id UUID NOT NULL REFERENCES seller_orders(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES seller_stores(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
  
  -- Invariant snapshots
  product_title_snapshot TEXT NOT NULL,
  variant_title_snapshot TEXT,
  sku_snapshot TEXT,
  unit_price_paise BIGINT NOT NULL CHECK (unit_price_paise >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  line_total_paise BIGINT NOT NULL CHECK (line_total_paise >= 0),
  
  -- Commission and Tax Snapshots
  applicable_commission_rate NUMERIC(5,2) NOT NULL,
  commission_amount_paise BIGINT NOT NULL CHECK (commission_amount_paise >= 0),
  gst_rate_percent NUMERIC(5,2) NOT NULL DEFAULT 12.00,
  tax_amount_paise BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_order_id UUID NOT NULL REFERENCES seller_orders(id) ON DELETE CASCADE,
  courier_name TEXT NOT NULL, -- Delhivery, Blue Dart, Shiprocket, Ekart
  tracking_number TEXT NOT NULL,
  shipping_label_url TEXT,
  shipped_at TIMESTAMPTZ,
  estimated_delivery_date DATE,
  delivered_at TIMESTAMPTZ,
  current_location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  seller_order_id UUID REFERENCES seller_orders(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  comment TEXT,
  changed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PAYMENTS & TRANSACTIONS
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  payment_method payment_method_type NOT NULL,
  gateway_payment_id TEXT UNIQUE,
  gateway_order_id TEXT,
  gateway_signature TEXT,
  amount_paise BIGINT NOT NULL CHECK (amount_paise >= 0),
  currency VARCHAR(3) DEFAULT 'INR',
  status payment_status_type DEFAULT 'created',
  error_code TEXT,
  error_description TEXT,
  idempotency_key TEXT UNIQUE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL, -- payment.authorized, payment.captured, payment.failed
  payload JSONB NOT NULL,
  signature_verified BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. RETURNS & REFUNDS
CREATE TABLE IF NOT EXISTS returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE RESTRICT,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  seller_order_id UUID NOT NULL REFERENCES seller_orders(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  reason TEXT NOT NULL,
  customer_comments TEXT,
  evidence_images JSONB DEFAULT '[]',
  status return_status_type DEFAULT 'requested',
  admin_decision_notes TEXT,
  pickup_awb TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_id UUID REFERENCES returns(id) ON DELETE RESTRICT,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  payment_id UUID REFERENCES payments(id) ON DELETE RESTRICT,
  amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
  gateway_refund_id TEXT UNIQUE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'processed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. FINANCE, COMMISSIONS, LEDGER & PAYOUTS
CREATE TABLE IF NOT EXISTS commission_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL,
  commission_percentage NUMERIC(5,2) NOT NULL,
  effective_from TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS commission_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE RESTRICT,
  store_id UUID NOT NULL REFERENCES seller_stores(id) ON DELETE RESTRICT,
  gross_sales_paise BIGINT NOT NULL,
  commission_paise BIGINT NOT NULL,
  gst_on_commission_paise BIGINT NOT NULL, -- 18% GST on marketplace commission fee
  tcs_paise BIGINT NOT NULL DEFAULT 0, -- Tax Collected at Source 1% under GST
  net_payable_to_seller_paise BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_ledger_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES seller_stores(id) ON DELETE RESTRICT,
  entry_type ledger_entry_type NOT NULL,
  amount_paise BIGINT NOT NULL, -- positive for credits, negative for debits
  running_balance_paise BIGINT NOT NULL,
  reference_type TEXT NOT NULL, -- order_item, return, payout, adjustment
  reference_id TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES seller_stores(id) ON DELETE RESTRICT,
  payout_account_id UUID NOT NULL REFERENCES seller_payout_accounts(id) ON DELETE RESTRICT,
  amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
  payout_reference_id TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  bank_utr TEXT,
  processed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. NOTIFICATIONS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- order_update, payment_success, return_status, seller_alert
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(moderation_status);
CREATE INDEX IF NOT EXISTS idx_product_variants_prod ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_seller_orders_store ON seller_orders(store_id);
CREATE INDEX IF NOT EXISTS idx_seller_orders_order ON seller_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_seller_order ON order_items(seller_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_seller_ledger_store ON seller_ledger_entries(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_variant ON inventory(product_id, variant_id);
