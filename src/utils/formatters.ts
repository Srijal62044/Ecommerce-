/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Format integer paise into Indian Rupee format (e.g., 3850000 paise -> ₹38,500.00)
 */
export function formatPaise(paise: number, includeDecimals = true): string {
  const rupees = paise / 100;
  if (!includeDecimals && Number.isInteger(rupees)) {
    return `₹${rupees.toLocaleString('en-IN')}`;
  }
  return `₹${rupees.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return isoString;
  }
}

export function isValidIndianPincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode.trim());
}

export function isValidIndianPhone(phone: string): boolean {
  return /^(\+91[\-\s]?)?[6-9]\d{9}$/.test(phone.trim());
}
