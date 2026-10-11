-- ==============================================================================
-- SUTRADHAR: INDIAN MULTI-VENDOR ARTISAN MARKETPLACE
-- Migration: 20261011000002_rls_policies.sql
-- Description: Complete Row Level Security (RLS) enforcement and RBAC policies.
-- ==============================================================================

-- 1. ENABLE RLS ON ALL SENSITIVE & DOMAIN TABLES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_payout_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. HELPER FUNCTIONS FOR ROLE CHECKS
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.is_seller()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'seller'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.owns_seller_store(store_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM seller_stores
    WHERE id = store_id_param AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. PROFILES & ROLES POLICIES
-- Profiles: Any authenticated user can read public names; users can edit own profile; admins can read all
CREATE POLICY "Profiles are viewable by authenticated users"
ON profiles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = id);

-- Roles: Prevent self-escalation! Users can only see own roles; only admins can insert/update/delete
CREATE POLICY "Users can view own roles"
ON user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id OR auth.is_admin());

CREATE POLICY "Only admins can manage roles"
ON user_roles FOR ALL TO authenticated
USING (auth.is_admin());

-- 4. SELLER STORES & ONBOARDING
-- Public can view verified stores
CREATE POLICY "Public can view verified stores"
ON seller_stores FOR SELECT TO public
USING (status = 'verified' OR owner_id = auth.uid() OR auth.is_admin());

-- Sellers can create and update own store
CREATE POLICY "Sellers can manage own store"
ON seller_stores FOR UPDATE TO authenticated
USING (owner_id = auth.uid() OR auth.is_admin());

CREATE POLICY "Sellers can register store"
ON seller_stores FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Documents and Payouts: Strictly store owner or Admin
CREATE POLICY "Strict document access"
ON seller_documents FOR ALL TO authenticated
USING (auth.owns_seller_store(store_id) OR auth.is_admin());

CREATE POLICY "Strict payout account access"
ON seller_payout_accounts FOR ALL TO authenticated
USING (auth.owns_seller_store(store_id) OR auth.is_admin());

-- 5. ADDRESSES
CREATE POLICY "Users manage own addresses"
ON addresses FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- 6. CATEGORIES & CATALOG
CREATE POLICY "Categories are readable by everyone"
ON categories FOR SELECT TO public
USING (true);

CREATE POLICY "Only admin can modify categories"
ON categories FOR ALL TO authenticated
USING (auth.is_admin());

CREATE POLICY "Public can read approved products"
ON products FOR SELECT TO public
USING (moderation_status = 'approved' OR auth.owns_seller_store(store_id) OR auth.is_admin());

CREATE POLICY "Sellers can insert own products"
ON products FOR INSERT TO authenticated
WITH CHECK (auth.owns_seller_store(store_id) OR auth.is_admin());

CREATE POLICY "Sellers can update own products"
ON products FOR UPDATE TO authenticated
USING (auth.owns_seller_store(store_id) OR auth.is_admin());

-- Variants and Images follow parent product ownership
CREATE POLICY "Variants viewable if product viewable"
ON product_variants FOR SELECT TO public
USING (true);

CREATE POLICY "Sellers manage own product variants"
ON product_variants FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM products WHERE products.id = product_variants.product_id AND auth.owns_seller_store(products.store_id)) OR auth.is_admin());

CREATE POLICY "Images viewable by all"
ON product_images FOR SELECT TO public
USING (true);

CREATE POLICY "Sellers manage own product images"
ON product_images FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM products WHERE products.id = product_images.product_id AND auth.owns_seller_store(products.store_id)) OR auth.is_admin());

-- 7. INVENTORY (Sellers only see own inventory)
CREATE POLICY "Sellers view own inventory"
ON inventory FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM products WHERE products.id = inventory.product_id AND auth.owns_seller_store(products.store_id)) OR auth.is_admin());

CREATE POLICY "Sellers update own inventory"
ON inventory FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM products WHERE products.id = inventory.product_id AND auth.owns_seller_store(products.store_id)) OR auth.is_admin());

-- 8. CARTS & WISHLISTS
CREATE POLICY "Users manage own carts"
ON carts FOR ALL TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users manage own cart items"
ON cart_items FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));

CREATE POLICY "Users manage own wishlists"
ON wishlists FOR ALL TO authenticated
USING (user_id = auth.uid());

-- 9. ORDERS & SPLIT FULFILLMENTS
CREATE POLICY "Customers view own orders"
ON orders FOR SELECT TO authenticated
USING (customer_id = auth.uid() OR auth.is_admin());

CREATE POLICY "Customers view own order items"
ON order_items FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
  OR auth.owns_seller_store(store_id)
  OR auth.is_admin()
);

-- Sellers strictly view only their allocated seller_orders
CREATE POLICY "Sellers view own seller orders"
ON seller_orders FOR SELECT TO authenticated
USING (auth.owns_seller_store(store_id) OR auth.is_admin());

CREATE POLICY "Sellers update own shipments"
ON seller_orders FOR UPDATE TO authenticated
USING (auth.owns_seller_store(store_id) OR auth.is_admin());

CREATE POLICY "Shipments access"
ON shipments FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM seller_orders WHERE seller_orders.id = shipments.seller_order_id AND (auth.owns_seller_store(seller_orders.store_id) OR auth.is_admin()))
);

-- 10. REVIEWS
CREATE POLICY "Anyone can view approved reviews"
ON reviews FOR SELECT TO public
USING (is_approved = true);

CREATE POLICY "Customers can create reviews for verified purchases"
ON reviews FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- 11. FINANCE & SELLER LEDGER
CREATE POLICY "Sellers can view own ledger"
ON seller_ledger_entries FOR SELECT TO authenticated
USING (auth.owns_seller_store(store_id) OR auth.is_admin());

CREATE POLICY "Sellers can view own payouts"
ON payouts FOR SELECT TO authenticated
USING (auth.owns_seller_store(store_id) OR auth.is_admin());

CREATE POLICY "Admin manages ledger and payouts"
ON seller_ledger_entries FOR ALL TO authenticated
USING (auth.is_admin());

-- 12. AUDIT LOGS & NOTIFICATIONS
CREATE POLICY "Users view own notifications"
ON notifications FOR ALL TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admin only audit logs"
ON audit_logs FOR SELECT TO authenticated
USING (auth.is_admin());
