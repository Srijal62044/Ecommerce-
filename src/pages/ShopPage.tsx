/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext.js';
import { ProductCard } from '../components/common/ProductCard.js';
import { Filter, SlidersHorizontal, Search, RotateCcw } from 'lucide-react';

export const ShopPage: React.FC = () => {
  const { currentPath } = useMarketplace();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(50000); // in Rupees
  const [sortOption, setSortOption] = useState<string>('featured');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);

  // Read URL query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) setSearchQuery(q);

    // If path is /category/:slug
    if (currentPath.startsWith('/category/')) {
      const slug = currentPath.replace('/category/', '');
      setSelectedCategory(slug);
    }
  }, [currentPath]);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/stores').then((r) => r.json())
    ]).then(([catData, storeData]) => {
      if (catData.success) setCategories(catData.data || []);
      if (storeData.success) setStores(storeData.data || []);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = `/api/products?sort=${sortOption}&maxPrice=${maxPrice}`;
    if (selectedCategory) url += `&category=${selectedCategory}`;
    if (selectedStore) url += `&store=${selectedStore}`;
    if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

    fetch(url)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) {
          let list = d.data || [];
          if (onlyInStock) {
            list = list.filter((p: any) => p.inventoryAvailable > 0);
          }
          setProducts(list);
        }
      })
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedStore, searchQuery, maxPrice, sortOption, onlyInStock]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedStore('');
    setSearchQuery('');
    setMaxPrice(50000);
    setSortOption('featured');
    setOnlyInStock(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      {/* Header and Breadcrumbs */}
      <div className="mb-8 pb-6 border-b border-stone-200">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900">
          Artisanal Catalog
        </h1>
        <p className="text-sm text-stone-600 mt-1 max-w-2xl">
          Authentic GI-certified works from across 28 states and union territories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 bg-white p-5 rounded border border-stone-200 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <span className="text-xs uppercase tracking-wider font-semibold text-stone-900 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Search */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Search Craft
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search motifs, region, craft..."
                className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Craft Category
            </label>
            <div className="space-y-1.5 text-xs text-stone-700">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left py-1 px-2 rounded transition-colors ${
                  selectedCategory === '' ? 'bg-amber-100/70 font-semibold text-amber-900' : 'hover:bg-stone-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`w-full text-left py-1 px-2 rounded transition-colors ${
                    selectedCategory === c.slug ? 'bg-amber-100/70 font-semibold text-amber-900' : 'hover:bg-stone-50'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Guild / Seller */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Artisan Guild
            </label>
            <div className="space-y-1.5 text-xs text-stone-700">
              <button
                onClick={() => setSelectedStore('')}
                className={`w-full text-left py-1 px-2 rounded transition-colors ${
                  selectedStore === '' ? 'bg-amber-100/70 font-semibold text-amber-900' : 'hover:bg-stone-50'
                }`}
              >
                All Guilds
              </button>
              {stores.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStore(s.slug)}
                  className={`w-full text-left py-1 px-2 rounded transition-colors ${
                    selectedStore === s.slug ? 'bg-amber-100/70 font-semibold text-amber-900' : 'hover:bg-stone-50'
                  }`}
                >
                  {s.storeName}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider in ₹ */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              <span>Max Price</span>
              <span className="tabular-nums font-mono text-stone-900 font-bold">
                ₹{maxPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-800 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-400 font-mono mt-1">
              <span>₹1,000</span>
              <span>₹50,000</span>
            </div>
          </div>

          {/* Availability Filter */}
          <div className="pt-2 border-t border-stone-100">
            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded accent-amber-800"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Main Product Catalog Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Sort & Count Bar */}
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded border border-stone-200 text-xs">
            <span className="text-stone-500 font-medium">
              Showing <strong className="text-stone-900 tabular-nums">{products.length}</strong> handcrafted heirlooms
            </span>

            <div className="flex items-center gap-2">
              <span className="text-stone-500">Sort by:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded px-2.5 py-1 text-stone-800 font-medium focus:outline-none focus:border-amber-800"
              >
                <option value="featured">Featured Curations</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="py-20 text-center text-xs text-stone-500">
              Loading authentic artisanal works...
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white p-12 text-center rounded border border-stone-200">
              <p className="font-serif text-lg font-semibold text-stone-900">No heirlooms match this filter</p>
              <p className="text-xs text-stone-500 mt-1">Try resetting your price or category filters.</p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded hover:bg-stone-800 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
