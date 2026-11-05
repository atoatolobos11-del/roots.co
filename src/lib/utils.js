/** Small shared helpers used across the ROOTS.CO UI. */

/** Join conditional class names (tiny `clsx` replacement — no dependency needed). */
export function cn(...parts) {
  return parts.flat(Infinity).filter(Boolean).join(' ')
}

/** Format a numeric price in Philippine pesos, e.g. 499 → "₱499". */
export function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/** Percentage saved on a discounted product, e.g. 25 */
export function discountPercent(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return 0
  return Math.round((1 - price / originalPrice) * 100)
}

/** Case-insensitive match across product name, category and tags. */
export function matchesQuery(product, query) {
  if (!query) return true
  const haystack = [product.name, product.category, product.tagline, ...(product.tags ?? [])]
    .join(' ')
    .toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term))
}
