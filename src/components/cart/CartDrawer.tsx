/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useMarketplace } from '../../context/MarketplaceContext.js';
import { formatPaise } from '../../utils/formatters.js';
import { X, Plus, Minus, Trash2, ArrowRight, Store, Truck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    cartTotalPaise,
    navigate
  } = useMarketplace();

  if (!isCartOpen) return null;

  // Group cart items by seller store
  const itemsByStore = cart.reduce((acc, item) => {
    const storeName = item.product?.storeName || 'Artisan Guild';
    if (!acc[storeName]) acc[storeName] = [];
    acc[storeName].push(item);
    return acc;
  }, {} as Record<string, typeof cart>);

  const freeDeliveryThresholdPaise = 100000; // ₹1,000
  const progressPercent = Math.min(100, Math.round((cartTotalPaise / freeDeliveryThresholdPaise) * 100));
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThresholdPaise - cartTotalPaise);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide-out Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg font-semibold text-stone-900">Your Artisanal Bag</h2>
            <span className="text-xs text-stone-500 tabular-nums">({cart.length} items)</span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-stone-50 px-5 py-3 border-b border-stone-200">
          <div className="flex items-center justify-between text-xs text-stone-600 mb-1.5">
            <span className="flex items-center gap-1.5 font-medium">
              <Truck className="w-3.5 h-3.5 text-amber-700" />
              {remainingForFreeDelivery === 0 ? (
                <span className="text-emerald-700 font-semibold">Free Insured Delivery Unlocked!</span>
              ) : (
                <span>Add {formatPaise(remainingForFreeDelivery)} for Free Delivery</span>
              )}
            </span>
            <span className="tabular-nums font-mono text-[11px]">{progressPercent}%</span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-700 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Items List (Grouped by Multi-Vendor Store) */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-stone-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-500">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                <Store className="w-8 h-8 text-stone-400" />
              </div>
              <p className="font-serif text-base text-stone-900 font-medium">Your bag is empty</p>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                Discover master weaver silks, tribal Dhokra bronzes, and Himalayan saffron.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/shop');
                }}
                className="mt-5 px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            Object.entries(itemsByStore).map(([storeName, items]) => (
              <div key={storeName} className="py-4 first:pt-0">
                {/* Seller Store Header */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 uppercase tracking-wider mb-3">
                  <Store className="w-3.5 h-3.5 text-amber-800" />
                  <span>Fulfilled by {storeName}</span>
                </div>

                <div className="space-y-3">
                  {items.map((item) => {
                    const unitPrice = item.variant?.pricePaise ?? item.product?.basePricePaise ?? 0;
                    return (
                      <div
                        key={`${item.productId}-${item.variantId || 'base'}`}
                        className="flex gap-3 bg-stone-50/70 p-3 rounded border border-stone-100"
                      >
                        {/* Thumbnail */}
                        <div className="w-16 h-16 bg-stone-200 rounded shrink-0 flex items-center justify-center text-[10px] text-stone-600 font-serif">
                          {item.product?.images?.[0]?.url ? (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.title}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <span className="p-1 text-center line-clamp-2">Craft Item</span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">
                              {item.product?.title}
                            </h4>
                            {item.variant && (
                              <p className="text-[11px] text-stone-500 mt-0.5">{item.variant.title}</p>
                            )}
                            <div className="text-xs font-medium text-stone-900 tabular-nums mt-1">
                              {formatPaise(unitPrice)}
                            </div>
                          </div>

                          {/* Stepper & Remove */}
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-200/60">
                            <div className="flex items-center gap-2 bg-white border border-stone-200 rounded px-1.5 py-0.5">
                              <button
                                onClick={() => updateCartQuantity(item.productId, item.quantity - 1, item.variantId)}
                                className="text-stone-500 hover:text-stone-900 cursor-pointer p-0.5"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-semibold tabular-nums px-1 text-stone-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(item.productId, item.quantity + 1, item.variantId)}
                                className="text-stone-500 hover:text-stone-900 cursor-pointer p-0.5"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.productId, item.variantId)}
                              className="text-stone-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Module */}
        {cart.length > 0 && (
          <div className="p-5 bg-stone-50 border-t border-stone-200 space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>Estimated Subtotal</span>
              <span className="font-semibold text-stone-900 tabular-nums text-sm">
                {formatPaise(cartTotalPaise)}
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              Taxes and multi-seller express delivery calculated at checkout.
            </p>

            <button
              onClick={() => {
                setIsCartOpen(false);
                navigate('/checkout');
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-stone-900 text-white font-semibold text-xs rounded hover:bg-stone-800 transition-colors shadow-sm cursor-pointer"
            >
              <span>Proceed to Multi-Vendor Checkout</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
