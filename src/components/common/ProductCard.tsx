/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext.js';
import { formatPaise } from '../../utils/formatters.js';
import { Heart, ShoppingBag, Sparkles, Feather, ShieldCheck } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    storeName?: string;
    storeSlug?: string;
    originRegion: string;
    artisanCraftTechnique: string;
    basePricePaise: number;
    compareAtPricePaise?: number;
    ratingAvg: number;
    ratingCount: number;
    inventoryAvailable: number;
    images?: Array<{ url: string; altText?: string }>;
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { wishlist, toggleWishlist, addToCart, navigate } = useMarketplace();
  const [imageError, setImageError] = useState(false);
  const isWishlisted = wishlist.includes(product.id);

  const primaryImage = product.images?.[0]?.url;

  // Domain-specific craft visual aesthetic fallback generator
  const getCraftAesthetic = () => {
    const tech = product.artisanCraftTechnique.toLowerCase();
    if (tech.includes('silk') || tech.includes('weave') || tech.includes('kadhwa') || tech.includes('chanderi')) {
      return {
        bg: 'from-amber-900/10 via-stone-200 to-amber-950/20',
        accent: 'text-amber-800',
        tag: 'Pure Handloom Silk Mark',
        icon: Feather
      };
    }
    if (tech.includes('dhokra') || tech.includes('metal') || tech.includes('bronze') || tech.includes('kansa')) {
      return {
        bg: 'from-stone-300 via-amber-950/10 to-stone-400',
        accent: 'text-stone-700',
        tag: 'GI-Certified Bell Metal',
        icon: Sparkles
      };
    }
    return {
      bg: 'from-amber-100 via-stone-200 to-amber-200/50',
      accent: 'text-amber-900',
      tag: 'Classical Ayurvedic Purity',
      icon: ShieldCheck
    };
  };

  const aesthetic = getCraftAesthetic();
  const CraftIcon = aesthetic.icon;

  return (
    <div className="group relative flex flex-col bg-white border border-stone-200 rounded overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      {/* Product Visual Container (65-75% height) */}
      <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
        {primaryImage && !imageError ? (
          <img
            src={primaryImage}
            alt={product.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-102"
          />
        ) : (
          /* Resilient Stylized SVG & CSS Fallback Canvas conforming to Zero-Broken-Image Policy */
          <div
            className={`w-full h-full bg-gradient-to-br ${aesthetic.bg} flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden`}
          >
            {/* Subtle decorative artisanal motif watermark */}
            <div className="absolute inset-0 opacity-10 flex items-center justify-center">
              <CraftIcon className="w-48 h-48 stroke-1 text-stone-900" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-white/80 shadow-sm flex items-center justify-center">
                <CraftIcon className={`w-6 h-6 ${aesthetic.accent}`} />
              </div>
              <span className="text-[11px] uppercase tracking-widest font-semibold text-stone-700">
                {product.originRegion}
              </span>
              <span className="font-serif text-sm font-medium text-stone-900 max-w-[200px] line-clamp-2">
                {product.artisanCraftTechnique}
              </span>
            </div>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-stone-700 hover:text-red-600 hover:bg-white shadow-sm transition-colors cursor-pointer z-10"
          title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Inventory scarcity indicator */}
        {product.inventoryAvailable <= 5 && product.inventoryAvailable > 0 && (
          <div className="absolute bottom-2 left-2 bg-stone-900/85 backdrop-blur-sm text-amber-200 text-[10px] px-2 py-0.5 rounded font-medium">
            Only {product.inventoryAvailable} handcrafted left
          </div>
        )}
      </div>

      {/* Product Content Module */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Zero-Pill Clean Unboxed Metadata with Typographic Separator */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1.5 flex-wrap">
            <span className="font-medium text-stone-600">{product.originRegion}</span>
            <span aria-hidden="true">·</span>
            <span>{product.artisanCraftTechnique}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => navigate(`/product/${product.slug}`)}
            className="font-serif text-base font-semibold text-stone-900 hover:text-amber-900 transition-colors line-clamp-2 cursor-pointer"
          >
            {product.title}
          </h3>

          {/* Store reference */}
          {product.storeName && (
            <p className="text-xs text-stone-500 mt-1">
              By <span className="hover:text-stone-800 transition-colors cursor-pointer" onClick={() => product.storeSlug && navigate(`/seller/${product.storeSlug}`)}>{product.storeName}</span>
            </p>
          )}
        </div>

        {/* Pricing and Action */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-semibold text-stone-900 tabular-nums">
                {formatPaise(product.basePricePaise)}
              </span>
              {product.compareAtPricePaise && product.compareAtPricePaise > product.basePricePaise && (
                <span className="text-xs text-stone-400 line-through tabular-nums">
                  {formatPaise(product.compareAtPricePaise)}
                </span>
              )}
            </div>
            {product.ratingCount > 0 && (
              <span className="text-[11px] text-stone-500">
                ★ {product.ratingAvg.toFixed(1)} ({product.ratingCount})
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product.id, 1)}
            disabled={product.inventoryAvailable <= 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-stone-900 text-white hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
