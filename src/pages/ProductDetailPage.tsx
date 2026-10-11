/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext.js';
import { formatPaise } from '../utils/formatters.js';
import { ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw, Star, MapPin, CheckCircle } from 'lucide-react';

export const ProductDetailPage: React.FC<{ slug: string }> = ({ slug }) => {
  const { addToCart, toggleWishlist, wishlist, currentPath, navigate, user } = useMarketplace();

  const [product, setProduct] = useState<any | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Indian Pincode Delivery Estimator
  const [pincode, setPincode] = useState('400018'); // Default Mumbai
  const [pincodeStatus, setPincodeStatus] = useState<any | null>(null);
  const [pincodeChecking, setPincodeChecking] = useState(false);

  // Review Form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) {
          setProduct(d.data);
          if (d.data.variants && d.data.variants.length > 0) {
            setSelectedVariantId(d.data.variants[0].id);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) return;
    setPincodeChecking(true);
    try {
      const res = await fetch(`/api/pincode/check/${pincode}`);
      const d = await res.json();
      if (d.success) {
        setPincodeStatus(d.data);
      }
    } finally {
      setPincodeChecking(false);
    }
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-user-id': user?.id || 'user_customer_01'
        },
        body: JSON.stringify({
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment
        })
      });
      const d = await res.json();
      if (d.success) {
        setProduct((prev: any) => ({
          ...prev,
          reviews: [d.data, ...(prev.reviews || [])]
        }));
        setReviewTitle('');
        setReviewComment('');
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-stone-500">
        Loading heirloom details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-semibold text-stone-900">Product Not Found</h2>
        <button
          onClick={() => navigate('/shop')}
          className="mt-4 px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const selectedVariant = product.variants?.find((v: any) => v.id === selectedVariantId);
  const activePricePaise = selectedVariant ? selectedVariant.pricePaise : product.basePricePaise;
  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-16">
      {/* 2-Column Contiguous Purchase Module Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Product Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] bg-stone-100 rounded-lg overflow-hidden border border-stone-200 flex items-center justify-center">
            {product.images?.[0]?.url ? (
              <img
                src={product.images[0].url}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-8 bg-gradient-to-br from-stone-200 via-amber-50 to-stone-300 w-full h-full flex flex-col items-center justify-center">
                <span className="text-xs uppercase tracking-widest font-semibold text-stone-600 mb-1">
                  {product.originRegion}
                </span>
                <span className="font-serif text-2xl font-medium text-stone-900 max-w-sm">
                  {product.artisanCraftTechnique}
                </span>
                <span className="text-xs text-amber-900 mt-2 font-medium">GI Certified Heritage</span>
              </div>
            )}
          </div>

          {/* Craft Origin Strip */}
          <div className="p-4 bg-stone-50 rounded border border-stone-200 flex items-center justify-between text-xs text-stone-600">
            <div>
              <strong className="text-stone-900">Provenance:</strong> {product.originRegion}
            </div>
            <div>
              <strong className="text-stone-900">Technique:</strong> {product.artisanCraftTechnique}
            </div>
            <div>
              <strong className="text-stone-900">HSN:</strong> {product.hsnCode || '5007'}
            </div>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-lg border border-stone-200 space-y-6 lg:sticky lg:top-24">
          <div>
            {/* Unboxed Metadata with Typographic Separator */}
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
              <span
                onClick={() => product.storeSlug && navigate(`/seller/${product.storeSlug}`)}
                className="font-medium text-amber-900 hover:underline cursor-pointer"
              >
                {product.storeName}
              </span>
              <span aria-hidden="true">·</span>
              <span>{product.originRegion}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 leading-tight">
              {product.title}
            </h1>

            {/* Price Module */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-stone-900 tabular-nums">
                {formatPaise(activePricePaise)}
              </span>
              {product.compareAtPricePaise && product.compareAtPricePaise > activePricePaise && (
                <span className="text-sm text-stone-400 line-through tabular-nums">
                  {formatPaise(product.compareAtPricePaise)}
                </span>
              )}
              <span className="text-xs text-stone-500 font-medium">
                (Inclusive of all taxes & GST)
              </span>
            </div>
          </div>

          {/* Short description */}
          <p className="text-xs text-stone-600 leading-relaxed">
            {product.shortDescription || product.description}
          </p>

          {/* Variant Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Select Option / Edition
              </label>
              <div className="grid grid-cols-1 gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`flex items-center justify-between p-3 text-xs rounded border text-left transition-colors cursor-pointer ${
                      selectedVariantId === v.id
                        ? 'border-amber-800 bg-amber-50/60 font-semibold text-stone-900'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <span>{v.title}</span>
                    <span className="font-mono tabular-nums">{formatPaise(v.pricePaise)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock & Quantity Module */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-600">
              Stock Status:{' '}
              <strong className={product.inventoryAvailable > 0 ? 'text-emerald-700' : 'text-red-600'}>
                {product.inventoryAvailable > 0
                  ? `${product.inventoryAvailable} units in artisanal reserve`
                  : 'Sold Out'}
              </strong>
            </span>

            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded px-2 py-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="text-stone-500 hover:text-stone-900 text-xs px-1 cursor-pointer"
              >
                -
              </button>
              <span className="text-xs font-semibold tabular-nums px-2">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.inventoryAvailable, q + 1))}
                className="text-stone-500 hover:text-stone-900 text-xs px-1 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => addToCart(product.id, quantity, selectedVariantId)}
              disabled={product.inventoryAvailable <= 0}
              className="w-full py-3.5 px-4 bg-stone-900 text-white font-semibold text-xs tracking-wider uppercase rounded hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span>Add to Bag</span>
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              className="w-full py-2.5 px-4 border border-stone-200 text-stone-700 font-medium text-xs rounded hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>

          {/* Indian Pincode Delivery Check */}
          <div className="p-4 bg-stone-50 rounded border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-800" />
                <span>Estimate Delivery Availability</span>
              </span>
            </div>

            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                maxLength={6}
                placeholder="Enter 6-digit Pincode"
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800 font-mono"
              />
              <button
                type="submit"
                disabled={pincodeChecking}
                className="px-3 py-1.5 text-xs font-semibold bg-stone-800 text-white rounded hover:bg-stone-700 transition-colors"
              >
                {pincodeChecking ? 'Checking...' : 'Check'}
              </button>
            </form>

            {pincodeStatus && (
              <div className="text-[11px] text-stone-600 pt-1 space-y-0.5">
                <div className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Delivery available to {pincodeStatus.zone}
                </div>
                <div>Estimated delivery: <strong>{pincodeStatus.estimatedDeliveryDays} business days</strong></div>
                <div>Cash on Delivery (COD) available with verified OTP</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Craft Description & Provenance */}
      <section className="bg-white p-8 rounded-lg border border-stone-200 space-y-4">
        <h2 className="font-serif text-xl font-semibold text-stone-900">
          The Craft Heritage & Technique
        </h2>
        <div className="prose prose-stone text-xs leading-relaxed max-w-none text-stone-700 whitespace-pre-line">
          {product.description}
        </div>
      </section>

      {/* Verified Reviews Module */}
      <section className="bg-white p-8 rounded-lg border border-stone-200 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="font-serif text-xl font-semibold text-stone-900">
              Verified Collector Reviews
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Tied strictly to verified purchases on Sutradhar.
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-stone-900 font-mono tabular-nums">
              ★ {product.ratingAvg.toFixed(1)}
            </span>
            <div className="text-[11px] text-stone-500">{product.ratingCount} verified ratings</div>
          </div>
        </div>

        {/* Existing Reviews */}
        <div className="space-y-4">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev: any) => (
              <div key={rev.id} className="p-4 bg-stone-50 rounded border border-stone-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-900">{rev.userName}</span>
                  <span className="text-amber-700">{'★'.repeat(rev.rating)}</span>
                </div>
                <h4 className="text-xs font-semibold text-stone-800">{rev.title}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-stone-500">No reviews yet for this masterpiece.</p>
          )}
        </div>

        {/* Write a Review Form */}
        <form onSubmit={handlePostReview} className="pt-4 border-t border-stone-100 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800">
            Leave a Verified Collector Review
          </h4>

          <div className="flex items-center gap-3">
            <label className="text-xs text-stone-600 font-medium">Rating:</label>
            <select
              value={reviewRating}
              onChange={(e) => setReviewRating(Number(e.target.value))}
              className="text-xs p-1.5 bg-stone-50 border border-stone-300 rounded"
            >
              <option value="5">5 - Masterpiece Quality</option>
              <option value="4">4 - High Craftsmanship</option>
              <option value="3">3 - Satisfactory</option>
            </select>
          </div>

          <input
            type="text"
            value={reviewTitle}
            onChange={(e) => setReviewTitle(e.target.value)}
            placeholder="Review title (e.g., Exquisite Zari Weaving)"
            className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded"
          />

          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Share your experience with the weave, patina, texture..."
            rows={3}
            className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded"
          />

          <button
            type="submit"
            disabled={isSubmittingReview}
            className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded hover:bg-stone-800 transition-colors"
          >
            {isSubmittingReview ? 'Submitting...' : 'Post Verified Review'}
          </button>
        </form>
      </section>
    </div>
  );
};
