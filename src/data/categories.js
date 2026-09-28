import { products, SALE_CATEGORY } from './products.js'

/**
 * "Shop by category" rail (PRD §7). The Sale tile is deliberately darker
 * to read as a promotional entry point.
 */
export const categories = [
  { id: 'tops', name: 'Tops', image: '/images/photos/poplin-shirt-rail.jpg', alt: 'Shirts in cream and sand hanging on a rail' },
  { id: 'bottoms', name: 'Bottoms', image: '/images/photos/collection-denim.jpg', alt: 'Straight leg blue jeans with brown leather boots' },
  { id: 'dresses', name: 'Dresses', image: '/images/photos/collection-dresses.jpg', alt: 'White tiered linen dresses hanging on a rail' },
  { id: 'shoes', name: 'Shoes', image: '/images/photos/collection-shoes.jpg', alt: 'Pair of tan leather brogue shoes' },
  {
    id: 'accessories',
    name: 'Accessories',
    image: '/images/photos/structured-leather-tote.jpg',
    alt: 'Black structured leather tote bag',
  },
  { id: 'men', name: 'Men', image: '/images/photos/collection-tailoring.jpg', alt: 'Brown checked three-piece suit on a mannequin' },
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
  { id: 'tailoring', name: 'Tailoring' },
  { id: 'outerwear', name: 'Outerwear' },
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
