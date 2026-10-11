/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext.js';
import { ShieldCheck, Mail, Phone, MapPin, Send, HelpCircle } from 'lucide-react';

export const HelpContactPage: React.FC = () => {
  const { showNotification } = useMarketplace();
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    setIsSubmitted(true);
    showNotification('Grievance ticket created. Redressal acknowledgment reference #GRV-2026-991 dispatched.');
  };

  const faqs = [
    {
      q: 'How does multi-vendor split delivery work?',
      a: 'When your bag contains works from different artisan guilds (e.g. Banaras Weaves and Bastar Dhokra), each workshop packs and dispatches their heirloom directly via express courier. You receive individual tracking airway bills for each package.'
    },
    {
      q: 'Are all handicrafts certified with authentic GI Tags?',
      a: 'Yes. Every guild on Sutradhar must furnish valid Geographical Indication (GI) registration certificates and Silk Mark India credentials before catalog approval.'
    },
    {
      q: 'What payment methods are supported?',
      a: 'We accept instant UPI (Google Pay, PhonePe, Paytm, BHIM), RuPay, Visa & Mastercard debit/credit cards, Netbanking across all Indian banks, and Cash on Delivery (COD) with verification OTP.'
    },
    {
      q: 'How does the 7-day return process function?',
      a: 'You can request a doorstep reverse pickup from your Account > Purchases view within 7 days of receiving the item. Our logistics partners collect the parcel in original packaging.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-12">
      <div className="border-b border-stone-200 pb-6 text-center">
        <h1 className="font-serif text-3xl font-semibold text-stone-900">
          Support & Grievance Redressal Desk
        </h1>
        <p className="text-xs text-stone-600 mt-1 max-w-lg mx-auto">
          Dedicated assistance for collectors, patrons, and artisan workshops across India.
        </p>
      </div>

      {/* Statutory Grievance Redressal Officer Contact */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200 space-y-4 text-xs text-stone-700">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 uppercase tracking-wider pb-2 border-b border-stone-100">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Statutory Compliance under Consumer Protection (E-Commerce) Rules 2020</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div>
            <div className="text-stone-500 text-[11px] uppercase">Grievance Officer</div>
            <div className="font-semibold text-stone-900 mt-0.5">Priyadarshini Iyer</div>
            <div className="text-stone-500 text-[11px] mt-1">Nodal Officer (E-Commerce Compliance)</div>
          </div>

          <div>
            <div className="text-stone-500 text-[11px] uppercase">Official Channels</div>
            <div className="font-mono text-stone-900 mt-0.5">grievance@sutradhar.in</div>
            <div className="font-mono text-stone-600 text-[11px] mt-1">+91 80 4910 2000</div>
          </div>

          <div>
            <div className="text-stone-500 text-[11px] uppercase">Registered Address</div>
            <div className="text-stone-900 mt-0.5">Sūtradhār Heritage Towers, 14th Floor</div>
            <div className="text-stone-500 text-[11px] mt-1">MG Road, Bengaluru, Karnataka - 560001</div>
          </div>
        </div>

        <p className="text-[11px] text-stone-500 pt-2 border-t border-stone-100">
          In accordance with Rule 5(9) of the E-Commerce Rules, all consumer complaints are acknowledged within 48 hours and redressed within 30 days of receipt.
        </p>
      </div>

      {/* FAQs */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-semibold text-stone-900">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <div key={f.q} className="bg-white p-5 rounded border border-stone-200 text-xs space-y-1.5">
              <h3 className="font-semibold text-stone-900 text-sm">{f.q}</h3>
              <p className="text-stone-600 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200 space-y-4">
        <h2 className="font-serif text-xl font-semibold text-stone-900">
          Submit an Inquiry or Redressal Ticket
        </h2>

        {isSubmitted ? (
          <div className="p-4 bg-emerald-50 text-emerald-950 rounded border border-emerald-200 text-xs">
            Your grievance has been logged under Reference ID #GRV-2026-991. You will receive an SMS and email acknowledgment shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Subject / Order ID</label>
              <input
                type="text"
                required
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="e.g. Delivery ETA for Order #STD-2026-8812"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded text-stone-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Detailed Message</label>
              <textarea
                required
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="Describe your query or request..."
                rows={4}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded text-stone-900"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-stone-900 text-white font-semibold text-xs rounded hover:bg-stone-800 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-amber-300" />
              <span>Submit to Helpdesk</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
