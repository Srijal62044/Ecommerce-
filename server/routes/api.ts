/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sutradhar Marketplace Express REST API
 */

import { Router, Request, Response } from 'express';
import { db } from '../db/adapter.js';
import { AuthService, AuthenticatedRequest } from '../services/authService.js';
import { OrderService } from '../services/orderService.js';
import { PaymentService } from '../services/paymentService.js';
import { FinanceService } from '../services/financeService.js';
import { TestRunner } from '../tests/testRunner.js';

export const apiRouter = Router();

// Apply auth middleware to all api routes
apiRouter.use(AuthService.authenticate);

// --- SYSTEM & HEALTH ---
apiRouter.get('/system/status', (req: Request, res: Response) => {
  const dbStatus = db.getStatus();
  res.json({
    success: true,
    data: {
      appName: 'Sutradhar Indian Multi-Vendor Artisan Marketplace',
      version: '1.0.0',
      database: dbStatus,
      paymentGateway: {
        provider: 'Unified Sandbox Adapter (UPI / Cards / Netbanking / COD)',
        mode: process.env.PAYMENT_GATEWAY_KEY_ID ? 'configured_credentials' : 'isolated_sandbox_simulator'
      },
      logistics: {
        activeCouriers: ['Delhivery Express', 'Blue Dart Air', 'Shiprocket Artisan Surface']
      }
    }
  });
});

// --- AUTH & PERSONAS ---
apiRouter.get('/auth/me', (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: req.user || null
  });
});

apiRouter.post('/auth/switch-persona', async (req: Request, res: Response) => {
  const { userId } = req.body;
  const profile = await db.getProfileById(userId);
  if (!profile) {
    res.status(404).json({ success: false, error: 'User profile not found' });
    return;
  }
  res.json({ success: true, data: profile });
});

apiRouter.get('/auth/personas', async (req: Request, res: Response) => {
  const profiles = await db.getAllProfiles();
  res.json({ success: true, data: profiles });
});

// --- CATALOG & DISCOVERY ---
apiRouter.get('/categories', async (req: Request, res: Response) => {
  const cats = await db.getAllCategories();
  res.json({ success: true, data: cats });
});

apiRouter.get('/products', async (req: Request, res: Response) => {
  const { category, store, q, minPrice, maxPrice, sort } = req.query;

  const prods = await db.getAllProducts({
    categorySlug: category as string,
    storeSlug: store as string,
    searchQuery: q as string,
    minPricePaise: minPrice ? Number(minPrice) * 100 : undefined,
    maxPricePaise: maxPrice ? Number(maxPrice) * 100 : undefined
  });

  // Sort
  if (sort === 'price_asc') {
    prods.sort((a, b) => a.basePricePaise - b.basePricePaise);
  } else if (sort === 'price_desc') {
    prods.sort((a, b) => b.basePricePaise - a.basePricePaise);
  } else if (sort === 'rating') {
    prods.sort((a, b) => b.ratingAvg - a.ratingAvg);
  } else {
    // Default featured / sales
    prods.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }

  res.json({ success: true, data: prods, count: prods.length });
});

apiRouter.get('/products/:slug', async (req: Request, res: Response) => {
  const prod = await db.getProductBySlug(req.params.slug);
  if (!prod) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }
  const reviews = await db.getReviewsByProductId(prod.id);
  res.json({ success: true, data: { ...prod, reviews } });
});

apiRouter.post('/products/:id/reviews', async (req: AuthenticatedRequest, res: Response) => {
  const { rating, title, comment } = req.body;
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Login required to post a review' });
    return;
  }
  if (!rating || rating < 1 || rating > 5) {
    res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    return;
  }

  const review = await db.addReview({
    userId: req.user.id,
    userName: req.user.fullName,
    productId: req.params.id,
    rating,
    title: title || 'Verified Customer Review',
    comment: comment || ''
  });

  res.json({ success: true, data: review });
});

// --- STORES ---
apiRouter.get('/stores', async (req: Request, res: Response) => {
  const stores = await db.getAllStores();
  res.json({ success: true, data: stores });
});

