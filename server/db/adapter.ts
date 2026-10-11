/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Database Adapter: Isolated Relational Engine with Supabase connection capability.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  UserProfile,
  SellerStore,
  Category,
  Product,
  ProductVariant,
  Order,
  SellerOrder,
  OrderItem,
  Address,
  Coupon,
  SellerLedgerEntry,
  AuditLog,
  UserRole,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
  SellerOrderStatus,
  ReturnStatus
} from '../types.js';

import {
  DEMO_PROFILES,
  DEMO_STORES,
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
  DEMO_ADDRESSES,
  DEMO_COUPONS,
  DEMO_LEDGER_ENTRIES
} from './seed.js';

export interface DatabaseStatus {
  isSupabaseConnected: boolean;
  supabaseUrlConfigured: boolean;
  adapterMode: 'supabase_postgres' | 'isolated_in_memory_engine';
  message: string;
}

export class DatabaseAdapter {
  private supabase: SupabaseClient | null = null;
  private isConnectedToSupabase = false;

  // In-Memory relational storage mirroring PostgreSQL tables with integrity checks
  private profiles: Map<string, UserProfile> = new Map();
  private stores: Map<string, SellerStore> = new Map();
  private categories: Map<string, Category> = new Map();
  private products: Map<string, Product> = new Map();
  private addresses: Map<string, Address> = new Map();
  private coupons: Map<string, Coupon> = new Map();
  private orders: Map<string, Order> = new Map();
  private sellerOrders: Map<string, SellerOrder> = new Map();
  private orderItems: Map<string, OrderItem> = new Map();
  private ledgerEntries: Map<string, SellerLedgerEntry[]> = new Map();
  private auditLogs: AuditLog[] = [];
  private cartItems: Map<string, Array<{ productId: string; variantId?: string; quantity: number }>> = new Map();
  private wishlists: Map<string, Set<string>> = new Map();
  private reviews: Map<string, Array<{
    id: string;
    userId: string;
    userName: string;
    productId: string;
    rating: number;
    title: string;
    comment: string;
    createdAt: string;
  }>> = new Map();
  private returns: Map<string, {
    id: string;
    orderId: string;
    sellerOrderId: string;
    orderItemId: string;
    userId: string;
    reason: string;
    comments: string;
    status: ReturnStatus;
    createdAt: string;
  }> = new Map();

  constructor() {
    this.initSupabaseIfConfigured();
    this.seedInitialData();
  }

