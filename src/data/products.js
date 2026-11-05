/**
 * Updated product catalogue with new T‑Shirt items.
 */

export const SALE_CATEGORY = 'Sale';

export const products = [
  {
    id: 1,
    slug: 'gray-roots-logo-tshirt',
    name: 'Gray ROOTS Logo T-Shirt',
    tagline: '',
    price: 499,
    category: 'T-Shirts',
    image: '/images/products/2.jpg',
    hoverImage: '/images/products/2.jpg',
    alt: 'Gray ROOTS Logo T-Shirt',
    colors: [],
    sizes: [],
    tags: []
  },
  {
    id: 2,
    slug: 'red-roots-logo-tshirt',
    name: 'Red ROOTS Logo T-Shirt',
    tagline: '',
    price: 499,
    category: 'T-Shirts',
    image: '/images/products/3.jpg',
    hoverImage: '/images/products/3.jpg',
    alt: 'Red ROOTS Logo T-Shirt',
    colors: [],
    sizes: [],
    tags: []
  },
  {
    id: 3,
    slug: 'black-roots-logo-tshirt',
    name: 'Black ROOTS Logo T-Shirt',
    tagline: '',
    price: 499,
    category: 'T-Shirts',
    image: '/images/products/4.jpg',
    hoverImage: '/images/products/4.jpg',
    alt: 'Black ROOTS Logo T-Shirt',
    colors: [],
    sizes: [],
    tags: []
  },
  {
    id: 4,
    slug: 'royal-blue-graphic-tshirt',
    name: 'Royal Blue Graphic T-Shirt',
    tagline: '',
    price: 599,
    category: 'T-Shirts',
    image: '/images/products/6.jpg',
    hoverImage: '/images/products/6.jpg',
    alt: 'Royal Blue Graphic T-Shirt',
    colors: [],
    sizes: [],
    tags: []
  },
  {
    id: 5,
    slug: 'forest-green-graphic-tshirt',
    name: 'Forest Green Graphic T-Shirt',
    tagline: '',
    price: 599,
    category: 'T-Shirts',
    image: '/images/products/7.jpg',
    hoverImage: '/images/products/7.jpg',
    alt: 'Forest Green Graphic T-Shirt',
    colors: [],
    sizes: [],
    tags: []
  },
  {
    id: 6,
    slug: 'white-roots-nature-graphic-tshirt',
    name: 'White ROOTS Nature Graphic T-Shirt',
    tagline: '',
    price: 649,
    category: 'T-Shirts',
    image: '/images/products/10.jpg',
    hoverImage: '/images/products/10.jpg',
    alt: 'White ROOTS Nature Graphic T-Shirt (Front & Back)',
    colors: [],
    sizes: [],
    tags: []
  }
];

/** Look up a product by id. Used by the cart to re‑hydrate a persisted line. */
export const getProductById = (id) => products.find((p) => p.id === id);
