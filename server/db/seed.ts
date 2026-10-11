/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * DEMO SEED DATA: All records marked explicitly with isDemoData: true
 */

import {
  UserProfile,
  SellerStore,
  Category,
  Product,
  Address,
  Coupon,
  SellerLedgerEntry
} from '../types.js';

export const DEMO_PROFILES: UserProfile[] = [
  {
    id: 'user_admin_01',
    email: 'admin@sutradhar.in',
    fullName: 'Ananya Deshmukh (Admin)',
    phone: '+91 98200 12345',
    roles: ['admin', 'super_admin'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'user_seller_01',
    email: 'banaras.silk@sutradhar.in',
    fullName: 'Pandit Ramnarayan Ansari (Banaras Weaves)',
    phone: '+91 94150 54321',
    roles: ['seller'],
    isActive: true,
    createdAt: '2026-01-05T00:00:00.000Z'
  },
  {
    id: 'user_seller_02',
    email: 'dhokra.foundry@sutradhar.in',
    fullName: 'Manglu Kashyap (Bastar Dhokra Collective)',
    phone: '+91 97701 88990',
    roles: ['seller'],
    isActive: true,
    createdAt: '2026-01-08T00:00:00.000Z'
  },
  {
    id: 'user_seller_03',
    email: 'arya.vedic@sutradhar.in',
    fullName: 'Dr. Vaidya Madhavan Nambiar (Arya Vedic)',
    phone: '+91 98470 66778',
    roles: ['seller'],
    isActive: true,
    createdAt: '2026-01-10T00:00:00.000Z'
  },
  {
    id: 'user_customer_01',
    email: 'kumarsrijal732@gmail.com',
    fullName: 'Srijal Kumar',
    phone: '+91 98110 99887',
    roles: ['customer'],
    isActive: true,
    createdAt: '2026-01-15T00:00:00.000Z'
  }
];

export const DEMO_STORES: SellerStore[] = [
  {
    id: 'store_banaras_01',
    ownerId: 'user_seller_01',
    storeName: 'Banaras Heritage Handloom Guild',
    slug: 'banaras-heritage-guild',
    tagline: 'Six Generations of Kadhwa Zari & Pure Mulberry Silk',
    description: 'A master weavers collective preserving the UNESCO-recognized GI-tagged Banarasi brocade craft in Madanpura, Varanasi. Each saree and stole takes up to 45 days of rhythmic pit-loom hand weaving.',
    businessType: 'artisan_collective',
    gstin: '09AABCU9603R1ZM',
    pan: 'AABCU9603R',
    status: 'verified',
    ratingAvg: 4.95,
    ratingCount: 142,
    commissionRateOverride: 12.0,
    createdAt: '2026-01-05T00:00:00.000Z'
  },
  {
    id: 'store_dhokra_02',
    ownerId: 'user_seller_02',
    storeName: 'Bastar Dhokra Bell Metal Guild',
    slug: 'bastar-dhokra-guild',
    tagline: '4000-Year-Old Lost-Wax Metal Casting from Central India',
    description: 'Handcrafted bell-metal alloys cast by indigenous tribal artisans of Kondagaon, Bastar. Using natural beeswax, river clay, and charcoal kilns, no two brass pieces are ever identical.',
    businessType: 'artisan_collective',
    gstin: '22AAECP1122D1ZQ',
    pan: 'AAECP1122D',
    status: 'verified',
    ratingAvg: 4.88,
    ratingCount: 89,
    commissionRateOverride: 10.0,
    createdAt: '2026-01-08T00:00:00.000Z'
  },
  {
    id: 'store_arya_03',
    ownerId: 'user_seller_03',
    storeName: 'Arya Vedic Botanic Apothecary',
    slug: 'arya-vedic-apothecary',
    tagline: 'Classical Ayurvedic Formulations from Malabar Hills',
    description: 'Cold-pressed herb infused oils, Kashmiri organic saffron serums, and wild-harvested forest honey crafted in small batches strictly adhering to the 1000-year-old Ashtanga Hridaya classical texts.',
    businessType: 'sole_proprietorship',
    gstin: '32AABFA5432M1ZR',
    pan: 'AABFA5432M',
    status: 'verified',
    ratingAvg: 4.92,
    ratingCount: 215,
    commissionRateOverride: 14.0,
    createdAt: '2026-01-10T00:00:00.000Z'
  }
];

export const DEMO_CATEGORIES: Category[] = [
  {
    id: 'cat_textiles',
    name: 'Handloom & Heritage Textiles',
    slug: 'handloom-textiles',
    description: 'GI-tagged pure silks, Chanderi, Pashmina, and organic Khadi hand-spun by legacy weaver guilds.',
    imageUrl: '',
    displayOrder: 1,
    defaultCommissionPercent: 12.0,
    gstRatePercent: 5.0,
    isActive: true
  },
  {
    id: 'cat_brass_metal',
    name: 'Artisan Metal & Brassware',
    slug: 'metal-brassware',
    description: 'Lost-wax Dhokra, Bidri silver inlay, Moradabad hammered brass, and traditional copper kitchenware.',
    imageUrl: '',
    displayOrder: 2,
    defaultCommissionPercent: 10.0,
    gstRatePercent: 12.0,
    isActive: true
  },
  {
    id: 'cat_wellness',
    name: 'Ayurvedic Botanicals & Wellness',
    slug: 'ayurvedic-wellness',
    description: 'Kashmiri saffron infusions, Kumkumadi beauty tailams, cold-pressed vetiver oils, and single-source forest honeys.',
    imageUrl: '',
    displayOrder: 3,
    defaultCommissionPercent: 14.0,
    gstRatePercent: 12.0,
    isActive: true
  },
  {
    id: 'cat_terracotta',
    name: 'Terracotta & Studio Pottery',
    slug: 'terracotta-pottery',
    description: 'Black clay Nizamabad pottery, Blue Pottery of Jaipur, and wheel-thrown stoneware ceramics.',
    imageUrl: '',
    displayOrder: 4,
    defaultCommissionPercent: 10.0,
    gstRatePercent: 12.0,
    isActive: true
  }
];

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'prod_banarasi_kadhwa_01',
    storeId: 'store_banaras_01',
    storeName: 'Banaras Heritage Handloom Guild',
    storeSlug: 'banaras-heritage-guild',
    categoryId: 'cat_textiles',
    categoryName: 'Handloom & Heritage Textiles',
    title: 'Kadhwa Real Zari Pure Katan Silk Saree',
    slug: 'kadhwa-real-zari-pure-katan-silk-saree',
    shortDescription: 'Masterpiece pure mulberry katan silk with intricate Shikargah hunting motif hand-woven in gold electroplated silver zari.',
    description: 'A museum-quality Banarasi bridal heirloom woven on traditional jacquard draw-looms in Varanasi. Features exquisite Kadhwa (bootidar) technique where every motif is individually hand-locked without loose floats on the reverse. Woven over 38 intense days by Master Weaver Ansari. Certified with Silk Mark India & GI Tag No. AU/542.',
    originRegion: 'Varanasi, Uttar Pradesh',
    artisanCraftTechnique: 'Kadhwa Handloom Brocade',
    hsnCode: '5007',
    basePricePaise: 3850000, // ₹38,500.00
    compareAtPricePaise: 4500000, // ₹45,000.00
    isFeatured: true,
    moderationStatus: 'approved',
    hasVariants: true,
    viewsCount: 1420,
    salesCount: 18,
    weightGrams: 900,
    ratingAvg: 4.96,
    ratingCount: 14,
    inventoryAvailable: 5,
    createdAt: '2026-01-12T00:00:00.000Z',
    variants: [
      {
        id: 'var_kadhwa_crimson',
        productId: 'prod_banarasi_kadhwa_01',
        sku: 'BNS-KDH-CRM-01',
        title: 'Deep Crimson & Antique Gold Zari',
        options: { Color: 'Deep Crimson', Length: '6.5m with Blouse' },
        pricePaise: 3850000,
        compareAtPricePaise: 4500000
      },
      {
        id: 'var_kadhwa_emerald',
        productId: 'prod_banarasi_kadhwa_01',
        sku: 'BNS-KDH-EMR-02',
        title: 'Forest Emerald & Dual Champagne Zari',
        options: { Color: 'Forest Emerald', Length: '6.5m with Blouse' },
        pricePaise: 4100000,
        compareAtPricePaise: 4800000
      }
    ],
    images: [
      {
        id: 'img_kadhwa_01',
        productId: 'prod_banarasi_kadhwa_01',
        url: '',
        altText: 'Pure Katan Silk Banarasi Saree Drape',
        displayOrder: 1,
        isPrimary: true
      }
    ]
  },
  {
    id: 'prod_dhokra_nandi_02',
    storeId: 'store_dhokra_02',
    storeName: 'Bastar Dhokra Bell Metal Guild',
    storeSlug: 'bastar-dhokra-guild',
    categoryId: 'cat_brass_metal',
    categoryName: 'Artisan Metal & Brassware',
    title: 'Dhokra Lost-Wax Cast Sacred Nandi Sculpture',
    slug: 'dhokra-lost-wax-sacred-nandi-sculpture',
    shortDescription: 'Primitive sculptural brass Nandi with authentic tribal filigree ornamentation, cast using lost-wax technique.',
    description: 'An extraordinary ancient tribal brass artifact hand-moulded with beeswax threads and cast in Bastar clay moulds. The hollow core design and organic textured metal surfaces highlight the ancient Harappan continuity of Bastar bronze sculptors. Finished in natural antique earthen brass patina.',
    originRegion: 'Bastar, Chhattisgarh',
    artisanCraftTechnique: 'Lost-Wax Bell Metal Casting',
    hsnCode: '8306',
    basePricePaise: 680000, // ₹6,800.00
    compareAtPricePaise: 820000,
    isFeatured: true,
    moderationStatus: 'approved',
    hasVariants: true,
    viewsCount: 980,
    salesCount: 42,
    weightGrams: 2400,
    ratingAvg: 4.89,
    ratingCount: 31,
    inventoryAvailable: 12,
    createdAt: '2026-01-14T00:00:00.000Z',
    variants: [
      {
        id: 'var_dhokra_nandi_med',
        productId: 'prod_dhokra_nandi_02',
        sku: 'BSTR-ND-8IN',
        title: 'Medium (8-Inch Solid Base, 2.4kg)',
        options: { Size: '8-Inch', Finish: 'Antique Brass' },
        pricePaise: 680000,
        compareAtPricePaise: 820000
      },
      {
        id: 'var_dhokra_nandi_large',
        productId: 'prod_dhokra_nandi_02',
        sku: 'BSTR-ND-12IN',
        title: 'Large Ceremonial (12-Inch, 4.1kg)',
        options: { Size: '12-Inch', Finish: 'Antique Brass' },
        pricePaise: 1190000,
        compareAtPricePaise: 1450000
      }
    ],
    images: [
      {
        id: 'img_dhokra_01',
        productId: 'prod_dhokra_nandi_02',
        url: '',
        altText: 'Handcrafted Bastar Dhokra Nandi Sculpture',
        displayOrder: 1,
        isPrimary: true
      }
    ]
  },
  {
    id: 'prod_kumkumadi_tailam_03',
    storeId: 'store_arya_03',
    storeName: 'Arya Vedic Botanic Apothecary',
    storeSlug: 'arya-vedic-apothecary',
    categoryId: 'cat_wellness',
    categoryName: 'Ayurvedic Botanicals & Wellness',
    title: 'Kashmiri Mogra Saffron Kumkumadi Miraculous Beauty Oil',
    slug: 'kashmiri-saffron-kumkumadi-beauty-oil',
    shortDescription: '100% Classical 26-herb Ayurvedic formulation infused with Grade-A Pampore saffron stigmas and lotus petals.',
    description: 'Slow-simmered over gentle neem-wood fires for 72 hours according to the Charaka Samhita. Combines pure Kashmiri Mogra saffron, red sandalwood, vetiver, and goat milk to deeply rejuvenate skin texture, fade hyperpigmentation, and impart a radiant golden glow. Free of artificial fragrances, parabens, and mineral oils.',
    originRegion: 'Kottakkal, Kerala & Pampore, Kashmir',
    artisanCraftTechnique: 'Classical Ayurvedic Taila Paka Vidhi',
    hsnCode: '3304',
    basePricePaise: 295000, // ₹2,950.00
    compareAtPricePaise: 350000,
    isFeatured: true,
    moderationStatus: 'approved',
    hasVariants: true,
    viewsCount: 3120,
    salesCount: 164,
    weightGrams: 180,
    ratingAvg: 4.94,
    ratingCount: 78,
    inventoryAvailable: 35,
    createdAt: '2026-01-18T00:00:00.000Z',
    variants: [
      {
        id: 'var_kumk_30ml',
        productId: 'prod_kumkumadi_tailam_03',
        sku: 'ARY-KMK-30ML',
        title: '30ml Amber Pipette Bottle',
        options: { Volume: '30ml' },
        pricePaise: 295000,
        compareAtPricePaise: 350000
      },
      {
        id: 'var_kumk_50ml',
        productId: 'prod_kumkumadi_tailam_03',
        sku: 'ARY-KMK-50ML',
        title: '50ml Luxury Flacon Reserve',
        options: { Volume: '50ml' },
        pricePaise: 440000,
        compareAtPricePaise: 520000
      }
    ],
    images: [
      {
        id: 'img_kumk_01',
        productId: 'prod_kumkumadi_tailam_03',
        url: '',
        altText: 'Arya Vedic Kumkumadi Tailam Dropper Bottle',
        displayOrder: 1,
        isPrimary: true
      }
    ]
  },
  {
    id: 'prod_chanderi_dupatta_04',
    storeId: 'store_banaras_01',
    storeName: 'Banaras Heritage Handloom Guild',
    storeSlug: 'banaras-heritage-guild',
    categoryId: 'cat_textiles',
    categoryName: 'Handloom & Heritage Textiles',
    title: 'Chanderi Handloom Gossamer Silk Cotton Dupatta',
    slug: 'chanderi-handloom-silk-cotton-dupatta',
    shortDescription: 'Feather-light Chanderi stole with delicate Meenakari floral borders and tissue pallu.',
    description: 'Spun from pure Degi silk warp and fine Egyptian cotton weft, this translucent drape features traditional ashrafi motifs and real zari piping. Lightweight, royal, and breathable for high occasions.',
    originRegion: 'Chanderi, Madhya Pradesh',
    artisanCraftTechnique: 'Handloom Eknaliya Weave',
    hsnCode: '5007',
    basePricePaise: 540000, // ₹5,400.00
    compareAtPricePaise: 650000,
    isFeatured: false,
    moderationStatus: 'approved',
    hasVariants: false,
    viewsCount: 710,
    salesCount: 22,
    weightGrams: 280,
    ratingAvg: 4.85,
    ratingCount: 19,
    inventoryAvailable: 8,
    createdAt: '2026-01-22T00:00:00.000Z',
    variants: [
      {
        id: 'var_chanderi_std',
        productId: 'prod_chanderi_dupatta_04',
        sku: 'BNS-CHND-IVR',
        title: 'Ivory Gold Tissue (2.5m)',
        options: { Color: 'Ivory Gold' },
        pricePaise: 540000,
        compareAtPricePaise: 650000
      }
    ],
    images: [
      {
        id: 'img_chanderi_01',
        productId: 'prod_chanderi_dupatta_04',
        url: '',
        altText: 'Chanderi Handloom Silk Dupatta',
        displayOrder: 1,
        isPrimary: true
      }
    ]
  },
  {
    id: 'prod_kansa_dinner_set_05',
    storeId: 'store_dhokra_02',
    storeName: 'Bastar Dhokra Bell Metal Guild',
    storeSlug: 'bastar-dhokra-guild',
    categoryId: 'cat_brass_metal',
    categoryName: 'Artisan Metal & Brassware',
    title: 'Hand-Hammered Kansa Bronze Therapeutic Thali Set (6-Piece)',
    slug: 'hand-hammered-kansa-bronze-thali-set',
    shortDescription: 'Ayurvedic pure bell metal (78% Copper, 22% Tin) dining set for alkaline digestive health.',
    description: 'Each plate and bowl is heated to glowing crimson and hammered thousands of times by master thatheras to achieve a luminous golden chime and mirror polish. Scientifically proven to balance doshas and enhance dining experience.',
    originRegion: 'Sarthebari, Assam & Bastar',
    artisanCraftTechnique: 'Forged & Hand-Hammered Kansa',
    hsnCode: '7418',
    basePricePaise: 920000, // ₹9,200.00
    compareAtPricePaise: 1100000,
    isFeatured: false,
    moderationStatus: 'approved',
    hasVariants: false,
    viewsCount: 890,
    salesCount: 15,
    weightGrams: 3100,
    ratingAvg: 4.90,
    ratingCount: 12,
    inventoryAvailable: 7,
    createdAt: '2026-01-25T00:00:00.000Z',
    variants: [
      {
        id: 'var_kansa_6pc',
        productId: 'prod_kansa_dinner_set_05',
        sku: 'BSTR-KNS-THL-6',
        title: '6-Piece Royal Banquet Set',
        options: { Pieces: '1 Thali, 3 Katoris, 1 Halwa Plate, 1 Tumbler' },
        pricePaise: 920000,
        compareAtPricePaise: 1100000
      }
    ],
    images: [
      {
        id: 'img_kansa_01',
        productId: 'prod_kansa_dinner_set_05',
        url: '',
        altText: 'Hand Hammered Kansa Bronze Thali',
        displayOrder: 1,
        isPrimary: true
      }
    ]
  }
];