apiRouter.get('/stores/:slug', async (req: Request, res: Response) => {
  const store = await db.getStoreBySlug(req.params.slug);
  if (!store) {
    res.status(404).json({ success: false, error: 'Store not found' });
    return;
  }
  const products = await db.getAllProducts({ storeSlug: store.slug });
  res.json({ success: true, data: { store, products } });
});

// --- PINCODE & DELIVERY ESTIMATION (INDIA) ---
apiRouter.get('/pincode/check/:pincode', (req: Request, res: Response) => {
  const pincode = req.params.pincode;
  const isSixDigit = /^[1-9][0-9]{5}$/.test(pincode);

  if (!isSixDigit) {
    res.status(400).json({ success: false, error: 'Invalid Indian 6-digit postal code' });
    return;
  }

  // Realistic Indian postal circle estimate
  const firstDigit = pincode[0];
  let zone = 'West Circle (Mumbai, Pune, Ahmedabad)';
  let estDays = 2;

  if (firstDigit === '1' || firstDigit === '2') {
    zone = 'North Circle (Delhi NCR, Punjab, UP, Kashmir)';
    estDays = 3;
  } else if (firstDigit === '5' || firstDigit === '6') {
    zone = 'South Circle (Bengaluru, Chennai, Hyderabad, Kerala)';
    estDays = 3;
  } else if (firstDigit === '7' || firstDigit === '8') {
    zone = 'East & North-East Circle (Kolkata, Bihar, Assam)';
    estDays = 4;
  } else if (firstDigit === '4') {
    zone = 'West Circle (Maharashtra, Goa, MP)';
    estDays = 2;
  }

  res.json({
    success: true,
    data: {
      pincode,
      serviceable: true,
      zone,
      estimatedDeliveryDays: estDays,
      codAvailable: true,
      freeDeliveryEligible: true,
      couriersAvailable: ['Delhivery Air Express', 'Blue Dart Apex Priority']
    }
  });
});

// --- CART & WISHLIST ---
apiRouter.get('/cart', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'guest';
  const cart = await db.getCart(userId);
  res.json({ success: true, data: cart });
});

apiRouter.post('/cart', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'guest';
  const { items } = req.body;
  await db.setCart(userId, items || []);
  res.json({ success: true, message: 'Cart synchronized' });
});

apiRouter.get('/wishlist', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'guest';
  const wishlist = await db.getWishlist(userId);
  res.json({ success: true, data: wishlist });
});

apiRouter.post('/wishlist/toggle', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'guest';
  const { productId } = req.body;
  const isAdded = await db.toggleWishlist(userId, productId);
  res.json({ success: true, data: { added: isAdded } });
});

// --- COUPONS ---
apiRouter.post('/coupons/validate', async (req: Request, res: Response) => {
  const { code, subtotalPaise } = req.body;
  if (!code) {
    res.status(400).json({ success: false, error: 'Coupon code required' });
    return;
  }

  const coupon = await db.getCouponByCode(code);
  if (!coupon) {
    res.status(404).json({ success: false, error: 'Invalid or expired coupon code' });
    return;
  }

  if (subtotalPaise < coupon.minOrderAmountPaise) {
    res.status(400).json({
      success: false,
      error: `Minimum order amount for ${coupon.code} is ₹${(coupon.minOrderAmountPaise / 100).toLocaleString('en-IN')}`
    });
    return;
  }

  let discountPaise = 0;
  if (coupon.discountType === 'percentage') {
    discountPaise = Math.round((subtotalPaise * coupon.discountValue) / 100);
    if (coupon.maxDiscountPaise && discountPaise > coupon.maxDiscountPaise) {
      discountPaise = coupon.maxDiscountPaise;
    }
  } else {
    discountPaise = coupon.discountValue;
  }

  res.json({
    success: true,
    data: {
      coupon,
      discountPaise,
      newTotalPaise: Math.max(0, subtotalPaise - discountPaise)
    }
  });
});

// --- ORDERS & CHECKOUT ---
apiRouter.post('/orders', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      customerEmail,
      customerPhone,
      shippingAddress,
      billingAddress,
      items,
      paymentMethod,
      couponCode,
      customerNotes
    } = req.body;

    const customerId = req.user?.id || 'user_customer_01';

    const order = await OrderService.createOrder({
      customerId,
      customerEmail: customerEmail || req.user?.email || 'customer@sutradhar.in',
      customerPhone: customerPhone || '+91 98110 99887',
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      items,
      paymentMethod: paymentMethod || 'upi',
      couponCode,
      customerNotes
    });

    res.json({ success: true, data: order });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Order processing failed';
    res.status(400).json({ success: false, error: message });
  }
});