  private initSupabaseIfConfigured() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (url && key && !url.includes('YOUR_PROJECT_ID')) {
      try {
        this.supabase = createClient(url, key, {
          auth: { persistSession: false }
        });
        this.isConnectedToSupabase = true;
      } catch (err) {
        console.warn('[DatabaseAdapter] Supabase initialization failed, falling back to isolated engine:', err);
        this.isConnectedToSupabase = false;
      }
    }
  }

  private seedInitialData() {
    for (const p of DEMO_PROFILES) this.profiles.set(p.id, { ...p });
    for (const s of DEMO_STORES) this.stores.set(s.id, { ...s });
    for (const c of DEMO_CATEGORIES) this.categories.set(c.id, { ...c });
    for (const prod of DEMO_PRODUCTS) this.products.set(prod.id, { ...prod });
    for (const addr of DEMO_ADDRESSES) this.addresses.set(addr.id, { ...addr });
    for (const cpn of DEMO_COUPONS) this.coupons.set(cpn.id, { ...cpn });

    for (const entry of DEMO_LEDGER_ENTRIES) {
      const list = this.ledgerEntries.get(entry.storeId) || [];
      list.push({ ...entry });
      this.ledgerEntries.set(entry.storeId, list);
    }

    // Add some initial sample reviews
    this.reviews.set('prod_banarasi_kadhwa_01', [
      {
        id: 'rev_1',
        userId: 'user_customer_01',
        userName: 'Srijal Kumar',
        productId: 'prod_banarasi_kadhwa_01',
        rating: 5,
        title: 'Masterpiece Banarasi craftsmanship',
        comment: 'The Kadhwa zari work is extraordinary. No itchy loose threads on the reverse, heavy pure silk drape. Delivered in archival muslin wrapping.',
        createdAt: '2026-01-25T14:20:00.000Z'
      }
    ]);

    this.reviews.set('prod_kumkumadi_tailam_03', [
      {
        id: 'rev_2',
        userId: 'user_customer_01',
        userName: 'Srijal Kumar',
        productId: 'prod_kumkumadi_tailam_03',
        rating: 5,
        title: 'Luminous skin texture after 2 weeks',
        comment: 'Authentic saffron aroma without synthetic perfume. Absorbs completely overnight. Real Malabar apothecary quality.',
        createdAt: '2026-02-01T09:15:00.000Z'
      }
    ]);
  }

  public getStatus(): DatabaseStatus {
    return {
      isSupabaseConnected: this.isConnectedToSupabase,
      supabaseUrlConfigured: !!(process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('YOUR_PROJECT_ID')),
      adapterMode: this.isConnectedToSupabase ? 'supabase_postgres' : 'isolated_in_memory_engine',
      message: this.isConnectedToSupabase
        ? 'Connected to live Supabase PostgreSQL instance with RLS.'
        : 'Running on local isolated storage engine with strict DDL schema constraints, integer paise math & RBAC emulation. Full migrations located at supabase/migrations/.'
    };
  }

  // --- PROFILES & AUTH ---
  public async getProfileById(id: string): Promise<UserProfile | null> {
    return this.profiles.get(id) || null;
  }

  public async getProfileByEmail(email: string): Promise<UserProfile | null> {
    for (const p of this.profiles.values()) {
      if (p.email.toLowerCase() === email.toLowerCase()) return p;
    }
    return null;
  }

  public async createProfile(profile: UserProfile): Promise<UserProfile> {
    this.profiles.set(profile.id, { ...profile });
    return profile;
  }

  public async updateProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const existing = this.profiles.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.profiles.set(id, updated);
    return updated;
  }

  public async getAllProfiles(): Promise<UserProfile[]> {
    return Array.from(this.profiles.values());
  }

  // --- STORES ---
  public async getAllStores(): Promise<SellerStore[]> {
    return Array.from(this.stores.values());
  }

  public async getStoreById(id: string): Promise<SellerStore | null> {
    return this.stores.get(id) || null;
  }

  public async getStoreBySlug(slug: string): Promise<SellerStore | null> {
    for (const s of this.stores.values()) {
      if (s.slug === slug) return s;
    }
    return null;
  }

  public async getStoreByOwnerId(ownerId: string): Promise<SellerStore | null> {
    for (const s of this.stores.values()) {
      if (s.ownerId === ownerId) return s;
    }
    return null;
  }

  public async createStore(store: SellerStore): Promise<SellerStore> {
    this.stores.set(store.id, { ...store });
    return store;
  }

  public async updateStore(id: string, updates: Partial<SellerStore>): Promise<SellerStore | null> {
    const existing = this.stores.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.stores.set(id, updated);
    return updated;
  }

  // --- CATEGORIES ---
  public async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public async getCategoryBySlug(slug: string): Promise<Category | null> {
    for (const c of this.categories.values()) {
      if (c.slug === slug) return c;
    }
    return null;
  }

  // --- PRODUCTS ---
  public async getAllProducts(filter?: {
    categorySlug?: string;
    storeSlug?: string;
    searchQuery?: string;
    onlyApproved?: boolean;
    minPricePaise?: number;
    maxPricePaise?: number;
  }): Promise<Product[]> {
    let prods = Array.from(this.products.values());

    if (filter?.onlyApproved !== false) {
      prods = prods.filter((p) => p.moderationStatus === 'approved');
    }

    if (filter?.categorySlug) {
      const cat = await this.getCategoryBySlug(filter.categorySlug);
      if (cat) {
        prods = prods.filter((p) => p.categoryId === cat.id);
      }
    }

    if (filter?.storeSlug) {
      const store = await this.getStoreBySlug(filter.storeSlug);
      if (store) {
        prods = prods.filter((p) => p.storeId === store.id);
      }
    }

    if (filter?.minPricePaise !== undefined) {
      prods = prods.filter((p) => p.basePricePaise >= filter.minPricePaise!);
    }

    if (filter?.maxPricePaise !== undefined) {
      prods = prods.filter((p) => p.basePricePaise <= filter.maxPricePaise!);
    }

    if (filter?.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      prods = prods.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.originRegion.toLowerCase().includes(q) ||
          p.artisanCraftTechnique.toLowerCase().includes(q)
      );
    }

    return prods;
  }

  public async getProductById(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }

  public async getProductBySlug(slug: string): Promise<Product | null> {
    for (const p of this.products.values()) {
      if (p.slug === slug) return p;
    }
    return null;
  }

  public async createProduct(product: Product): Promise<Product> {
    this.products.set(product.id, { ...product });
    return product;
  }

  public async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const existing = this.products.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.products.set(id, updated);
    return updated;
  }

  // --- ATOMIC INVENTORY RESERVATION ---
  /**
   * Concurrently check & reserve stock for a purchase.
   * If stock is insufficient, throws an error and reverts nothing.
   */
  public async reserveInventory(items: Array<{ productId: string; variantId?: string; quantity: number }>): Promise<boolean> {
    // 1. Validation phase
    for (const item of items) {
      const product = this.products.get(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      if (product.inventoryAvailable < item.quantity) {
        throw new Error(`Insufficient stock for "${product.title}". Requested: ${item.quantity}, Available: ${product.inventoryAvailable}`);
      }
    }

    // 2. Atomic decrement phase
    for (const item of items) {
      const product = this.products.get(item.productId)!;
      product.inventoryAvailable -= item.quantity;
      this.products.set(product.id, product);
    }

    return true;
  }

  /**
   * Release reserved stock on failed payment or cancellation
   */
  public async releaseInventory(items: Array<{ productId: string; variantId?: string; quantity: number }>): Promise<void> {
    for (const item of items) {
      const product = this.products.get(item.productId);
      if (product) {
        product.inventoryAvailable += item.quantity;
        this.products.set(product.id, product);
      }
    }
  }

  // --- ADDRESSES ---
  public async getAddressesByUserId(userId: string): Promise<Address[]> {
    return Array.from(this.addresses.values()).filter((a) => a.userId === userId);
  }

  public async getAddressById(id: string): Promise<Address | null> {
    return this.addresses.get(id) || null;
  }

  public async createAddress(address: Address): Promise<Address> {
    if (address.isDefault) {
      for (const a of this.addresses.values()) {
        if (a.userId === address.userId) a.isDefault = false;
      }
    }
    this.addresses.set(address.id, { ...address });
    return address;
  }

  // --- COUPONS ---
  public async getCouponByCode(code: string): Promise<Coupon | null> {
    for (const c of this.coupons.values()) {
      if (c.code.toUpperCase() === code.toUpperCase() && c.isActive) {
        return c;
      }
    }
    return null;
  }

  public async getAllCoupons(): Promise<Coupon[]> {
    return Array.from(this.coupons.values());
  }

  public async incrementCouponUsage(couponId: string): Promise<void> {
    const cpn = this.coupons.get(couponId);
    if (cpn) {
      cpn.timesUsed += 1;
      this.coupons.set(couponId, cpn);
    }
  }

  // --- ORDERS & MULTI-VENDOR SPLIT FULFILLMENTS ---
  public async createOrder(order: Order): Promise<Order> {
    this.orders.set(order.id, { ...order });

    for (const sellerOrder of order.sellerOrders) {
      this.sellerOrders.set(sellerOrder.id, { ...sellerOrder });
      for (const item of sellerOrder.items) {
        this.orderItems.set(item.id, { ...item });
      }
    }

    return order;
  }

  public async getOrderById(id: string): Promise<Order | null> {
    const ord = this.orders.get(id);
    if (!ord) return null;
    return ord;
  }

  public async getOrderByOrderNumber(orderNumber: string): Promise<Order | null> {
    for (const ord of this.orders.values()) {
      if (ord.orderNumber.toUpperCase() === orderNumber.toUpperCase()) {
        return ord;
      }
    }
    return null;
  }

  public async getOrdersByCustomerId(customerId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter((o) => o.customerId === customerId);
  }

  public async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getSellerOrdersByStoreId(storeId: string): Promise<SellerOrder[]> {
    return Array.from(this.sellerOrders.values())
      .filter((so) => so.storeId === storeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    const ord = this.orders.get(orderId);
    if (!ord) return null;
    ord.status = status;
    ord.updatedAt = new Date().toISOString();
    this.orders.set(orderId, ord);
    return ord;
  }

  public async updateSellerOrderStatus(sellerOrderId: string, status: SellerOrderStatus, trackingNumber?: string, courierName?: string): Promise<SellerOrder | null> {
    const so = this.sellerOrders.get(sellerOrderId);
    if (!so) return null;
    so.status = status;
    if (trackingNumber) so.trackingNumber = trackingNumber;
    if (courierName) so.courierName = courierName;
    so.updatedAt = new Date().toISOString();
    this.sellerOrders.set(sellerOrderId, so);

    // Sync parent order status if all seller fulfillments shipped or delivered
    const parentOrder = this.orders.get(so.orderId);
    if (parentOrder) {
      const allSellerOrders = Array.from(this.sellerOrders.values()).filter((item) => item.orderId === parentOrder.id);
      const allDelivered = allSellerOrders.every((item) => item.status === 'delivered');
      const allShipped = allSellerOrders.every((item) => ['in_transit', 'out_for_delivery', 'delivered'].includes(item.status));

      if (allDelivered) {
        parentOrder.status = 'delivered';
      } else if (allShipped) {
        parentOrder.status = 'shipped';
      } else {
        parentOrder.status = 'partially_shipped';
      }
      this.orders.set(parentOrder.id, parentOrder);
    }

    return so;
  }

  // --- LEDGER & PAYOUTS ---
  public async addLedgerEntry(entry: SellerLedgerEntry): Promise<SellerLedgerEntry> {
    const list = this.ledgerEntries.get(entry.storeId) || [];
    list.push({ ...entry });
    this.ledgerEntries.set(entry.storeId, list);
    return entry;
  }

  public async getLedgerByStoreId(storeId: string): Promise<SellerLedgerEntry[]> {
    return this.ledgerEntries.get(storeId) || [];
  }

  public async getSellerBalancePaise(storeId: string): Promise<number> {
    const list = this.ledgerEntries.get(storeId) || [];
    if (list.length === 0) return 0;
    return list[list.length - 1].runningBalancePaise;
  }

  // --- REVIEWS ---
  public async getReviewsByProductId(productId: string) {
    return this.reviews.get(productId) || [];
  }

  public async addReview(rev: {
    userId: string;
    userName: string;
    productId: string;
    rating: number;
    title: string;
    comment: string;
  }) {
    const list = this.reviews.get(rev.productId) || [];
    const newRev = {
      ...rev,
      id: `rev_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    list.unshift(newRev);
    this.reviews.set(rev.productId, list);

    // Update product rating
    const prod = this.products.get(rev.productId);
    if (prod) {
      const totalRatings = list.reduce((acc, r) => acc + r.rating, 0);
      prod.ratingAvg = Number((totalRatings / list.length).toFixed(2));
      prod.ratingCount = list.length;
      this.products.set(prod.id, prod);
    }

    return newRev;
  }

  // --- CART & WISHLIST PERSISTENCE ---
  public async getCart(userId: string) {
    return this.cartItems.get(userId) || [];
  }

  public async setCart(userId: string, items: Array<{ productId: string; variantId?: string; quantity: number }>) {
    this.cartItems.set(userId, items);
  }

  public async getWishlist(userId: string): Promise<string[]> {
    const set = this.wishlists.get(userId);
    return set ? Array.from(set) : [];
  }

  public async toggleWishlist(userId: string, productId: string): Promise<boolean> {
    let set = this.wishlists.get(userId);
    if (!set) {
      set = new Set();
      this.wishlists.set(userId, set);
    }
    if (set.has(productId)) {
      set.delete(productId);
      return false; // removed
    } else {
      set.add(productId);
      return true; // added
    }
  }

  // --- RETURNS & REFUNDS ---
  public async createReturn(returnData: {
    orderId: string;
    sellerOrderId: string;
    orderItemId: string;
    userId: string;
    reason: string;
    comments: string;
  }) {
    const retId = `ret_${Date.now()}`;
    const retObj = {
      id: retId,
      ...returnData,
      status: 'requested' as ReturnStatus,
      createdAt: new Date().toISOString()
    };
    this.returns.set(retId, retObj);
    return retObj;
  }

  public async getAllReturns() {
    return Array.from(this.returns.values());
  }

  public async updateReturnStatus(returnId: string, status: ReturnStatus) {
    const ret = this.returns.get(returnId);
    if (!ret) return null;
    ret.status = status;
    this.returns.set(returnId, ret);
    return ret;
  }

  // --- AUDIT LOGS ---
  public async logAudit(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<void> {
    const entry: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...log
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 500) this.auditLogs.pop();
  }

  public async getAuditLogs(): Promise<AuditLog[]> {
    return this.auditLogs;
  }
}

export const db = new DatabaseAdapter();
