/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext.js';
import { formatPaise } from '../utils/formatters.js';
import { Search, Truck, CheckCircle2, PackageCheck, Clock, MapPin, Store } from 'lucide-react';

export const TrackOrderPage: React.FC = () => {
  const { navigate } = useMarketplace();
  const [orderQuery, setOrderQuery] = useState('');
  const [order, setOrder] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/orders/${orderQuery.trim()}`);
      const d = await res.json();
      if (d.success) {
        setOrder(d.data);
      } else {
        setOrder(null);
      }
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: 'Order Confirmed', desc: 'Atomic inventory reserved & verified', done: true },
    { label: 'Artisan Workshop Packaging', desc: 'Prepared with archival muslin & tamper wrap', done: true },
    { label: 'Courier Handover (Delhivery)', desc: 'Consignment scanned at regional hub', done: true },
    { label: 'In Transit to Destination City', desc: 'Air cargo transit to local hub', done: order?.status === 'delivered' || order?.status === 'shipped' },
    { label: 'Out for Doorstep Delivery', desc: 'Courier agent allocated with security OTP', done: order?.status === 'delivered' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      <div className="border-b border-stone-200 pb-4 text-center">
        <h1 className="font-serif text-3xl font-semibold text-stone-900">
          Consignment Tracking Desk
        </h1>
        <p className="text-xs text-stone-600 mt-1 max-w-lg mx-auto">
          Monitor your handcrafted consignments across Delhivery Express and Blue Dart networks in real time.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleTrackSubmit} className="max-w-xl mx-auto flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            placeholder="Enter Order Number (e.g. STD-2026-8812 or ord_...)"
            className="w-full px-4 py-2.5 text-xs bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800 font-mono"
          />
          <Search className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-stone-900 text-white font-semibold text-xs rounded hover:bg-stone-800 transition-colors cursor-pointer"
        >
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {/* Results */}
      {searched && (
        <div className="space-y-8">
          {order ? (
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-900">
                    Order {order.orderNumber}
                  </span>
                  <div className="text-xs text-stone-500 mt-0.5">
                    Destination: {order.shippingAddress.city}, {order.shippingAddress.state} ({order.shippingAddress.pincode})
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold uppercase bg-amber-100 text-amber-900 px-3 py-1 rounded">
                    Overall Status: {order.status.replace('_', ' ')}
                  </span>
                  <div className="text-xs text-stone-500 font-mono mt-1">
                    Value: {formatPaise(order.totalPaise)}
                  </div>
                </div>
              </div>

              {/* Progress Milestones */}
              <div className="space-y-6">
                <h3 className="font-serif text-base font-semibold text-stone-900">
                  Consignment Milestone Progress
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {steps.map((st, idx) => (
                    <div
                      key={st.label}
                      className={`p-3 rounded border text-xs space-y-1 ${
                        st.done
                          ? 'border-emerald-300 bg-emerald-50/50 text-emerald-950 font-medium'
                          : 'border-stone-200 bg-stone-50 text-stone-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-semibold">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${st.done ? 'text-emerald-700' : 'text-stone-300'}`} />
                        <span>Step 0{idx + 1}</span>
                      </div>
                      <div className="font-semibold text-stone-900">{st.label}</div>
                      <p className="text-[11px] text-stone-500 leading-tight">{st.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-Vendor Seller Fulfillment Consignments */}
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <h3 className="font-serif text-base font-semibold text-stone-900">
                  Individual Workshop Shipments ({order.sellerOrders.length})
                </h3>

                <div className="space-y-3">
                  {order.sellerOrders.map((so: any) => (
                    <div key={so.id} className="p-4 bg-stone-50 rounded border border-stone-200 flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900">
                          <Store className="w-3.5 h-3.5 text-amber-800" />
                          <span>{so.storeName}</span>
                          <span className="text-stone-500 font-mono">({so.sellerOrderNumber})</span>
                        </div>
                        <div className="text-xs text-stone-600 mt-1">
                          Items: {so.items.map((i: any) => `${i.quantity}x ${i.productTitle}`).join(', ')}
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <span className="font-semibold text-stone-900 uppercase">
                          {so.status.replace('_', ' ')}
                        </span>
                        <div className="text-stone-500 font-mono mt-0.5">
                          AWB: {so.trackingNumber || 'Awaiting Dispatch'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded border border-stone-200">
              <p className="font-serif text-base font-semibold text-stone-900">Consignment Not Found</p>
              <p className="text-xs text-stone-500 mt-1">
                Please double-check your order number or check your order history in your account.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
