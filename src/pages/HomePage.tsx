/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext.js';
import { ProductCard } from '../components/common/ProductCard.js';
import { CraftShowcase3D } from '../components/3d/CraftShowcase3D.js';
import { ArrowRight, Compass, Sparkles, Award } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigate } = useMarketplace();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setFeaturedProducts(d.data || []);
      })
      .catch(() => {});

    fetch('/api/categories')
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setCategories(d.data || []);
      })
      .catch(() => {});

    fetch('/api/stores')
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setStores(d.data || []);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Storefront Hero: Bold Campaign Focal Point */}
      <section className="relative bg-stone-900 text-stone-100 overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/40 via-stone-900 to-stone-950 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20 lg:py-28 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>National Artisan Multi-Vendor Marketplace</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-stone-100 leading-[1.15]">
              Living Heritage of India, <br />
              <span className="italic font-light text-amber-200">Direct from Master Hands.</span>
            </h1>

            <p className="text-base text-stone-300 max-w-xl leading-relaxed font-light">
              Connecting sovereign Indian weaver guilds, 4000-year-old tribal bronze metallurgists, and classical botanical apothecaries directly with discerning collectors worldwide.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/shop')}
                className="flex items-center gap-2 px-6 py-3.5 bg-amber-400 text-stone-950 font-semibold text-xs tracking-wider uppercase rounded hover:bg-amber-300 transition-colors shadow-sm cursor-pointer"
              >
                <span>Explore the Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/category/handloom-textiles')}
                className="px-6 py-3.5 border border-stone-700 text-stone-200 font-medium text-xs tracking-wider uppercase rounded hover:border-stone-500 hover:text-white transition-colors cursor-pointer"
              >
                GI Handloom Silks
              </button>
            </div>

            {/* Quiet Provenance Strip */}
            <div className="pt-8 border-t border-stone-800 flex items-center gap-6 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>GI Certified Clusters</span>
              </div>
              <span aria-hidden="true" className="text-stone-700">·</span>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Traceable Provenance</span>
              </div>
              <span aria-hidden="true" className="text-stone-700">·</span>
              <span>Auditable Fair Payouts</span>
            </div>
          </div>

          {/* Hero Visual: Direct 3D Craft Interactive Showcase Module */}
          <div className="lg:col-span-5">
            <CraftShowcase3D />
          </div>
        </div>
      </section>

      {/* 2. Featured Artisanal Collections Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pb-4 border-b border-stone-200">
          <div>
            <div className="text-xs uppercase tracking-widest text-amber-900 font-semibold mb-1">
              Curated Heirlooms
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">
              Masterpiece Crafts of India
            </h2>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:text-amber-950 uppercase tracking-wider transition-colors cursor-pointer"
          >
            <span>View All Works ({featuredProducts.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredProducts.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 3. Verified Multi-Vendor Artisan Guilds Spotlight */}
      <section className="bg-stone-100 py-16 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-2xl mb-10">
            <span className="text-xs uppercase tracking-widest text-amber-900 font-semibold">
              Autonomous Producer Collectives
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 mt-1">
              Verified Artisan Guilds
            </h2>
            <p className="text-sm text-stone-600 mt-2 leading-relaxed">
              Every seller on Sutradhar undergoes strict verification of heritage craftsmanship, GI registration certificates, and fair-wage ledger compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div
                key={store.id}
                onClick={() => navigate(`/seller/${store.slug}`)}
                className="bg-white p-6 rounded border border-stone-200 flex flex-col justify-between hover:shadow-sm hover:border-stone-300 transition-all cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                    <span className="font-semibold text-amber-800 uppercase tracking-wider text-[11px]">
                      {store.businessType.replace('_', ' ')}
                    </span>
                    <span className="tabular-nums">★ {store.ratingAvg.toFixed(2)} ({store.ratingCount})</span>
                  </div>

                  <h3 className="font-serif text-lg font-semibold text-stone-900 hover:text-amber-900 transition-colors">
                    {store.storeName}
                  </h3>

                  <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed">
                    {store.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-900">
                  <span className="text-[11px] text-stone-500">GST: {store.gstin || 'Registered'}</span>
                  <span className="text-amber-900 flex items-center gap-1">
                    Enter Guild Store <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
