import { SITE } from '../data/site.js';

// Returns a formatted price, or null when no verified price exists.
export function formatPrice(price) {
  if (typeof price !== 'number' || Number.isNaN(price)) return null;
  return new Intl.NumberFormat(SITE.locale, {
    style: 'currency',
    currency: SITE.currency,
  }).format(price);
}
