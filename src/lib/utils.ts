import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency values in Ghana Cedis (GHS)
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string with ₵ symbol
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  options: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    compact?: boolean;
  } = {}
): string {
  const {
    showSymbol = true,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    compact = false
  } = options;

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
  
  if (isNaN(numericAmount)) {
    return showSymbol ? '₵0.00' : '0.00';
  }

  if (compact && numericAmount >= 1000) {
    if (numericAmount >= 1000000) {
      const formatted = (numericAmount / 1000000).toFixed(1);
      return showSymbol ? `₵${formatted}M` : `${formatted}M`;
    } else {
      const formatted = (numericAmount / 1000).toFixed(1);
      return showSymbol ? `₵${formatted}K` : `${formatted}K`;
    }
  }

  const formatted = numericAmount.toLocaleString('en-GH', {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return showSymbol ? `₵${formatted}` : formatted;
}
