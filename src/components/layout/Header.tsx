/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext.js';
import { ShoppingBag, Heart, Search, User, ShieldCheck, Store, LogOut, ChevronDown } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    user,
    activePersonaId,
    switchPersona,
    cartCount,
    wishlist,
    setIsCartOpen,
    navigate,
    currentPath
  } = useMarketplace();

  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const personas = [
    { id: 'user_customer_01', name: 'Srijal Kumar', role: 'Customer', desc: 'Verified Buyer with Saved Addresses & Orders' },
    { id: 'user_seller_01', name: 'Banaras Heritage Guild', role: 'Seller (Textiles)', desc: 'Varanasi Master Weaver Store Owner' },
    { id: 'user_seller_02', name: 'Bastar Dhokra Guild', role: 'Seller (Metals)', desc: 'Tribal Lost-Wax Bronze Metalcaster' },
    { id: 'user_seller_03', name: 'Arya Vedic Apothecary', role: 'Seller (Wellness)', desc: 'GI Saffron & Botanical Apothecary' },
    { id: 'user_admin_01', name: 'Ananya Deshmukh', role: 'Super Admin', desc: 'Platform Moderation, Approvals & Audits' }
  ];

  return (
    <>
      {/* Top System Health Bar & Persona Switcher */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 sm:px-8 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-amber-400 font-medium tracking-wider uppercase text-[11px]">Sutradhar Swadeshi</span>
            <span className="text-stone-500 hidden sm:inline" aria-hidden="true">·</span>
            <span className="text-stone-400 hidden sm:inline">Direct from GI-Certified Artisan Guilds of India</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
              className="flex items-center gap-1.5 text-stone-300 hover:text-white transition-colors cursor-pointer"
            >
              <span className="text-stone-400">Persona:</span>
              <span className="font-semibold text-amber-300">{user?.fullName || 'Customer'}</span>
              <span className="text-stone-400">({user?.roles?.[0] || 'Customer'})</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {isPersonaMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-stone-900 rounded shadow-xl border border-stone-200 py-2 z-50">
                <div className="px-3 py-1.5 border-b border-stone-100 text-stone-500 text-[11px] font-medium tracking-wider uppercase">
                  Switch Active Role Persona
                </div>
                {personas.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      switchPersona(p.id);
                      setIsPersonaMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex flex-col gap-0.5 transition-colors ${
                      activePersonaId === p.id ? 'bg-amber-50/70 border-l-2 border-amber-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900">{p.name}</span>
                      <span className="text-[10px] text-stone-500 font-medium">{p.role}</span>
                    </div>
                    <span className="text-stone-500 text-[11px]">{p.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Top Bar Contract: Zone 1 (Brand) - Zone 2 (4-5 Nav Links) - Zone 3 (Primary Action) */}
      <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200 transition-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-6 shrink-0">
            <button
              onClick={() => navigate('/')}
              className="text-left font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 hover:text-amber-900 transition-colors whitespace-nowrap cursor-pointer"
            >
              Sūtradhār
            </button>
          </div>

          {/* Zone 2: 4-5 Concise Single-Line Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-700">
            <button
              onClick={() => navigate('/shop')}
              className={`hover:text-stone-950 transition-colors whitespace-nowrap cursor-pointer ${
                currentPath === '/shop' ? 'text-amber-900 font-semibold' : ''
              }`}
            >
              All Handcrafts
            </button>
            <button
              onClick={() => navigate('/category/handloom-textiles')}
              className={`hover:text-stone-950 transition-colors whitespace-nowrap cursor-pointer ${
                currentPath.includes('handloom-textiles') ? 'text-amber-900 font-semibold' : ''
              }`}
            >
              Handloom Silk
            </button>
            <button
              onClick={() => navigate('/category/metal-brassware')}
              className={`hover:text-stone-950 transition-colors whitespace-nowrap cursor-pointer ${
                currentPath.includes('metal-brassware') ? 'text-amber-900 font-semibold' : ''
              }`}
            >
              Dhokra & Brass
            </button>
            <button
              onClick={() => navigate('/category/ayurvedic-wellness')}
              className={`hover:text-stone-950 transition-colors whitespace-nowrap cursor-pointer ${
                currentPath.includes('ayurvedic-wellness') ? 'text-amber-900 font-semibold' : ''
              }`}
            >
              Botanicals
            </button>
            <button
              onClick={() => navigate('/track-order')}
              className={`hover:text-stone-950 transition-colors whitespace-nowrap cursor-pointer ${
                currentPath === '/track-order' ? 'text-amber-900 font-semibold' : ''
              }`}
            >
              Track Order
            </button>
          </nav>

          {/* Zone 3: Functional Affordances (Search, Wishlist, Cart Drawer, Portal Switcher) */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Search Toggle */}
            <div className="relative">
              {isSearchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search silk, dhokra, brass..."
                    autoFocus
                    className="w-48 sm:w-64 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-700"
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="ml-1 text-stone-400 hover:text-stone-600 text-xs px-1"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                  title="Search catalog"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => navigate('/account')}
              className="p-2 text-stone-600 hover:text-stone-900 transition-colors relative cursor-pointer"
              title="Saved items"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-800 text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Portal Shortcut (Seller or Admin Portal if authorized) */}
            {user?.roles?.includes('seller') && (
              <button
                onClick={() => navigate('/seller/portal')}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-200/60 hover:bg-stone-200 rounded transition-colors whitespace-nowrap cursor-pointer"
              >
                <Store className="w-3.5 h-3.5 text-amber-800" />
                <span>Seller Desk</span>
              </button>
            )}

            {user?.roles?.includes('admin') && (
              <button
                onClick={() => navigate('/admin/portal')}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-100/70 hover:bg-amber-100 rounded transition-colors whitespace-nowrap cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-900" />
                <span>Admin Desk</span>
              </button>
            )}

            {/* User Account */}
            <button
              onClick={() => navigate('/account')}
              className="p-2 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
              title="Customer Account"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </button>

            {/* Primary Action: Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded transition-colors whitespace-nowrap cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Bag</span>
              <span className="tabular-nums font-bold text-amber-300">({cartCount})</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
