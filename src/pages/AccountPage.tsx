/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext.js';
import { formatPaise, formatDate } from '../utils/formatters.js';
import { ProductCard } from '../components/common/ProductCard.js';
import { User, Package, MapPin, Heart, RotateCcw, Plus, Trash2, ArrowRight } from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user, wishlist, navigate, showNotification } = useMarketplace();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'returns'>('orders');

  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);

  // Return modal
  const [returnModalItem, setReturnModalItem] = useState<any | null>(null);
  const [returnReason, setReturnReason] = useState('Quality not matching heritage description');
  const [returnComments, setReturnComments] = useState('');

  useEffect(() => {
    // Load orders
    fetch('/api/orders', { headers: { 'x-demo-user-id': user?.id || 'user_customer_01' } })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrders(d.data || []);
      });

    // Load products for wishlist
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const all = d.data || [];
          setWishlistProducts(all.filter((p: any) => wishlist.includes(p.id)));
        }
      });

    // Default addresses
    setAddresses([
      {
        id: 'addr_mumbai_01',
        fullName: user?.fullName || 'Srijal Kumar',
        phone: user?.phone || '+91 98110 99887',
        addressLine1: 'B-402, Sea Green Heights, Worli Sea Face',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400018',
        country: 'India',
        isDefault: true,
        addressType: 'home'
      },
      {
        id: 'addr_blr_02',
        fullName: (user?.fullName || 'Srijal Kumar') + ' (Office)',
        phone: user?.phone || '+91 98110 99887',
        addressLine1: 'Suite 601, Embassy Golf Links Business Park',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560071',
        country: 'India',
        isDefault: false,
        addressType: 'work'
      }
    ]);
  }, [user, wishlist]);

  const handleInitiateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalItem) return;

    showNotification(`Return requested for "${returnModalItem.productTitle}". Reverse pickup initiated.`);
    setReturns((prev) => [
      ...prev,
      {
        id: `ret_${Date.now()}`,
        productTitle: returnModalItem.productTitle,
        reason: returnReason,
        status: 'pickup_scheduled',
        amountPaise: returnModalItem.lineTotalPaise
      }
    ]);
    setReturnModalItem(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-stone-900 text-amber-300 flex items-center justify-center font-serif text-2xl font-bold">
            {user?.fullName?.charAt(0) || 'S'}
          </div>
          <div>
            <h1 className="font-serif text-2xl font-semibold text-stone-900">{user?.fullName || 'Srijal Kumar'}</h1>
            <div className="text-xs text-stone-500 font-mono mt-0.5">
              {user?.email} · {user?.phone || '+91 98110 99887'}
            </div>
            <div className="text-xs text-amber-900 font-medium mt-1">
              Collector Tier: Verified Artisan Patron
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'orders'
              ? 'border-amber-900 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Purchases ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 px-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'addresses'
              ? 'border-amber-900 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Saved Addresses ({addresses.length})
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 px-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'wishlist'
              ? 'border-amber-900 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Wishlist ({wishlistProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`pb-3 px-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'returns'
              ? 'border-amber-900 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Returns & Disputes ({returns.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white p-12 text-center rounded border border-stone-200">
              <p className="font-serif text-base text-stone-900 font-semibold">No purchases recorded yet</p>
              <button
                onClick={() => navigate('/shop')}
                className="mt-3 px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded"
              >
                Explore Heirlooms
              </button>
            </div>
          ) : (
            orders.map((ord) => (
              <div key={ord.id} className="bg-white p-6 rounded border border-stone-200 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between text-xs pb-3 border-b border-stone-100 gap-2">
                  <div>
                    <span className="font-mono font-semibold text-stone-900">{ord.orderNumber}</span>
                    <span className="text-stone-500 ml-2">Placed on {formatDate(ord.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-stone-900 font-mono tabular-nums">
                      {formatPaise(ord.totalPaise)}
                    </span>
                    <span className="text-[11px] font-semibold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      {ord.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Seller Groups */}
                <div className="space-y-3">
                  {ord.sellerOrders.map((so: any) => (
                    <div key={so.id} className="p-3 bg-stone-50 rounded border border-stone-100 space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-stone-800">
                        <span>Fulfillment: {so.storeName} ({so.sellerOrderNumber})</span>
                        <span className="text-stone-500 uppercase text-[11px]">{so.status.replace('_', ' ')}</span>
                      </div>

                      {so.items.map((i: any) => (
                        <div key={i.id} className="flex justify-between items-center text-xs text-stone-700">
                          <div>
                            <span className="font-medium text-stone-900">{i.quantity}x {i.productTitle}</span>
                            {i.variantTitle && <span className="text-stone-500 text-[11px]"> ({i.variantTitle})</span>}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-mono font-semibold">{formatPaise(i.lineTotalPaise)}</span>
                            <button
                              onClick={() => setReturnModalItem(i)}
                              className="text-stone-500 hover:text-amber-900 text-[11px] underline cursor-pointer"
                            >
                              Request Return
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white p-5 rounded border border-stone-200 text-xs space-y-1 relative">
              <div className="font-semibold text-stone-900 flex items-center justify-between">
                <span>{addr.fullName}</span>
                {addr.isDefault && (
                  <span className="text-[10px] text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded font-semibold">
                    DEFAULT
                  </span>
                )}
              </div>
              <div className="text-stone-700">{addr.addressLine1}</div>
              <div className="text-stone-700">{addr.city}, {addr.state} - {addr.pincode}</div>
              <div className="text-stone-500 font-mono text-[11px]">Phone: {addr.phone}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div>
          {wishlistProducts.length === 0 ? (
            <div className="bg-white p-12 text-center rounded border border-stone-200">
              <p className="font-serif text-base text-stone-900 font-semibold">No saved heirlooms yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="space-y-4">
          {returns.length === 0 ? (
            <div className="bg-white p-12 text-center rounded border border-stone-200 text-xs text-stone-500">
              No active return or refund requests. All past consignments fulfilled successfully.
            </div>
          ) : (
            returns.map((ret) => (
              <div key={ret.id} className="bg-white p-5 rounded border border-stone-200 text-xs space-y-1">
                <div className="flex justify-between font-semibold text-stone-900">
                  <span>{ret.productTitle}</span>
                  <span className="text-amber-800 uppercase text-[11px]">{ret.status.replace('_', ' ')}</span>
                </div>
                <div className="text-stone-500">Reason: {ret.reason}</div>
                <div className="font-mono text-stone-700">Refund Amount: {formatPaise(ret.amountPaise)}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Return Request Modal */}
      {returnModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-lg max-w-md w-full border border-stone-200 space-y-4">
            <h3 className="font-serif text-base font-semibold text-stone-900">
              Initiate Return for {returnModalItem.productTitle}
            </h3>
            <p className="text-xs text-stone-600">
              7-Day doorstep pickup with automatic refund adjustment into your source account.
            </p>

            <form onSubmit={handleInitiateReturn} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Reason for Return</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded"
                >
                  <option>Weave / finish defect</option>
                  <option>Size or dimension mismatch</option>
                  <option>Transit packaging damaged</option>
                  <option>Authenticity clarification</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Comments for Artisan</label>
                <textarea
                  value={returnComments}
                  onChange={(e) => setReturnComments(e.target.value)}
                  placeholder="Detail the issue..."
                  rows={3}
                  className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnModalItem(null)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-stone-900 text-white rounded hover:bg-stone-800"
                >
                  Confirm Reverse Pickup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
