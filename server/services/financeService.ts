/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Multi-Vendor Finance & Auditable Ledger Engine
 */

import { db } from '../db/adapter.js';
import { SellerLedgerEntry, OrderItem } from '../types.js';

export interface CommissionBreakdown {
  grossSalesPaise: number;
  commissionRatePercent: number;
  commissionPaise: number;
  gstOnCommissionPaise: number; // 18% GST on marketplace commission
  tcsPaise: number; // 1% TCS under GST
  netPayableToSellerPaise: number;
}

export class FinanceService {
  /**
   * Calculate auditable commission breakdown according to Indian GST & marketplace regulations
   */
  public static calculateCommission(grossSalesPaise: number, commissionRatePercent: number): CommissionBreakdown {
    // 1. Base Commission
    const commissionPaise = Math.round((grossSalesPaise * commissionRatePercent) / 100);

    // 2. 18% GST on Marketplace Commission fee
    const gstOnCommissionPaise = Math.round((commissionPaise * 18) / 100);

    // 3. 1% TCS (Tax Collected at Source) on Gross Sales
    const tcsPaise = Math.round((grossSalesPaise * 1) / 100);

    // 4. Net payable to seller
    const netPayableToSellerPaise = grossSalesPaise - commissionPaise - gstOnCommissionPaise - tcsPaise;

    return {
      grossSalesPaise,
      commissionRatePercent,
      commissionPaise,
      gstOnCommissionPaise,
      tcsPaise,
      netPayableToSellerPaise
    };
  }

  /**
   * Post ledger entries for an order item credited to the seller
   */
  public static async recordOrderLedger(item: OrderItem, orderNumber: string) {
    const currentBalance = await db.getSellerBalancePaise(item.storeId);

    // 1. Credit Gross Sales
    let newBal = currentBalance + item.lineTotalPaise;
    const creditEntry: SellerLedgerEntry = {
      id: `ldg_${Date.now()}_cr_${Math.random().toString(36).substring(2, 6)}`,
      storeId: item.storeId,
      entryType: 'order_credit',
      amountPaise: item.lineTotalPaise,
      runningBalancePaise: newBal,
      referenceType: 'order_item',
      referenceId: item.id,
      description: `Sales Credit: Order #${orderNumber} (${item.productTitle})`,
      createdAt: new Date().toISOString()
    };
    await db.addLedgerEntry(creditEntry);

    // 2. Commission Debit
    newBal -= item.commissionAmountPaise;
    const commEntry: SellerLedgerEntry = {
      id: `ldg_${Date.now()}_cm_${Math.random().toString(36).substring(2, 6)}`,
      storeId: item.storeId,
      entryType: 'commission_debit',
      amountPaise: -item.commissionAmountPaise,
      runningBalancePaise: newBal,
      referenceType: 'order_item',
      referenceId: item.id,
      description: `Platform Fee (${item.applicableCommissionRate}%): Order #${orderNumber}`,
      createdAt: new Date().toISOString()
    };
    await db.addLedgerEntry(commEntry);

    // 3. 18% GST on Platform Fee Debit
    const gstFee = Math.round((item.commissionAmountPaise * 18) / 100);
    newBal -= gstFee;
    const gstEntry: SellerLedgerEntry = {
      id: `ldg_${Date.now()}_gst_${Math.random().toString(36).substring(2, 6)}`,
      storeId: item.storeId,
      entryType: 'gst_debit',
      amountPaise: -gstFee,
      runningBalancePaise: newBal,
      referenceType: 'order_item',
      referenceId: item.id,
      description: `18% GST on Platform Fee: Order #${orderNumber}`,
      createdAt: new Date().toISOString()
    };
    await db.addLedgerEntry(gstEntry);

    // 4. 1% TCS Debit
    const tcsFee = Math.round((item.lineTotalPaise * 1) / 100);
    newBal -= tcsFee;
    const tcsEntry: SellerLedgerEntry = {
      id: `ldg_${Date.now()}_tcs_${Math.random().toString(36).substring(2, 6)}`,
      storeId: item.storeId,
      entryType: 'tcs_debit',
      amountPaise: -tcsFee,
      runningBalancePaise: newBal,
      referenceType: 'order_item',
      referenceId: item.id,
      description: `1% TCS under Sec 52 CGST Act: Order #${orderNumber}`,
      createdAt: new Date().toISOString()
    };
    await db.addLedgerEntry(tcsEntry);

    return newBal;
  }

  /**
   * Process auditable refund reversal in seller ledger
   */
  public static async recordRefundLedger(item: OrderItem, orderNumber: string, refundReason: string) {
    const currentBalance = await db.getSellerBalancePaise(item.storeId);
    let newBal = currentBalance;

    // 1. Debit the gross sales back
    newBal -= item.lineTotalPaise;
    await db.addLedgerEntry({
      id: `ldg_${Date.now()}_ref_${Math.random().toString(36).substring(2, 6)}`,
      storeId: item.storeId,
      entryType: 'refund_debit',
      amountPaise: -item.lineTotalPaise,
      runningBalancePaise: newBal,
      referenceType: 'return',
      referenceId: item.id,
      description: `Refund Reversal: Order #${orderNumber} (${refundReason})`,
      createdAt: new Date().toISOString()
    });

    // 2. Re-credit the platform commission
    newBal += item.commissionAmountPaise;
    await db.addLedgerEntry({
      id: `ldg_${Date.now()}_comrev_${Math.random().toString(36).substring(2, 6)}`,
      storeId: item.storeId,
      entryType: 'commission_reversal_credit',
      amountPaise: item.commissionAmountPaise,
      runningBalancePaise: newBal,
      referenceType: 'return',
      referenceId: item.id,
      description: `Reversal of Platform Fee: Order #${orderNumber}`,
      createdAt: new Date().toISOString()
    });

    return newBal;
  }
}
