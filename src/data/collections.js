/**
 * Editorial collections rail (PRD §12).
 *
 * Names and descriptions are written to match the photograph shown on each
 * card, since the photography is sourced rather than art-directed to a brief.
 */
/**
 * Editorial collections rail (PRD §12).
 *
 * `filter` maps each card onto a category in src/data/categories.js, so
 * clicking a card actually filters the grid rather than only scrolling to it.
 * Every value here must exist in the `filters` list.
 */
export const collections = [
  {
    id: 'tailoring',
    name: 'Tailoring',
    description: 'Checked suiting and pressed creases.',
    image: '/images/photos/collection-tailoring.jpg',
    alt: 'Brown checked three-piece suit displayed on a white mannequin',
    filter: 'tailoring',
  },
  {
    id: 'dresses',
    name: 'Dresses',
    description: 'Feather-light linen, tiered seams.',
    image: '/images/photos/collection-dresses.jpg',
    alt: 'White tiered linen dresses hanging on a rail',
    filter: 'dresses',
  },
  {
    id: 'knitwear',
    name: 'Knitwear',
    description: 'Merino in blush and rose.',
    image: '/images/photos/collection-knitwear.jpg',
    alt: 'Folded grey merino knitwear beside a pair of brown leather shoes',
    filter: 'tops',
  },
  {
    id: 'footwear',
    name: 'Footwear',
    description: 'Brogues, derbies and clean white leather.',
    image: '/images/photos/collection-shoes.jpg',
    alt: 'Pair of tan leather brogue shoes beside a polka dot shirt',
    filter: 'shoes',
  },
  {
    id: 'denim',
    name: 'Denim',
    description: 'Straight and tapered, rigid selvedge.',
    image: '/images/photos/collection-denim.jpg',
    alt: 'Person wearing straight leg blue jeans with brown leather boots',
    filter: 'bottoms',
  },
]
