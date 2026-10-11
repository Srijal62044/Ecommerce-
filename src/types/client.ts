/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CartItemClient {
  productId: string;
  variantId?: string;
  quantity: number;
  product?: {
    id: string;
    title: string;
    slug: string;
    storeId: string;
    storeName?: string;
    basePricePaise: number;
    inventoryAvailable: number;
    originRegion: string;
    artisanCraftTechnique: string;
    images: Array<{ url: string; altText?: string }>;
  };
  variant?: {
    id: string;
    title: string;
    sku: string;
    pricePaise: number;
  };
}

export interface UserPersona {
  id: string;
  name: string;
  role: string;
  email: string;
  description: string;
}

export interface SystemStatusData {
  appName: string;
  version: string;
  database: {
    isSupabaseConnected: boolean;
    supabaseUrlConfigured: boolean;
    adapterMode: 'supabase_postgres' | 'isolated_in_memory_engine';
    message: string;
  };
  paymentGateway: {
    provider: string;
    mode: string;
  };
  logistics: {
    activeCouriers: string[];
  };
}
