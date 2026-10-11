/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext.js';
import { formatPaise, formatDate } from '../utils/formatters.js';
import { CheckCircle, Truck, Package, ArrowRight, Store, ShieldCheck } from 'lucide-react';

export const OrderSuccessPage: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { navigate } = useMarketplace();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setOrder(d.data);
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-xs text-stone-500">
        Retrieving order receipt...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-semibold text-stone-900">Order Not Found</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 space-y-8">
      {/* Confirmation Banner */}
      <div className="bg-white p-8 rounded-lg border border-stone-200 text-center space-y-4">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            Payment & Consignment Confirmed
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 mt-1">
            Thank you for patronizing Indian artisans
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-1">
            Order Reference: <strong className="text-stone-900">{order.orderNumber}</strong>
          </p>
        </div>

        <div className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
          A confirmation tax invoice and shipment alerts have been dispatched to <strong>{order.customerEmail}</strong>.
        </div>
      </div>

      {/* Multi-Vendor Split Seller Fulfillments */}
      <div className="bg-white p-6 rounded-lg border border-stone-200 space-y-6">
        <div className="border-b border-stone-100 pb-3">
          <h2 className="font-serif text-base font-semibold text-stone-900">
            Multi-Vendor Fulfillment Groups ({order.sellerOrders.length} Shipments)
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Each artisan workshop prepares, packages, and dispatches their heirloom independently.
          </p>
        </div>

        <div className="space-y-4">
          {order.sellerOrders.map((so: any) => (
            <div key={so.id} className="p-4 bg-stone-50 rounded border border-stone-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-stone-900">
                  <Store className="w-4 h-4 text-amber-800" />
                  <span>{so.storeName}</span>
                  <span className="text-stone-500 font-mono font-normal">({so.sellerOrderNumber})</span>
                </div>
                <span className="text-[11px] font-semibold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                  Status: {so.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-stone-200/60">
                {so.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-xs text-stone-700">
                    <span>{item.quantity}x {item.productTitle}</span>
                    <span className="font-mono tabular-nums font-semibold">{formatPaise(item.lineTotalPaise)}</span>
                  </div>
                ))}
              </div>

              {so.trackingNumber && (
                <div className="text-[11px] text-stone-600 font-mono bg-white p-2 rounded border border-stone-200 flex items-center justify-between">
                  <span>Courier: {so.courierName || 'Delhivery Express'}</span>
                  <span>AWB: <strong>{so.trackingNumber}</strong></span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Address & Price Receipt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded border border-stone-200 space-y-2 text-xs text-stone-700">
          <h3 className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
            Delivery Destination
          </h3>
          <div className="font-medium text-stone-900">{order.shippingAddress.fullName}</div>
          <div>{order.shippingAddress.addressLine1}</div>
          <div>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</div>
          <div className="text-stone-500 font-mono">Mobile: {order.shippingAddress.phone}</div>
        </div>

        <div className="bg-white p-5 rounded border border-stone-200 space-y-2 text-xs text-stone-600">
          <h3 className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
            Financial Settlement
          </h3>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums">{formatPaise(order.subtotalPaise)}</span>
          </div>
          {order.couponDiscountPaise > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Coupon Discount</span>
              <span className="font-mono tabular-nums">-{formatPaise(order.couponDiscountPaise)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="font-mono tabular-nums">
              {order.shippingFeePaise === 0 ? 'FREE' : formatPaise(order.shippingFeePaise)}
            </span>
          </div>
          <div className="pt-2 border-t border-stone-100 flex justify-between font-bold text-stone-900 text-sm">
            <span>Total Paid</span>
            <span className="font-mono tabular-nums">{formatPaise(order.totalPaise)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <button
          onClick={() => navigate('/track-order')}
          className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white font-semibold text-xs rounded hover:bg-stone-800 transition-colors"
        >
          <Truck className="w-4 h-4 text-amber-300" />
          <span>Track Delivery Status</span>
        </button>

        <button
          onClick={() => navigate('/shop')}
          className="px-5 py-2.5 border border-stone-300 text-stone-700 font-semibold text-xs rounded hover:bg-stone-50 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};
