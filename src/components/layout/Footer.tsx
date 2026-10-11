/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useMarketplace } from '../../context/MarketplaceContext.js';
import { ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate } = useMarketplace();

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Marketplace Trust Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-14 border-b border-stone-800">
          <div className="flex items-start gap-3.5">
            <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-stone-100">100% Authentic GI Provenance</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Direct procurement from certified weaver guilds and tribal lost-wax craft clusters across India.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <Truck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-stone-100">Pan-India Insured Express</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Partnered with Delhivery & Blue Dart with temperature & tamper-proof artisanal transit boxes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-stone-100">Direct-to-Artisan Fair Payout</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Auditable transparent ledgers ensuring master artisans receive fair remuneration with zero middlemen.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <RefreshCw className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-stone-100">Hassle-Free 7-Day Returns</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Doorstep reverse pickup with instant automated refund adjustments into your source UPI or bank.
              </p>
            </div>
          </div>
        </div>

        {/* Directory & Statutory Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-stone-800 text-xs">
          <div>
            <h5 className="font-semibold text-stone-100 uppercase tracking-wider text-[11px] mb-3">Artisan Collectives</h5>
            <ul className="space-y-2 text-stone-400">
              <li><button onClick={() => navigate('/seller/banaras-heritage-guild')} className="hover:text-amber-300 transition-colors">Banaras Silk Weavers</button></li>
              <li><button onClick={() => navigate('/seller/bastar-dhokra-guild')} className="hover:text-amber-300 transition-colors">Bastar Dhokra Bell Metal</button></li>
              <li><button onClick={() => navigate('/seller/arya-vedic-apothecary')} className="hover:text-amber-300 transition-colors">Malabar Botanical Apothecary</button></li>
              <li><button onClick={() => navigate('/shop')} className="hover:text-amber-300 transition-colors">Explore All Guilds</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-stone-100 uppercase tracking-wider text-[11px] mb-3">Customer Desk</h5>
            <ul className="space-y-2 text-stone-400">
              <li><button onClick={() => navigate('/track-order')} className="hover:text-amber-300 transition-colors">Track Consignment</button></li>
              <li><button onClick={() => navigate('/account')} className="hover:text-amber-300 transition-colors">My Purchases & Returns</button></li>
              <li><button onClick={() => navigate('/help')} className="hover:text-amber-300 transition-colors">Shipping & Pincode Coverage</button></li>
              <li><button onClick={() => navigate('/contact')} className="hover:text-amber-300 transition-colors">Artisan Support Helpdesk</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-stone-100 uppercase tracking-wider text-[11px] mb-3">Partner With Us</h5>
            <ul className="space-y-2 text-stone-400">
              <li><button onClick={() => navigate('/seller/portal')} className="hover:text-amber-300 transition-colors">Seller Portal Dashboard</button></li>
              <li><button onClick={() => navigate('/admin/portal')} className="hover:text-amber-300 transition-colors">Marketplace Administration</button></li>
              <li><button onClick={() => navigate('/help')} className="hover:text-amber-300 transition-colors">Weaver Guild Onboarding</button></li>
              <li><button onClick={() => navigate('/help')} className="hover:text-amber-300 transition-colors">GI Verification Standards</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-stone-100 uppercase tracking-wider text-[11px] mb-3">Statutory & Compliance</h5>
            <p className="text-stone-400 leading-relaxed mb-3">
              Compliant with Consumer Protection (E-Commerce) Rules, 2020 & Information Technology Act.
            </p>
            <div className="text-[11px] text-stone-400 space-y-1">
              <div><strong className="text-stone-300">Grievance Officer:</strong> Priyadarshini Iyer</div>
              <div><strong className="text-stone-300">Email:</strong> grievance@sutradhar.in</div>
              <div><strong className="text-stone-300">Desk:</strong> +91 80 4910 2000 (Mon–Fri 9am–6pm IST)</div>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © 2026 Sūtradhār Artisan Marketplace Private Limited. Handcrafted in India.
          </div>
          <div className="flex items-center gap-4 text-stone-400">
            <button onClick={() => navigate('/policies/privacy')} className="hover:text-stone-200 transition-colors">Privacy Policy</button>
            <span aria-hidden="true">·</span>
            <button onClick={() => navigate('/policies/terms')} className="hover:text-stone-200 transition-colors">Terms of Sale</button>
            <span aria-hidden="true">·</span>
            <button onClick={() => navigate('/policies/shipping')} className="hover:text-stone-200 transition-colors">Shipping & Payouts</button>
            <span aria-hidden="true">·</span>
            <button onClick={() => navigate('/policies/returns')} className="hover:text-stone-200 transition-colors">Returns & Refunds</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
