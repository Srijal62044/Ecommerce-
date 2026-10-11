/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Multi-Vendor Split Order Service
 */

import { db } from '../db/adapter.js';
import { FinanceService } from './financeService.js';
import {
  Order,
  SellerOrder,
  OrderItem,
  Address,
  OrderStatus,
  SellerOrderStatus,
  PaymentMethod
} from '../types.js';

export interface CheckoutItemRequest {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface CreateOrderRequest {
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  billingAddress: Address;
  items: CheckoutItemRequest[];
  paymentMethod: PaymentMethod;
  couponCode?: string;
  customerNotes?: string;
}

export class OrderService {
  /**
   * Create an order with atomic stock reservation and multi-vendor split fulfillment
   */
  public static async createOrder(req: CreateOrderRequest): Promise<Order> {
    if (!req.items || req.items.length === 0) {
      throw new Error('Order items cannot be empty');
    }

    // 1. ATOMIC INVENTORY RESERVATION (Fails immediately without overselling)
    await db.reserveInventory(req.items);

    try {
      const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const orderNumber = `STD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      // 2. Fetch and snapshot items
      let subtotalPaise = 0;
      let totalTaxPaise = 0;
      const itemsByStore: Map<string, OrderItem[]> = new Map();

      for (const reqItem of req.items) {
        const product = await db.getProductById(reqItem.productId);
        if (!product) {
          throw new Error(`Product ${reqItem.productId} not found during processing`);
        }

        const category = await db.getAllCategories().then((cats) => cats.find((c) => c.id === product.categoryId));
        const store = await db.getStoreById(product.storeId);
        if (!store) {
          throw new Error(`Store ${product.storeId} not found`);
        }

        // Determine price: variant price or base price
        let unitPricePaise = product.basePricePaise;
        let variantTitle: string | undefined;
        let sku = product.slug;

        if (reqItem.variantId) {
          const variant = product.variants.find((v) => v.id === reqItem.variantId);
          if (variant) {
            unitPricePaise = variant.pricePaise;
            variantTitle = variant.title;
            sku = variant.sku;
          }
        }

        const lineTotalPaise = unitPricePaise * reqItem.quantity;
        subtotalPaise += lineTotalPaise;

        // Commission snapshot
        const commissionRate = store.commissionRateOverride ?? category?.defaultCommissionPercent ?? 10.0;
        const commissionBreakdown = FinanceService.calculateCommission(lineTotalPaise, commissionRate);

        // GST calculation snapshot (Default 12% GST)
        const gstRatePercent = category?.gstRatePercent ?? 12.0;
        const taxAmountPaise = Math.round((lineTotalPaise * gstRatePercent) / (100 + gstRatePercent)); // Inclusive GST
        totalTaxPaise += taxAmountPaise;

        const orderItemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const orderItem: OrderItem = {
          id: orderItemId,
          orderId,
          sellerOrderId: '', // Assigned below
          storeId: product.storeId,
          storeName: store.storeName,
          productId: product.id,
          variantId: reqItem.variantId,
          productTitle: product.title,
          variantTitle,
          sku,
          unitPricePaise,
          quantity: reqItem.quantity,
          lineTotalPaise,
          applicableCommissionRate: commissionRate,
          commissionAmountPaise: commissionBreakdown.commissionPaise,
          gstRatePercent,
          taxAmountPaise,
          imageUrl: product.images[0]?.url || ''
        };

        const storeItems = itemsByStore.get(product.storeId) || [];
        storeItems.push(orderItem);
        itemsByStore.set(product.storeId, storeItems);
      }

      // 3. Coupon Discount Calculation
      let couponDiscountPaise = 0;
      if (req.couponCode) {
        const coupon = await db.getCouponByCode(req.couponCode);
        if (coupon && coupon.isActive) {
          if (subtotalPaise >= coupon.minOrderAmountPaise) {
            if (coupon.discountType === 'percentage') {
              couponDiscountPaise = Math.round((subtotalPaise * coupon.discountValue) / 100);
              if (coupon.maxDiscountPaise && couponDiscountPaise > coupon.maxDiscountPaise) {
                couponDiscountPaise = coupon.maxDiscountPaise;
              }
            } else {
              couponDiscountPaise = coupon.discountValue;
            }
            await db.incrementCouponUsage(coupon.id);
          }
        }
      }

      // Shipping fee calculation: Free shipping above ₹1,000 (100,000 paise), else ₹99 (9,900 paise)
      const shippingFeePaise = subtotalPaise >= 100000 ? 0 : 9900;
      const totalPaise = Math.max(0, subtotalPaise - couponDiscountPaise + shippingFeePaise);

      // 4. Create Seller Fulfillment Groups
      const sellerOrders: SellerOrder[] = [];
      let sellerIdx = 1;

      for (const [storeId, storeItems] of itemsByStore.entries()) {
        const sellerOrderId = `so_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const sellerOrderNumber = `${orderNumber}-S${sellerIdx++}`;
        const store = await db.getStoreById(storeId);

        let sellerSubtotal = 0;
        let sellerCommission = 0;
        let sellerTax = 0;

        for (const item of storeItems) {
          item.sellerOrderId = sellerOrderId;
          sellerSubtotal += item.lineTotalPaise;
          sellerCommission += item.commissionAmountPaise;
          sellerTax += item.taxAmountPaise;
        }

        const sellerPayout = Math.max(0, sellerSubtotal - sellerCommission - Math.round(sellerCommission * 0.18) - Math.round(sellerSubtotal * 0.01));

        const sellerOrder: SellerOrder = {
          id: sellerOrderId,
          orderId,
          storeId,
          storeName: store?.storeName || 'Artisan Guild',
          sellerOrderNumber,
          status: 'allocated',
          sellerSubtotalPaise: sellerSubtotal,
          sellerCommissionPaise: sellerCommission,
          sellerTaxPaise: sellerTax,
          sellerPayoutAmountPaise: sellerPayout,
          items: storeItems,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        sellerOrders.push(sellerOrder);
      }

      const initialStatus: OrderStatus = req.paymentMethod === 'cod' ? 'confirmed' : 'pending_payment';

      const order: Order = {
        id: orderId,
        orderNumber,
        customerId: req.customerId,
        customerEmail: req.customerEmail,
        customerPhone: req.customerPhone,
        shippingAddress: req.shippingAddress,
        billingAddress: req.billingAddress,
        subtotalPaise,
        shippingFeePaise,
        taxPaise: totalTaxPaise,
        couponDiscountPaise,
        totalPaise,
        status: initialStatus,
        appliedCouponCode: req.couponCode,
        customerNotes: req.customerNotes,
        sellerOrders,
        payment: {
          id: `pay_${Date.now()}`,
          method: req.paymentMethod,
          status: req.paymentMethod === 'cod' ? 'captured' : 'created'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await db.createOrder(order);

      // If COD, credit seller ledger immediately on confirmed status
      if (req.paymentMethod === 'cod') {
        for (const so of sellerOrders) {
          for (const item of so.items) {
            await FinanceService.recordOrderLedger(item, order.orderNumber);
          }
        }
      }

      await db.logAudit({
        actorId: req.customerId,
        actorEmail: req.customerEmail,
        action: 'ORDER_CREATED',
        entityType: 'ORDER',
        entityId: order.id,
        details: { orderNumber: order.orderNumber, totalPaise, sellerCount: sellerOrders.length, paymentMethod: req.paymentMethod }
      });

      return order;
    } catch (err) {
      // Release reserved stock on error
      await db.releaseInventory(req.items);
      throw err;
    }
  }
}
