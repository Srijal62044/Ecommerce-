/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'customer' | 'seller' | 'admin' | 'super_admin';

export type SellerStatus = 'pending' | 'under_review' | 'verified' | 'rejected' | 'suspended';

export type ProductModerationStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived';

export type OrderStatus =
  | 'pending_payment'
  | 'payment_failed'
  | 'confirmed'
  | 'processing'
  | 'partially_shipped'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type SellerOrderStatus =
  | 'allocated'
  | 'packed'
  | 'ready_for_pickup'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned';

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod';

export type PaymentStatus = 'created' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'partially_refunded';

export type ReturnStatus =
  | 'requested'
  | 'approved'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'received_in_warehouse'
  | 'inspected_accepted'
  | 'inspected_rejected'
  | 'refund_issued'
  | 'cancelled';

export type LedgerEntryType =
  | 'order_credit'
  | 'commission_debit'
  | 'gst_debit'
  | 'tcs_debit'
  | 'shipping_fee_debit'
  | 'refund_debit'
  | 'commission_reversal_credit'
  | 'payout_debit'
  | 'manual_adjustment';

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  avatarUrl?: string;
  roles: UserRole[];
  isActive: boolean;
  createdAt: string;
}

export interface SellerStore {
  id: string;
  ownerId: string;
  storeName: string;
  slug: string;
  tagline?: string;
  description: string;
  logoUrl?: string;
  bannerUrl?: string;
  businessType: string;
  gstin?: string;
  pan: string;
  status: SellerStatus;
  rejectionReason?: string;
  ratingAvg: number;
  ratingCount: number;
  commissionRateOverride?: number;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  addressType: 'home' | 'work' | 'other';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string;
  imageUrl?: string;
  displayOrder: number;
  defaultCommissionPercent: number;
  gstRatePercent: number;
  isActive: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  title: string;
  options: Record<string, string>;
  pricePaise: number;
  compareAtPricePaise?: number;
}

export interface ProductImage {
  id: string;
  productId: string;
  variantId?: string;
  url: string;
  altText?: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface InventoryRecord {
  id: string;
  productId: string;
  variantId?: string;
  quantityAvailable: number;
  quantityReserved: number;
  lowStockThreshold: number;
  updatedAt: string;
}

export interface Product {
  id: string;
  storeId: string;
  storeName?: string;
  storeSlug?: string;
  categoryId: string;
  categoryName?: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  originRegion: string;
  artisanCraftTechnique: string;
  hsnCode?: string;
  basePricePaise: number;
  compareAtPricePaise?: number;
  isFeatured: boolean;
  moderationStatus: ProductModerationStatus;
  moderationNotes?: string;
  hasVariants: boolean;
  viewsCount: number;
  salesCount: number;
  weightGrams: number;
  variants: ProductVariant[];
  images: ProductImage[];
  inventoryAvailable: number;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  sellerOrderId: string;
  storeId: string;
  storeName?: string;
  productId: string;
  variantId?: string;
  productTitle: string;
  variantTitle?: string;
  sku: string;
  unitPricePaise: number;
  quantity: number;
  lineTotalPaise: number;
  applicableCommissionRate: number;
  commissionAmountPaise: number;
  gstRatePercent: number;
  taxAmountPaise: number;
  imageUrl?: string;
}

export interface SellerOrder {
  id: string;
  orderId: string;
  storeId: string;
  storeName?: string;
  sellerOrderNumber: string;
  status: SellerOrderStatus;
  sellerSubtotalPaise: number;
  sellerCommissionPaise: number;
  sellerTaxPaise: number;
  sellerPayoutAmountPaise: number;
  items: OrderItem[];
  trackingNumber?: string;
  courierName?: string;
  estimatedDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  billingAddress: Address;
  subtotalPaise: number;
  shippingFeePaise: number;
  taxPaise: number;
  couponDiscountPaise: number;
  totalPaise: number;
  status: OrderStatus;
  appliedCouponCode?: string;
  customerNotes?: string;
  sellerOrders: SellerOrder[];
  payment?: {
    id: string;
    method: PaymentMethod;
    status: PaymentStatus;
    gatewayPaymentId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SellerLedgerEntry {
  id: string;
  storeId: string;
  entryType: LedgerEntryType;
  amountPaise: number;
  runningBalancePaise: number;
  referenceType: string;
  referenceId: string;
  description: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'flat_paise';
  discountValue: number;
  minOrderAmountPaise: number;
  maxDiscountPaise?: number;
  usageLimit?: number;
  timesUsed: number;
  validUntil?: string;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  actorId?: string;
  actorEmail?: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
