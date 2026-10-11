/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext.js';
import { ShieldCheck, Truck, RefreshCw, Scale, FileText } from 'lucide-react';

export const PolicyPage: React.FC<{ policyType: 'privacy' | 'terms' | 'shipping' | 'returns' | 'refunds' }> = ({
  policyType
}) => {
  const { navigate } = useMarketplace();

  const getPolicyContent = () => {
    switch (policyType) {
      case 'privacy':
        return {
          title: 'Privacy Policy & Data Governance',
          icon: ShieldCheck,
          summary: 'Compliant with the Digital Personal Data Protection Act (DPDP Act) 2023.',
          sections: [
            {
              h: '1. Collection of Data',
              p: 'We collect customer names, delivery addresses, telephone numbers, and email addresses strictly for the fulfillment of artisanal purchases. We do NOT store unencrypted payment card credentials or UPI PINs.'
            },
            {
              h: '2. Multi-Vendor Data Sharing',
              p: 'Sellers and artisan workshops receive customer shipping information solely for generating shipping labels and dispatching physical consignments. Sellers are contractually barred from secondary marketing.'
            },
            {
              h: '3. Data Security & Storage',
              p: 'Customer information is stored behind PostgreSQL Row Level Security (RLS) policies with strict role-based access control.'
            }
          ]
        };
      case 'terms':
        return {
          title: 'Terms of Sale & Marketplace Agreement',
          icon: Scale,
          summary: 'Governed by the Consumer Protection (E-Commerce) Rules, 2020.',
          sections: [
            {
              h: '1. Multi-Vendor Marketplace Model',
              p: 'Sūtradhār functions as a marketplace facilitator connecting independent artisan producers with buyers. Individual seller workshops are responsible for product craftsmanship warranty and compliance.'
            },
            {
              h: '2. Pricing & Currency',
              p: 'All prices are quoted in Indian Rupees (INR) and calculated in integer paise. Prices include applicable Goods & Services Tax (GST).'
            },
            {
              h: '3. Cancellation & Integrity',
              p: 'Orders may be cancelled prior to consignment dispatch by the artisan. Concurrent purchases reserve stock atomically to prevent overselling.'
            }
          ]
        };
      case 'shipping':
        return {
          title: 'Pan-India Insured Shipping Policy',
          icon: Truck,
          summary: 'Temperature & shock-resistant transit boxes with Delhivery & Blue Dart.',
          sections: [
            {
              h: '1. Delivery Timelines',
              p: 'Standard transit spans 2 to 4 business days across Tier 1 & Tier 2 cities in India. Remote mountain and island postal circles may require up to 6 business days.'
            },
            {
              h: '2. Shipping Charges',
              p: 'Consignments exceeding ₹1,000 (100,000 paise) qualify for complimentary insured shipping. Orders below ₹1,000 incur a standard ₹99 fulfillment charge.'
            },
            {
              h: '3. Split Shipments',
              p: 'Because items originate from sovereign artisan clusters across India, multi-item orders may arrive in separate packages with distinct tracking airway bills (AWB).'
            }
          ]
        };
      case 'returns':
      case 'refunds':
        return {
          title: '7-Day Return & Direct Refund Policy',
          icon: RefreshCw,
          summary: 'Zero hassle doorstep reverse pickups with automated ledger adjustments.',
          sections: [
            {
              h: '1. Return Window',
              p: 'Collectors may initiate a return within 7 calendar days of delivery for any weave defect, dimension mismatch, or transit damage.'
            },
            {
              h: '2. Reverse Pickup Logistics',
              p: 'Our courier partners collect the item in original packaging with Silk Mark or artisan tags intact.'
            },
            {
              h: '3. Refund Reversal',
              p: 'Upon warehouse verification, refunds are credited back to the original UPI, Card, or Bank account within 24–48 hours, and reversed in the seller ledger.'
            }
          ]
        };
    }
  };

  const content = getPolicyContent();
  const Icon = content.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-8">
      <div className="border-b border-stone-200 pb-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-900 font-semibold mb-2">
          <Icon className="w-4 h-4" />
          <span>Statutory Compliance</span>
        </div>
        <h1 className="font-serif text-3xl font-semibold text-stone-900">{content.title}</h1>
        <p className="text-xs text-stone-600 mt-1">{content.summary}</p>
      </div>

      <div className="bg-white p-8 rounded-lg border border-stone-200 space-y-6 text-xs text-stone-700 leading-relaxed">
        {content.sections.map((s) => (
          <div key={s.h} className="space-y-1.5">
            <h3 className="font-semibold text-stone-900 text-sm">{s.h}</h3>
            <p>{s.p}</p>
          </div>
        ))}

        <div className="pt-6 border-t border-stone-100 text-[11px] text-stone-500">
          Last Revised: 11 October 2026 · Sūtradhār Artisan Marketplace Private Limited · Ministry of Consumer Affairs
        </div>
      </div>
    </div>
  );
};
