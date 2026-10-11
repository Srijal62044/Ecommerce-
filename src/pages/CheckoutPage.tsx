/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext.js';
import { formatPaise } from '../utils/formatters.js';
import { ShieldCheck, QrCode, CreditCard, Banknote, CheckCircle, Store, Truck, Tag } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, cartTotalPaise, user, clearCart, navigate, showNotification } = useMarketplace();

  // Addresses
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [newAddress, setNewAddress] = useState({
    fullName: user?.fullName || 'Srijal Kumar',
    phone: user?.phone || '+91 98110 99887',
    addressLine1: 'B-402, Sea Green Heights, Worli Sea Face',
    addressLine2: 'Behind Coast Guard Headquarters',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400018',
    country: 'India',
    addressType: 'home'
  });

  // Coupon
  const [couponCode, setCouponCode] = useState('ARTISAN10');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'upi_qr' | 'verifying'>('details');
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [paymentOrderDetails, setPaymentOrderDetails] = useState<any | null>(null);

  // Load saved addresses
  useEffect(() => {
    fetch('/api/auth/me', { headers: { 'x-demo-user-id': user?.id || 'user_customer_01' } })
      .then((r) => r.json())
      .then(() => {
        // Fetch default addresses
        const defaultAddrs = [
          {
            id: 'addr_mumbai_01',
            fullName: 'Srijal Kumar',
            phone: '+91 98110 99887',
            addressLine1: 'B-402, Sea Green Heights, Worli Sea Face',
            addressLine2: 'Behind Coast Guard Headquarters',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400018',
            country: 'India',
            isDefault: true,
            addressType: 'home'
          },
          {
            id: 'addr_blr_02',
            fullName: 'Srijal Kumar (Work)',
            phone: '+91 98110 99887',
            addressLine1: 'Suite 601, Embassy Golf Links Business Park',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560071',
            country: 'India',
            isDefault: false,
            addressType: 'work'
          }
        ];
        setAddresses(defaultAddrs);
        setSelectedAddressId('addr_mumbai_01');
      });
  }, [user]);

  // Group cart items by seller store
  const itemsByStore = cart.reduce((acc, item) => {
    const storeName = item.product?.storeName || 'Artisan Guild';
    if (!acc[storeName]) acc[storeName] = [];
    acc[storeName].push(item);
    return acc;
  }, {} as Record<string, typeof cart>);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          subtotalPaise: cartTotalPaise
        })
      });
      const d = await res.json();
      if (d.success) {
        setAppliedCoupon(d.data);
        showNotification(`Coupon ${d.data.coupon.code} applied successfully!`);
      } else {
        setCouponError(d.error || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError('Failed to validate coupon');
    }
  };

  const discountPaise = appliedCoupon ? appliedCoupon.discountPaise : 0;
  const shippingFeePaise = cartTotalPaise >= 100000 ? 0 : 9900;
  const finalTotalPaise = Math.max(0, cartTotalPaise - discountPaise + shippingFeePaise);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      showNotification('Your bag is empty');
      return;
    }

    const activeAddress = addresses.find((a) => a.id === selectedAddressId) || newAddress;

    setIsProcessing(true);
    try {
      const orderPayload = {
        customerId: user?.id || 'user_customer_01',
        customerEmail: user?.email || 'kumarsrijal732@gmail.com',
        customerPhone: activeAddress.phone || '+91 98110 99887',
        shippingAddress: activeAddress,
        billingAddress: activeAddress,
        items: cart.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity
        })),
        paymentMethod,
        couponCode: appliedCoupon?.coupon?.code,
        customerNotes: 'Artisanal delivery - handle with care.'
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-user-id': user?.id || 'user_customer_01'
        },
        body: JSON.stringify(orderPayload)
      });

      const d = await res.json();
      if (!d.success) {
        throw new Error(d.error || 'Failed to reserve inventory or create order');
      }

      const order = d.data;
      setCreatedOrder(order);

      if (paymentMethod === 'cod') {
        // COD order confirmed directly
        clearCart();
        navigate(`/order-success/${order.id}`);
        return;
      }

      // Online payment flow: Request gateway order
      const payRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, method: paymentMethod })
      });
      const payData = await payRes.json();
      if (payData.success) {
        setPaymentOrderDetails(payData.data);
        if (paymentMethod === 'upi') {
          setPaymentStep('upi_qr');
        } else {
          // Card / Netbanking Sandbox authorization simulation
          handleVerifyOnlinePayment(order.id, payData.data.gatewayOrderId, payData.data.paymentId);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout failed';
      showNotification(`Error: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOnlinePayment = async (orderId: string, gatewayOrderId: string, gatewayPaymentId: string) => {
    setIsProcessing(true);
    setPaymentStep('verifying');
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          gatewayOrderId,
          gatewayPaymentId,
          signature: 'sandbox_signature_valid'
        })
      });

      const d = await res.json();
      if (d.success) {
        clearCart();
        showNotification('Payment successfully captured & verified!');
        navigate(`/order-success/${orderId}`);
      } else {
        showNotification('Signature verification failed');
      }
    } catch {
      showNotification('Payment verification error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="font-serif text-3xl font-semibold text-stone-900">
          Multi-Vendor Secure Checkout
        </h1>
        <p className="text-xs text-stone-600 mt-1">
          Direct fulfillment split across sovereign artisan workshops with individual consignment tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Delivery Address & Payment Adapter */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Saved Delivery Address Selection */}
          <div className="bg-white p-6 rounded border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h2 className="font-serif text-base font-semibold text-stone-900">
                1. Delivery Address (India)
              </h2>
              <span className="text-xs text-stone-500 font-medium">Pan-India Courier Service</span>
            </div>

            <div className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 p-3.5 rounded border cursor-pointer transition-colors ${
                    selectedAddressId === addr.id
                      ? 'border-amber-800 bg-amber-50/50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="addressSelection"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="mt-1 accent-amber-800"
                  />
                  <div className="text-xs text-stone-800 space-y-0.5">
                    <div className="font-semibold text-stone-900 flex items-center gap-2">
                      <span>{addr.fullName}</span>
                      <span className="text-[10px] text-stone-500 uppercase bg-stone-100 px-1.5 py-0.5 rounded">
                        {addr.addressType}
                      </span>
                    </div>
                    <div>{addr.addressLine1}</div>
                    {addr.addressLine2 && <div>{addr.addressLine2}</div>}
                    <div>{addr.city}, {addr.state} - <strong className="font-mono">{addr.pincode}</strong></div>
                    <div className="text-stone-500 font-mono text-[11px]">Phone: {addr.phone}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 2. Payment Method Adapter */}
          <div className="bg-white p-6 rounded border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h2 className="font-serif text-base font-semibold text-stone-900">
                2. Payment Method
              </h2>
              <span className="text-xs text-stone-500 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> 256-Bit Encrypted
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-4 rounded border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'border-amber-800 bg-amber-50/50 font-semibold'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <QrCode className="w-5 h-5 text-amber-800 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-stone-900">Instant UPI / QR</div>
                  <div className="text-[11px] text-stone-500 mt-0.5">GPay, PhonePe, Paytm, BHIM</div>
                </div>
              </button>

              {/* Cards */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-amber-800 bg-amber-50/50 font-semibold'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <CreditCard className="w-5 h-5 text-amber-800 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-stone-900">Credit / Debit Cards</div>
                  <div className="text-[11px] text-stone-500 mt-0.5">RuPay, Visa, Mastercard</div>
                </div>
              </button>

              {/* Netbanking */}
              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-4 rounded border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                  paymentMethod === 'netbanking'
                    ? 'border-amber-800 bg-amber-50/50 font-semibold'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-amber-800 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-stone-900">Net Banking</div>
                  <div className="text-[11px] text-stone-500 mt-0.5">All Major Indian Banks</div>
                </div>
              </button>

              {/* COD */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'border-amber-800 bg-amber-50/50 font-semibold'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <Banknote className="w-5 h-5 text-amber-800 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-stone-900">Cash on Delivery (COD)</div>
                  <div className="text-[11px] text-stone-500 mt-0.5">Pay upon doorstep receipt</div>
                </div>
              </button>
            </div>

            {/* UPI QR Interactive Simulation Modal */}
            {paymentStep === 'upi_qr' && paymentOrderDetails && (
              <div className="p-5 bg-stone-50 rounded border border-amber-300 space-y-4 text-center mt-4">
                <div className="text-xs font-semibold text-stone-900">
                  Scan to Pay with Any UPI App
                </div>

                <div className="inline-block p-3 bg-white rounded border border-stone-200 shadow-xs">
                  <img
                    src={paymentOrderDetails.upiPayload?.qrCodeMockUrl}
                    alt="UPI Payment QR Code"
                    className="w-44 h-44 mx-auto"
                  />
                  <div className="text-[11px] font-mono text-stone-700 mt-2">
                    {paymentOrderDetails.upiPayload?.vpa}
                  </div>
                </div>

                <div className="text-xs text-stone-600 font-mono tabular-nums">
                  Amount: <strong>{formatPaise(paymentOrderDetails.amountPaise)}</strong>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={() =>
                      handleVerifyOnlinePayment(
                        createdOrder.id,
                        paymentOrderDetails.gatewayOrderId,
                        paymentOrderDetails.paymentId
                      )
                    }
                    className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer"
                  >
                    Simulate Successful UPI Authorization
                  </button>
                  <button
                    onClick={() => setPaymentStep('details')}
                    className="px-3 py-2 border border-stone-300 text-stone-600 rounded text-xs hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Multi-Vendor Fulfillments */}
        <div className="lg:col-span-5 bg-white p-6 rounded border border-stone-200 space-y-6">
          <h2 className="font-serif text-base font-semibold text-stone-900 pb-2 border-b border-stone-100">
            Artisanal Consignment Summary
          </h2>

          {/* Seller Store Groupings */}
          <div className="space-y-4">
            {Object.entries(itemsByStore).map(([storeName, items]) => (
              <div key={storeName} className="p-3 bg-stone-50 rounded border border-stone-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                  <Store className="w-3.5 h-3.5" />
                  <span>Shipment from {storeName}</span>
                </div>

                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-xs text-stone-700">
                    <span className="line-clamp-1 flex-1 pr-2">
                      {item.quantity}x {item.product?.title}
                    </span>
                    <span className="font-mono tabular-nums font-semibold shrink-0">
                      {formatPaise((item.variant?.pricePaise ?? item.product?.basePricePaise ?? 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Coupon Code Box */}
          <form onSubmit={handleApplyCoupon} className="space-y-2 pt-2 border-t border-stone-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter Coupon (e.g. ARTISAN10)"
                className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded font-mono uppercase text-stone-900"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold bg-stone-900 text-white rounded hover:bg-stone-800 transition-colors"
              >
                Apply
              </button>
            </div>
            {appliedCoupon && (
              <div className="text-xs text-emerald-700 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Coupon {appliedCoupon.coupon.code} applied (-{formatPaise(discountPaise)})
              </div>
            )}
            {couponError && <div className="text-xs text-red-600">{couponError}</div>}
          </form>

          {/* Price Calculation Breakdown (All in integer paise) */}
          <div className="space-y-2 pt-2 border-t border-stone-100 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-mono tabular-nums text-stone-900 font-semibold">
                {formatPaise(cartTotalPaise)}
              </span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-emerald-700">
                <span>Coupon Discount ({appliedCoupon.coupon.code})</span>
                <span className="font-mono tabular-nums font-semibold">
                  -{formatPaise(discountPaise)}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Insured Indian Express Delivery</span>
              <span className="font-mono tabular-nums">
                {shippingFeePaise === 0 ? (
                  <strong className="text-emerald-700">FREE</strong>
                ) : (
                  formatPaise(shippingFeePaise)
                )}
              </span>
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-bold text-stone-900">
              <span>Grand Total</span>
              <span className="font-mono tabular-nums text-base text-amber-950">
                {formatPaise(finalTotalPaise)}
              </span>
            </div>
          </div>

          {/* Place Order CTA */}
          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing || cart.length === 0}
            className="w-full py-3.5 px-4 bg-stone-900 text-white font-semibold text-xs tracking-wider uppercase rounded hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-amber-300" />
            <span>
              {isProcessing
                ? 'Processing Consignment...'
                : paymentMethod === 'cod'
                ? `Confirm COD Order (${formatPaise(finalTotalPaise)})`
                : `Pay ${formatPaise(finalTotalPaise)}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
