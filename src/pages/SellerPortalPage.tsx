/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext.js';
import { formatPaise, formatDate } from '../utils/formatters.js';
import { Store, Package, Plus, Truck, Banknote, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const SellerPortalPage: React.FC = () => {
  const { user, showNotification } = useMarketplace();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'ledger'>('orders');

  const [store, setStore] = useState<any | null>(null);
  const [sellerOrders, setSellerOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [balancePaise, setBalancePaise] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // New Product Modal
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [newProd, setNewProd] = useState({
    title: '',
    description: '',
    categoryId: 'cat_textiles',
    basePriceRupees: 4500,
    originRegion: 'Varanasi, UP',
    artisanCraftTechnique: 'Kadhwa Brocade Weave',
    inventoryAvailable: 10
  });

  // Shipping Modal
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [courierName, setCourierName] = useState('Delhivery Express');
  const [awbNumber, setAwbNumber] = useState('');

  const loadSellerData = async () => {
    setLoading(true);
    try {
      const headers = { 'x-demo-user-id': user?.id || 'user_seller_01' };

      const [storeRes, ordRes, ldgRes] = await Promise.all([
        fetch('/api/seller/store', { headers }),
        fetch('/api/seller/orders', { headers }),
        fetch('/api/seller/ledger', { headers })
      ]);

      const storeData = await storeRes.json();
      const ordData = await ordRes.json();
      const ldgData = await ldgRes.json();

      if (storeData.success) {
        setStore(storeData.data);
        // Load store products
        const prodsRes = await fetch(`/api/products?store=${storeData.data.slug}&onlyApproved=false`);
        const prodsData = await prodsRes.json();
        if (prodsData.success) setProducts(prodsData.data || []);
      }

      if (ordData.success) setSellerOrders(ordData.data || []);
      if (ldgData.success) {
        setLedger(ldgData.data.ledger || []);
        setBalancePaise(ldgData.data.balancePaise || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellerData();
  }, [user]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.title.trim()) return;

    try {
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-user-id': user?.id || 'user_seller_01'
        },
        body: JSON.stringify({
          ...newProd,
          basePricePaise: Number(newProd.basePriceRupees) * 100
        })
      });
      const d = await res.json();
      if (d.success) {
        showNotification(`Product "${d.data.title}" submitted for admin GI quality check`);
        setIsCreatingProduct(false);
        loadSellerData();
      }
    } catch {
      showNotification('Failed to create product');
    }
  };

  const handleDispatchOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingOrderId) return;

    try {
      const res = await fetch(`/api/seller/orders/${shippingOrderId}/ship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-user-id': user?.id || 'user_seller_01'
        },
        body: JSON.stringify({
          trackingNumber: awbNumber || `DEL-${Math.floor(10000000 + Math.random() * 90000000)}`,
          courierName,
          status: 'in_transit'
        })
      });
      const d = await res.json();
      if (d.success) {
        showNotification('Order marked as In Transit with courier AWB tracking assigned');
        setShippingOrderId(null);
        setAwbNumber('');
        loadSellerData();
      }
    } catch {
      showNotification('Failed to update shipment status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-stone-500">
        Loading artisan seller portal...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Store Profile Card */}
      <div className="bg-stone-900 text-stone-100 p-6 sm:p-8 rounded-lg border border-stone-800 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
            <Store className="w-4 h-4" />
            <span>Artisan Collective Portal</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-100">
            {store?.storeName || 'Artisan Workshop'}
          </h1>
          <p className="text-xs text-stone-400 max-w-xl mt-1 leading-relaxed">
            {store?.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-stone-400 mt-4 font-mono">
            <span>GSTIN: <strong className="text-stone-200">{store?.gstin || '22AAECP1122D1ZQ'}</strong></span>
            <span aria-hidden="true">·</span>
            <span>PAN: <strong className="text-stone-200">{store?.pan || 'AAECP1122D'}</strong></span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-semibold uppercase">✓ GI Verified Partner</span>
          </div>
        </div>

        {/* Financial Balance Callout */}
        <div className="bg-stone-800/80 p-5 rounded border border-stone-700/80 flex flex-col justify-between text-right shrink-0">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
              Net Payable Balance
            </div>
            <div className="text-2xl font-bold text-amber-300 font-mono tabular-nums mt-1">
              {formatPaise(balancePaise)}
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              Net of platform fees, GST (18%) & TCS (1%)
            </div>
          </div>

          <button
            onClick={() => showNotification('Payout settlement queued for next banking clearance cycle')}
            className="mt-4 px-4 py-2 bg-amber-400 text-stone-950 font-semibold text-xs rounded hover:bg-amber-300 transition-colors cursor-pointer"
          >
            Request Payout Settlement
          </button>
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
          Consignments to Fulfill ({sellerOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'products'
              ? 'border-amber-900 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Artisanal Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 px-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'ledger'
              ? 'border-amber-900 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Auditable Financial Ledger ({ledger.length})
        </button>
      </div>

      {/* Tab 1: Orders to Fulfill */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {sellerOrders.length === 0 ? (
            <div className="bg-white p-12 text-center rounded border border-stone-200 text-xs text-stone-500">
              No outstanding customer orders for your store at this moment.
            </div>
          ) : (
            sellerOrders.map((so) => (
              <div key={so.id} className="bg-white p-6 rounded border border-stone-200 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between text-xs pb-3 border-b border-stone-100 gap-2">
                  <div>
                    <span className="font-mono font-semibold text-stone-900 text-sm">{so.sellerOrderNumber}</span>
                    <span className="text-stone-500 ml-2">Allocated {formatDate(so.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      {so.status.replace('_', ' ')}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-stone-900">
                      Net Payout: {formatPaise(so.sellerPayoutAmountPaise)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {so.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-xs text-stone-700">
                      <div>
                        <strong>{item.quantity}x</strong> {item.productTitle}
                        {item.variantTitle && <span className="text-stone-500"> ({item.variantTitle})</span>}
                      </div>
                      <div className="font-mono tabular-nums">{formatPaise(item.lineTotalPaise)}</div>
                    </div>
                  ))}
                </div>

                {/* Shipping & Fulfillment Controls */}
                <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="text-stone-500 font-mono text-[11px]">
                    {so.trackingNumber ? (
                      <span>Courier: {so.courierName} · AWB: <strong>{so.trackingNumber}</strong></span>
                    ) : (
                      <span>Awaiting Consignment Dispatch</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {so.status === 'allocated' && (
                      <button
                        onClick={() => {
                          setShippingOrderId(so.id);
                          setAwbNumber(`DEL-${Math.floor(10000000 + Math.random() * 90000000)}`);
                        }}
                        className="px-3 py-1.5 bg-stone-900 text-white font-semibold text-xs rounded hover:bg-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5 text-amber-300" />
                        <span>Dispatch & Assign Courier</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Product Management */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded border border-stone-200">
            <span className="text-xs text-stone-600">
              Showing <strong className="text-stone-900">{products.length}</strong> mastercraft works
            </span>
            <button
              onClick={() => setIsCreatingProduct(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 text-white font-semibold text-xs rounded hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Add New Handcraft</span>
            </button>
          </div>

          <div className="bg-white rounded border border-stone-200 divide-y divide-stone-100">
            {products.map((p) => (
              <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div>
                  <h4 className="font-semibold text-stone-900 text-sm">{p.title}</h4>
                  <div className="text-stone-500 mt-0.5">
                    {p.artisanCraftTechnique} · {p.originRegion}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-mono tabular-nums font-semibold text-stone-900 text-sm">
                      {formatPaise(p.basePricePaise)}
                    </div>
                    <div className="text-[11px] text-stone-500">Stock: {p.inventoryAvailable}</div>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                      p.moderationStatus === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {p.moderationStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Auditable Ledger */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded border border-stone-200 overflow-hidden space-y-4">
          <div className="p-4 bg-stone-50 border-b border-stone-200 text-xs text-stone-600">
            Statutory multi-vendor ledger enforcing 12% category commission, 18% GST on marketplace commission, and 1% TCS under Sec 52 CGST Act.
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 font-semibold uppercase tracking-wider text-[11px] border-b border-stone-200">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-right">Debit / Credit</th>
                  <th className="p-3 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {ledger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-stone-50">
                    <td className="p-3 text-stone-500">{formatDate(entry.createdAt)}</td>
                    <td className="p-3 font-sans text-stone-800">{entry.description}</td>
                    <td className="p-3 text-stone-500 uppercase text-[10px] font-sans">
                      {entry.entryType.replace('_', ' ')}
                    </td>
                    <td
                      className={`p-3 text-right tabular-nums font-semibold ${
                        entry.amountPaise >= 0 ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {entry.amountPaise >= 0 ? '+' : ''}
                      {formatPaise(entry.amountPaise)}
                    </td>
                    <td className="p-3 text-right tabular-nums text-stone-900 font-bold">
                      {formatPaise(entry.runningBalancePaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      {isCreatingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full border border-stone-200 space-y-4">
            <h3 className="font-serif text-lg font-semibold text-stone-900">
              Submit Handcraft for Quality Moderation
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newProd.title}
                  onChange={(e) => setNewProd({ ...newProd, title: e.target.value })}
                  placeholder="e.g. Pure Degi Silk Handloom Dupatta"
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Craft Technique</label>
                <input
                  type="text"
                  value={newProd.artisanCraftTechnique}
                  onChange={(e) => setNewProd({ ...newProd, artisanCraftTechnique: e.target.value })}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    value={newProd.basePriceRupees}
                    onChange={(e) => setNewProd({ ...newProd, basePriceRupees: Number(e.target.value) })}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Initial Reserve Stock</label>
                  <input
                    type="number"
                    value={newProd.inventoryAvailable}
                    onChange={(e) => setNewProd({ ...newProd, inventoryAvailable: Number(e.target.value) })}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Artisan Heritage Story</label>
                <textarea
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  rows={3}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingProduct(false)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold bg-stone-900 text-white rounded hover:bg-stone-800"
                >
                  Submit for GI Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {shippingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-lg max-w-md w-full border border-stone-200 space-y-4">
            <h3 className="font-serif text-base font-semibold text-stone-900">
              Dispatch Consignment with Express Courier
            </h3>

            <form onSubmit={handleDispatchOrder} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Logistics Partner</label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded"
                >
                  <option>Delhivery Express Air</option>
                  <option>Blue Dart Apex</option>
                  <option>Shiprocket Surface</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Airway Bill (AWB) / Tracking Number</label>
                <input
                  type="text"
                  value={awbNumber}
                  onChange={(e) => setAwbNumber(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShippingOrderId(null)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold bg-stone-900 text-white rounded hover:bg-stone-800"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
