/** Small shared helpers used across the ROOTS.CO UI. */

/** Join conditional class names (tiny `clsx` replacement — no dependency needed). */
export function cn(...parts) {
  return parts.flat(Infinity).filter(Boolean).join(' ')
}

/** Format a numeric price as USD, e.g. 29.9 → "$29.90" */
export function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
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
