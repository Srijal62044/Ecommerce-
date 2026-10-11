/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext.js';
import { Header } from './components/layout/Header.js';
import { Footer } from './components/layout/Footer.js';
import { CartDrawer } from './components/cart/CartDrawer.js';
import { HomePage } from './pages/HomePage.js';
import { ShopPage } from './pages/ShopPage.js';
import { ProductDetailPage } from './pages/ProductDetailPage.js';
import { StorePage } from './pages/StorePage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrderSuccessPage } from './pages/OrderSuccessPage.js';
import { TrackOrderPage } from './pages/TrackOrderPage.js';
import { AccountPage } from './pages/AccountPage.js';
import { SellerPortalPage } from './pages/SellerPortalPage.js';
import { AdminPortalPage } from './pages/AdminPortalPage.js';
import { PolicyPage } from './pages/PolicyPage.js';
import { HelpContactPage } from './pages/HelpContactPage.js';

function AppContent() {
  const { currentPath, notification } = useMarketplace();

  const renderCurrentRoute = () => {
    // 1. Home
    if (currentPath === '/' || currentPath === '') {
      return <HomePage />;
    }

    // 2. Shop & Categories & Search
    if (currentPath === '/shop' || currentPath.startsWith('/search')) {
      return <ShopPage />;
    }
    if (currentPath.startsWith('/category/')) {
      return <ShopPage />;
    }

    // 3. Product Detail: /product/:slug
    if (currentPath.startsWith('/product/')) {
      const slug = currentPath.replace('/product/', '').split('?')[0];
      return <ProductDetailPage slug={slug} />;
    }

    // 4. Seller Store Front: /seller/:slug (except /seller/portal)
    if (currentPath === '/seller/portal') {
      return <SellerPortalPage />;
    }
    if (currentPath.startsWith('/seller/')) {
      const slug = currentPath.replace('/seller/', '').split('?')[0];
      return <StorePage slug={slug} />;
    }

    // 5. Admin Portal
    if (currentPath === '/admin/portal' || currentPath.startsWith('/admin')) {
      return <AdminPortalPage />;
    }

    // 6. Checkout
    if (currentPath === '/checkout') {
      return <CheckoutPage />;
    }

    // 7. Order Success: /order-success/:id
    if (currentPath.startsWith('/order-success/')) {
      const orderId = currentPath.replace('/order-success/', '').split('?')[0];
      return <OrderSuccessPage orderId={orderId} />;
    }

    // 8. Track Order
    if (currentPath === '/track-order') {
      return <TrackOrderPage />;
    }

    // 9. Account Routes
    if (currentPath.startsWith('/account') || currentPath === '/login' || currentPath === '/register') {
      return <AccountPage />;
    }

    // 10. Help & Contact
    if (currentPath === '/help' || currentPath === '/contact') {
      return <HelpContactPage />;
    }

    // 11. Policies: /policies/:type
    if (currentPath.startsWith('/policies/')) {
      const type = currentPath.replace('/policies/', '').split('?')[0] as any;
      return <PolicyPage policyType={type || 'privacy'} />;
    }

    // Fallback: Return to Home
    return <HomePage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      <Header />
      <main className="flex-1">
        {renderCurrentRoute()}
      </main>
      <Footer />
      <CartDrawer />

      {/* Global Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-stone-100 text-xs px-4 py-3 rounded shadow-xl border border-stone-800 flex items-center gap-2.5 transition-all transform translate-y-0">
          <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <MarketplaceProvider>
      <AppContent />
    </MarketplaceProvider>
  );
}
