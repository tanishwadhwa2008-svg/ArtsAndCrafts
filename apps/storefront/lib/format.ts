/** Formats a decimal-string price + ISO currency for display (e.g. ₹2,500). */
export function formatPrice(price: string, currency: string): string {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return `${currency} ${price}`;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${price}`;
  }
}