export const DEMO_ADDRESSES: Address[] = [
  {
    id: 'addr_mumbai_01',
    userId: 'user_customer_01',
    fullName: 'Srijal Kumar',
    phone: '+91 98110 99887',
    addressLine1: 'B-402, Sea Green Heights, Worli Sea Face',
    addressLine2: 'Behind Coast Guard Headquarters',
    landmark: 'Opposite Worli Dairy',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400018',
    country: 'India',
    isDefault: true,
    addressType: 'home',
    createdAt: '2026-01-16T00:00:00.000Z'
  },
  {
    id: 'addr_blr_02',
    userId: 'user_customer_01',
    fullName: 'Srijal Kumar (Work)',
    phone: '+91 98110 99887',
    addressLine1: 'Suite 601, Embassy Golf Links Business Park',
    addressLine2: 'Intermediate Ring Road, Domlur',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560071',
    country: 'India',
    isDefault: false,
    addressType: 'work',
    createdAt: '2026-01-20T00:00:00.000Z'
  }
];

export const DEMO_COUPONS: Coupon[] = [
  {
    id: 'cpn_artisan10',
    code: 'ARTISAN10',
    description: 'Flat 10% discount on artisan handlooms and metal crafts (up to ₹2,000)',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmountPaise: 300000, // ₹3,000 min order
    maxDiscountPaise: 200000, // max ₹2,000 discount
    timesUsed: 64,
    isActive: true
  },
  {
    id: 'cpn_swadeshi500',
    code: 'SWADESHI500',
    description: 'Flat ₹500 off on all orders above ₹4,000',
    discountType: 'flat_paise',
    discountValue: 50000, // ₹500
    minOrderAmountPaise: 400000,
    timesUsed: 128,
    isActive: true
  }
];

