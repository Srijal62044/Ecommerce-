/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItemClient, SystemStatusData } from '../types/client.js';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  roles: string[];
  isActive: boolean;
}

interface MarketplaceContextType {
  user: UserProfile | null;
  activePersonaId: string;
  switchPersona: (personaId: string) => Promise<void>;
  cart: CartItemClient[];
  addToCart: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  removeFromCart: (productId: string, variantId?: string) => Promise<void>;
  clearCart: () => void;
  cartTotalPaise: number;
  cartCount: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  systemStatus: SystemStatusData | null;
  refreshSystemStatus: () => Promise<void>;
  notification: string | null;
  showNotification: (msg: string) => void;
  navigate: (path: string) => void;
  currentPath: string;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activePersonaId, setActivePersonaId] = useState<string>(() => {
    return localStorage.getItem('sutradhar_persona') || 'user_customer_01';
  });

  const [user, setUser] = useState<UserProfile | null>(null);
  const [cart, setCart] = useState<CartItemClient[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatusData | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Client side path state with popstate support
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const refreshSystemStatus = async () => {
    try {
      const res = await fetch('/api/system/status');
      const data = await res.json();
      if (data.success) {
        setSystemStatus(data.data);
      }
    } catch {
      // ignore
    }
  };

  // Load user profile on persona change
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'x-demo-user-id': activePersonaId }
        });
        const data = await res.json();
        if (data.success && data.data) {
          setUser(data.data);
        }
      } catch (e) {
        console.error('Failed to load profile', e);
      }
    };
    loadProfile();
    refreshSystemStatus();
  }, [activePersonaId]);

  // Load cart and wishlist
  useEffect(() => {
    const loadCartAndWishlist = async () => {
      try {
        const [cartRes, wishRes, prodsRes] = await Promise.all([
          fetch('/api/cart', { headers: { 'x-demo-user-id': activePersonaId } }),
          fetch('/api/wishlist', { headers: { 'x-demo-user-id': activePersonaId } }),
          fetch('/api/products')
        ]);

        const cartData = await cartRes.json();
        const wishData = await wishRes.json();
        const prodsData = await prodsRes.json();

        if (wishData.success) {
          setWishlist(wishData.data || []);
        }

        if (cartData.success && prodsData.success) {
          const allProds = prodsData.data || [];
          const hydratedCart: CartItemClient[] = (cartData.data || []).map((ci: any) => {
            const product = allProds.find((p: any) => p.id === ci.productId);
            const variant = product?.variants?.find((v: any) => v.id === ci.variantId);
            return {
              productId: ci.productId,
              variantId: ci.variantId,
              quantity: ci.quantity,
              product,
              variant
            };
          }).filter((item: CartItemClient) => item.product !== undefined);

          setCart(hydratedCart);
        }
      } catch {
        // ignore
      }
    };
    loadCartAndWishlist();
  }, [activePersonaId]);

  const switchPersona = async (personaId: string) => {
    setActivePersonaId(personaId);
    localStorage.setItem('sutradhar_persona', personaId);
    try {
      const res = await fetch('/api/auth/switch-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: personaId })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        showNotification(`Switched persona to: ${data.data.fullName}`);
      }
    } catch {
      // ignore
    }
  };

  const syncCartToServer = async (items: CartItemClient[]) => {
    try {
      const payload = items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity
      }));
      await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-user-id': activePersonaId
        },
        body: JSON.stringify({ items: payload })
      });
    } catch {
      // ignore
    }
  };

  const addToCart = async (productId: string, quantity = 1, variantId?: string) => {
    try {
      const res = await fetch(`/api/products`);
      const data = await res.json();
      const product = (data.data || []).find((p: any) => p.id === productId);
      if (!product) return;

      const variant = variantId ? product.variants?.find((v: any) => v.id === variantId) : undefined;

      setCart((prev) => {
        const existingIdx = prev.findIndex(
          (item) => item.productId === productId && item.variantId === variantId
        );
        let updated: CartItemClient[];
        if (existingIdx >= 0) {
          updated = [...prev];
          updated[existingIdx].quantity += quantity;
        } else {
          updated = [...prev, { productId, variantId, quantity, product, variant }];
        }
        syncCartToServer(updated);
        return updated;
      });

      showNotification(`Added "${product.title}" to cart`);
      setIsCartOpen(true);
    } catch {
      // ignore
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number, variantId?: string) => {
    setCart((prev) => {
      let updated: CartItemClient[];
      if (quantity <= 0) {
        updated = prev.filter((i) => !(i.productId === productId && i.variantId === variantId));
      } else {
        updated = prev.map((item) => {
          if (item.productId === productId && item.variantId === variantId) {
            return { ...item, quantity };
          }
          return item;
        });
      }
      syncCartToServer(updated);
      return updated;
    });
  };

  const removeFromCart = async (productId: string, variantId?: string) => {
    setCart((prev) => {
      const updated = prev.filter((i) => !(i.productId === productId && i.variantId === variantId));
      syncCartToServer(updated);
      return updated;
    });
    showNotification('Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
    syncCartToServer([]);
  };

  const toggleWishlist = async (productId: string) => {
    try {
      const res = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-user-id': activePersonaId
        },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (data.success) {
        const added = data.data.added;
        setWishlist((prev) => (added ? [...prev, productId] : prev.filter((id) => id !== productId)));
        showNotification(added ? 'Saved to your wishlist' : 'Removed from wishlist');
      }
    } catch {
      // ignore
    }
  };

  const cartTotalPaise = cart.reduce((sum, item) => {
    const unitPrice = item.variant?.pricePaise ?? item.product?.basePricePaise ?? 0;
    return sum + unitPrice * item.quantity;
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <MarketplaceContext.Provider
      value={{
        user,
        activePersonaId,
        switchPersona,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotalPaise,
        cartCount,
        wishlist,
        toggleWishlist,
        isCartOpen,
        setIsCartOpen,
        systemStatus,
        refreshSystemStatus,
        notification,
        showNotification,
        navigate,
        currentPath
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