apiRouter.get('/orders', async (req: AuthenticatedRequest, res: Response) => {
  const customerId = req.user?.id || 'user_customer_01';
  const orders = await db.getOrdersByCustomerId(customerId);
  res.json({ success: true, data: orders });
});

apiRouter.get('/orders/:id', async (req: AuthenticatedRequest, res: Response) => {
  const order = (await db.getOrderById(req.params.id)) || (await db.getOrderByOrderNumber(req.params.id));
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }
  res.json({ success: true, data: order });
});

// --- PAYMENTS & GATEWAY ADAPTER ---
apiRouter.post('/payments/create-order', async (req: Request, res: Response) => {
  const { orderId, method } = req.body;
  const order = await db.getOrderById(orderId);
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }

  const paymentOrder = await PaymentService.createPaymentOrder(order, method || 'upi');
  res.json({ success: true, data: paymentOrder });
});

apiRouter.post('/payments/verify', async (req: Request, res: Response) => {
  const { orderId, gatewayOrderId, gatewayPaymentId, signature } = req.body;

  const isValid = PaymentService.verifySignature(gatewayOrderId, gatewayPaymentId, signature);
  if (!isValid) {
    res.status(400).json({ success: false, error: 'Invalid payment signature' });
    return;
  }

  // Trigger captured webhook flow safely
  const webhookResult = await PaymentService.processWebhook(
    `evt_verify_${Date.now()}`,
    'payment.captured',
    { orderId, gatewayOrderId, gatewayPaymentId, signature }
  );

  const updatedOrder = await db.getOrderById(orderId);
  res.json({ success: true, data: { order: updatedOrder, webhookResult } });
});

apiRouter.post('/payments/webhook', async (req: Request, res: Response) => {
  const { eventId, event, payload } = req.body;
  try {
    const result = await PaymentService.processWebhook(eventId, event, payload);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    res.status(500).json({ success: false, error: message });
  }
});

// --- SELLER PORTAL APIS (RBAC & CROSS-SELLER ISOLATION) ---
apiRouter.get('/seller/store', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  const store = await db.getStoreByOwnerId(req.user.id);
  if (!store) {
    // If admin is inspecting, return the first store
    if (req.user.roles.includes('admin') || req.user.roles.includes('super_admin')) {
      const stores = await db.getAllStores();
      res.json({ success: true, data: stores[0] });
      return;
    }
    res.status(404).json({ success: false, error: 'No seller store found for this account' });
    return;
  }

  res.json({ success: true, data: store });
});

apiRouter.get('/seller/orders', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  let store = await db.getStoreByOwnerId(req.user.id);
  if (!store && (req.user.roles.includes('admin') || req.user.roles.includes('super_admin'))) {
    const stores = await db.getAllStores();
    store = stores[0];
  }

  if (!store) {
    res.status(404).json({ success: false, error: 'Store not found' });
    return;
  }

  const orders = await db.getSellerOrdersByStoreId(store.id);
  res.json({ success: true, data: orders });
});

apiRouter.post('/seller/orders/:id/ship', async (req: AuthenticatedRequest, res: Response) => {
  const { trackingNumber, courierName, status } = req.body;
  const sellerOrder = await db.updateSellerOrderStatus(
    req.params.id,
    status || 'in_transit',
    trackingNumber || `DEL-${Math.floor(10000000 + Math.random() * 90000000)}`,
    courierName || 'Delhivery Express'
  );

  if (!sellerOrder) {
    res.status(404).json({ success: false, error: 'Seller order not found' });
    return;
  }

  res.json({ success: true, data: sellerOrder });
});

apiRouter.get('/seller/ledger', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  let store = await db.getStoreByOwnerId(req.user.id);
  if (!store && (req.user.roles.includes('admin') || req.user.roles.includes('super_admin'))) {
    const stores = await db.getAllStores();
    store = stores[0];
  }

  if (!store) {
    res.status(404).json({ success: false, error: 'Store not found' });
    return;
  }

  const ledger = await db.getLedgerByStoreId(store.id);
  const balancePaise = await db.getSellerBalancePaise(store.id);

  res.json({ success: true, data: { ledger, balancePaise } });
});

