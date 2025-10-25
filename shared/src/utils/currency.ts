/**
 * Currency Utilities
 * Handles Indian Rupee (₹) formatting and operations
 */

export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';

/**
 * Format amount in Indian Rupees with proper locale formatting
 * @param amount - The amount to format
 * @param options - Optional formatting options
 * @returns Formatted currency string (e.g., "₹1,23,456.78")
 */
export function formatCurrency(
  amount: number | string,
  options: {
    showSymbol?: boolean;
    decimals?: number;
    compact?: boolean;
  } = {}
): string {
  const {
    showSymbol = true,
    decimals = 2,
    compact = false,
  } = options;

  // Convert to number if string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Handle invalid numbers
  if (isNaN(numAmount)) {
    return showSymbol ? `${CURRENCY_SYMBOL}0` : '0';
  }

  // Compact mode (e.g., ₹1.2L, ₹45.5K)
  if (compact) {
    return formatCompactCurrency(numAmount, showSymbol);
  }

  // Format using Indian locale
  const formatted = numAmount.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return showSymbol ? `${CURRENCY_SYMBOL}${formatted}` : formatted;
}

/**
 * Format currency in compact form (K for thousands, L for lakhs, Cr for crores)
 * @param amount - The amount to format
 * @param showSymbol - Whether to show currency symbol
 * @returns Compact formatted string (e.g., "₹1.5L")
 */
export function formatCompactCurrency(amount: number, showSymbol: boolean = true): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  let formatted: string;

  if (absAmount >= 10000000) {
    // Crores (1 Crore = 10 Million)
    formatted = `${(absAmount / 10000000).toFixed(2)}Cr`;
  } else if (absAmount >= 100000) {
    // Lakhs (1 Lakh = 100 Thousand)
    formatted = `${(absAmount / 100000).toFixed(2)}L`;
  } else if (absAmount >= 1000) {
    // Thousands
    formatted = `${(absAmount / 1000).toFixed(1)}K`;
  } else {
    formatted = absAmount.toFixed(0);
  }

  const symbol = showSymbol ? CURRENCY_SYMBOL : '';
  return `${sign}${symbol}${formatted}`;
}

/**
 * Parse currency string to number
 * @param currencyString - String like "₹1,23,456.78" or "1,23,456"
 * @returns Parsed number
 */
export function parseCurrency(currencyString: string): number {
  if (!currencyString) return 0;

  // Remove currency symbol, spaces, and commas
  const cleaned = currencyString
    .replace(CURRENCY_SYMBOL, '')
    .replace(/,/g, '')
    .replace(/\s/g, '')
    .trim();

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format currency for input fields (no symbol, maintains user input format)
 * @param value - The value to format
 * @returns Formatted string for input
 */
export function formatCurrencyInput(value: string): string {
  // Remove non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.]/g, '');

  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }

  return cleaned;
}

/**
 * Validate currency amount
 * @param amount - Amount to validate
 * @param options - Validation options
 * @returns Validation result
 */
export function validateCurrencyAmount(
  amount: number | string,
  options: {
    min?: number;
    max?: number;
    allowZero?: boolean;
  } = {}
): { valid: boolean; error?: string } {
  const { min = 0, max = Number.MAX_SAFE_INTEGER, allowZero = false } = options;

  const numAmount = typeof amount === 'string' ? parseCurrency(amount) : amount;

  if (isNaN(numAmount)) {
    return { valid: false, error: 'Invalid amount' };
  }

  if (numAmount === 0 && !allowZero) {
    return { valid: false, error: 'Amount cannot be zero' };
  }

  if (numAmount < min) {
    return { valid: false, error: `Amount must be at least ${formatCurrency(min)}` };
  }

  if (numAmount > max) {
    return { valid: false, error: `Amount cannot exceed ${formatCurrency(max)}` };
  }

  return { valid: true };
}

/**
 * Calculate percentage of amount
 * @param amount - Total amount
 * @param percentage - Percentage (0-100)
 * @returns Calculated amount
 */
export function calculatePercentage(amount: number, percentage: number): number {
  return (amount * percentage) / 100;
}

/**
 * Format donation amount with appropriate sizing
 * @param amount - Amount to format
 * @returns Formatted string
 */
export function formatDonationAmount(amount: number): string {
  return formatCurrency(amount, { showSymbol: true, decimals: 0, compact: false });
}

/**
 * Format event fee based on membership type
 * @param fees - Object containing fees for different membership types
 * @param membershipType - User's membership type
 * @returns Formatted fee or "Free"
 */
export function formatEventFee(
  fees: Record<string, number> | null | undefined,
  membershipType: string
): string {
  if (!fees || !fees[membershipType]) {
    return 'Free';
  }

  const fee = fees[membershipType];
  return fee === 0 ? 'Free' : formatCurrency(fee, { decimals: 0 });
}

/**
 * Get Indian number format explanation
 * @param amount - Amount to explain
 * @returns Human-readable explanation
 */
export function explainIndianNumber(amount: number): string {
  if (amount >= 10000000) {
    const crores = (amount / 10000000).toFixed(2);
    return `${crores} Crore${parseFloat(crores) !== 1 ? 's' : ''}`;
  } else if (amount >= 100000) {
    const lakhs = (amount / 100000).toFixed(2);
    return `${lakhs} Lakh${parseFloat(lakhs) !== 1 ? 's' : ''}`;
  } else if (amount >= 1000) {
    const thousands = (amount / 1000).toFixed(1);
    return `${thousands} Thousand`;
  } else {
    return amount.toFixed(0);
  }
}

/**
 * Split amount display for large numbers (main + suffix)
 * @param amount - Amount to split
 * @returns Object with display value and suffix
 */
export function splitCurrencyDisplay(amount: number): {
  value: string;
  suffix: string;
  full: string;
} {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  let value: string;
  let suffix: string;

  if (absAmount >= 10000000) {
    value = `${sign}${(absAmount / 10000000).toFixed(2)}`;
    suffix = 'Cr';
  } else if (absAmount >= 100000) {
    value = `${sign}${(absAmount / 100000).toFixed(2)}`;
    suffix = 'L';
  } else if (absAmount >= 1000) {
    value = `${sign}${(absAmount / 1000).toFixed(1)}`;
    suffix = 'K';
  } else {
    value = `${sign}${absAmount.toFixed(0)}`;
    suffix = '';
  }

  return {
    value,
    suffix,
    full: `${CURRENCY_SYMBOL}${value}${suffix}`,
  };
}

// Export types for TypeScript users
export type CurrencyFormatOptions = {
  showSymbol?: boolean;
  decimals?: number;
  compact?: boolean;
};

export type ValidationOptions = {
  min?: number;
  max?: number;
  allowZero?: boolean;
};