export const DEMO_LEDGER_ENTRIES: SellerLedgerEntry[] = [
  {
    id: 'ldg_01',
    storeId: 'store_banaras_01',
    entryType: 'order_credit',
    amountPaise: 3850000,
    runningBalancePaise: 3850000,
    referenceType: 'order_item',
    referenceId: 'item_sample_1',
    description: 'Credit for Order #STD-2026-8812 - Pure Katan Silk Saree',
    createdAt: '2026-01-20T11:00:00.000Z'
  },
  {
    id: 'ldg_02',
    storeId: 'store_banaras_01',
    entryType: 'commission_debit',
    amountPaise: -462000, // 12% commission
    runningBalancePaise: 3388000,
    referenceType: 'order_item',
    referenceId: 'item_sample_1',
    description: 'Platform commission fee (12%) on Order #STD-2026-8812',
    createdAt: '2026-01-20T11:00:01.000Z'
  },
  {
    id: 'ldg_03',
    storeId: 'store_banaras_01',
    entryType: 'gst_debit',
    amountPaise: -83160, // 18% GST on marketplace commission
    runningBalancePaise: 3304840,
    referenceType: 'order_item',
    referenceId: 'item_sample_1',
    description: 'GST (18%) on marketplace commission fee',
    createdAt: '2026-01-20T11:00:02.000Z'
  },
  {
    id: 'ldg_04',
    storeId: 'store_banaras_01',
    entryType: 'tcs_debit',
    amountPaise: -38500, // 1% TCS
    runningBalancePaise: 3266340,
    referenceType: 'order_item',
    referenceId: 'item_sample_1',
    description: 'TCS (1%) under Section 52 CGST Act',
    createdAt: '2026-01-20T11:00:03.000Z'
  }
];
