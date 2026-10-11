/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext.js';
import { ProductCard } from '../components/common/ProductCard.js';
import { Store, MapPin, Award, ShieldCheck } from 'lucide-react';

export const StorePage: React.FC<{ slug: string }> = ({ slug }) => {
  const { navigate } = useMarketplace();
  const [storeData, setStoreData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/stores/${slug}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setStoreData(d.data);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-stone-500">
        Loading artisan guild store...
      </div>
    );
  }

  if (!storeData || !storeData.store) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-semibold text-stone-900">Guild Not Found</h2>
        <button
          onClick={() => navigate('/shop')}
          className="mt-4 px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded"
        >
          Return to All Crafts
        </button>
      </div>
    );
  }

  const { store, products } = storeData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-12">
      {/* Guild Store Banner & Provenance */}
      <div className="bg-stone-900 text-stone-100 p-8 sm:p-12 rounded-lg border border-stone-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-400 font-semibold mb-2">
              <Award className="w-4 h-4" />
              <span>Verified Artisan Guild</span>
              <span aria-hidden="true" className="text-stone-600">·</span>
              <span className="text-stone-300 font-mono text-[11px]">GST: {store.gstin || 'Registered'}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-100">
              {store.storeName}
            </h1>
            <p className="text-sm text-amber-200/90 font-light italic mt-1">
              &quot;{store.tagline || 'Master Crafts of India'}&quot;
            </p>
          </div>

          <div className="bg-stone-800/80 p-4 rounded border border-stone-700 text-right shrink-0">
            <div className="text-xl font-bold font-mono text-amber-300">
              ★ {store.ratingAvg.toFixed(2)}
            </div>
            <div className="text-xs text-stone-400 mt-0.5">{store.ratingCount} collector reviews</div>
          </div>
        </div>

        <p className="text-xs text-stone-300 max-w-3xl leading-relaxed">
          {store.description}
        </p>

        <div className="pt-4 border-t border-stone-800 flex items-center gap-6 text-xs text-stone-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" /> Direct-to-Artisan Verified Payouts
          </span>
          <span aria-hidden="true" className="text-stone-700">·</span>
          <span>Authentic Handloom / Lost-Wax Origin</span>
        </div>
      </div>

      {/* Guild Catalog */}
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-stone-200">
          <h2 className="font-serif text-xl font-semibold text-stone-900">
            Works Produced by {store.storeName}
          </h2>
          <span className="text-xs text-stone-500 font-mono tabular-nums">
            {products.length} Heirlooms
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {products.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
};