apiRouter.post('/seller/products', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  const store = await db.getStoreByOwnerId(req.user.id);
  if (!store) {
    res.status(403).json({ success: false, error: 'Only registered sellers can create products' });
    return;
  }

  const { title, description, categoryId, basePricePaise, originRegion, artisanCraftTechnique, inventoryAvailable } = req.body;

  const product = await db.createProduct({
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    storeId: store.id,
    storeName: store.storeName,
    storeSlug: store.slug,
    categoryId: categoryId || 'cat_textiles',
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    description: description || 'Artisanal product handcrafted in India.',
    originRegion: originRegion || 'India',
    artisanCraftTechnique: artisanCraftTechnique || 'Handmade',
    basePricePaise: Number(basePricePaise) || 100000,
    isFeatured: false,
    moderationStatus: 'pending_approval',
    hasVariants: false,
    viewsCount: 0,
    salesCount: 0,
    weightGrams: 500,
    ratingAvg: 5.0,
    ratingCount: 0,
    inventoryAvailable: Number(inventoryAvailable) || 10,
    variants: [],
    images: [{ id: `img_${Date.now()}`, productId: '', url: '', displayOrder: 1, isPrimary: true }],
    createdAt: new Date().toISOString()
  });

  res.json({ success: true, data: product });
});

// --- ADMIN PORTAL APIS (ROLE RESTRICTED) ---
apiRouter.get('/admin/overview', AuthService.requireRole('admin'), async (req: Request, res: Response) => {
  const orders = await db.getAllOrders();
  const stores = await db.getAllStores();
  const products = await db.getAllProducts({ onlyApproved: false });

  const totalGmvPaise = orders.reduce((acc, o) => acc + (o.status !== 'cancelled' ? o.totalPaise : 0), 0);
  const totalCommissionPaise = orders.reduce((acc, o) => {
    return acc + o.sellerOrders.reduce((sum, so) => sum + so.sellerCommissionPaise, 0);
  }, 0);

  res.json({
    success: true,
    data: {
      metrics: {
        totalGmvPaise,
        totalCommissionPaise,
        totalOrdersCount: orders.length,
        verifiedSellersCount: stores.filter((s) => s.status === 'verified').length,
        pendingSellersCount: stores.filter((s) => s.status === 'pending').length,
        pendingProductsModeration: products.filter((p) => p.moderationStatus === 'pending_approval').length
      },
      recentOrders: orders.slice(0, 10),
      stores
    }
  });
});

apiRouter.get('/admin/sellers', AuthService.requireRole('admin'), async (req: Request, res: Response) => {
  const stores = await db.getAllStores();
  res.json({ success: true, data: stores });
});

apiRouter.post('/admin/sellers/:id/verify', AuthService.requireRole('admin'), async (req: Request, res: Response) => {
  const { status, rejectionReason } = req.body;
  const store = await db.updateStore(req.params.id, {
    status: status || 'verified',
    rejectionReason
  });
  res.json({ success: true, data: store });
});

apiRouter.get('/admin/products', AuthService.requireRole('admin'), async (req: Request, res: Response) => {
  const products = await db.getAllProducts({ onlyApproved: false });
  res.json({ success: true, data: products });
});

apiRouter.post('/admin/products/:id/moderate', AuthService.requireRole('admin'), async (req: Request, res: Response) => {
  const { status, notes } = req.body;
  const product = await db.updateProduct(req.params.id, {
    moderationStatus: status,
    moderationNotes: notes
  });
  res.json({ success: true, data: product });
});

apiRouter.get('/admin/audit-logs', AuthService.requireRole('admin'), async (req: Request, res: Response) => {
  const logs = await db.getAuditLogs();
  res.json({ success: true, data: logs });
});

// --- AUTOMATED INVARIANT TEST RUNNER API ---
apiRouter.post('/tests/run', async (req: Request, res: Response) => {
  const results = await TestRunner.runAllTests();
  res.json({ success: true, data: results });
});
