import { products, SALE_CATEGORY } from './products.js'

/**
 * "Shop by category" rail (PRD §7). The Sale tile is deliberately darker
 * to read as a promotional entry point.
 */
export const categories = [
  { id: 'tops', name: 'Tops', image: '/images/categories/tops.svg', alt: 'Tops category' },
  { id: 'bottoms', name: 'Bottoms', image: '/images/categories/bottoms.svg', alt: 'Bottoms category' },
  { id: 'dresses', name: 'Dresses', image: '/images/categories/dresses.svg', alt: 'Dresses category' },
  { id: 'shoes', name: 'Shoes', image: '/images/categories/shoes.svg', alt: 'Shoes category' },
  {
    id: 'accessories',
    name: 'Accessories',
    image: '/images/categories/accessories.svg',
    alt: 'Accessories category',
  },
  { id: 'men', name: 'Men', image: '/images/categories/men.svg', alt: 'Men category' },
  { id: SALE_CATEGORY.toLowerCase(), name: SALE_CATEGORY, image: '/images/categories/sale.svg', alt: 'Sale' },
]

/** Filter chips above the product grid (PRD §8, §22 FR-05). */
export const filters = [
  { id: 'all', name: 'All' },
  { id: 'tops', name: 'Tops' },
  { id: 'bottoms', name: 'Bottoms' },
  { id: 'dresses', name: 'Dresses' },
  { id: 'shoes', name: 'Shoes' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'men', name: 'Men' },
  { id: SALE_CATEGORY.toLowerCase(), name: SALE_CATEGORY },
]

/** Product count per category id, used for the category rail meta line. */
export const categoryCounts = filters.reduce((acc, filter) => {
  acc[filter.id] =
    filter.id === 'all'
      ? products.length
      : filter.id === SALE_CATEGORY.toLowerCase()
        ? products.filter((p) => p.originalPrice).length
        : products.filter((p) => p.category.toLowerCase() === filter.id).length
  return acc
}, {})
