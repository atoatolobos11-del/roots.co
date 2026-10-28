import { Leaf, Scale, Users, Hammer } from 'lucide-react'

/** Everything content-driven that is not a product: nav, copy, promo blocks. */

export const FREE_SHIPPING_THRESHOLD = 75

export const announcementMessages = [
  `Free shipping on orders over $${FREE_SHIPPING_THRESHOLD}`,
  'New season drop — up to 50% off selected styles',
  '30-day free returns on every order',
]

/** Main navigation (PRD §4.2). `filter` maps onto the product grid. */
export const navLinks = [
  { label: 'New In', href: '#new-arrivals', filter: 'all' },
  { label: 'Tops', href: '#new-arrivals', filter: 'tops' },
  { label: 'Tailoring', href: '#new-arrivals', filter: 'tailoring' },
  { label: 'Shoes', href: '#new-arrivals', filter: 'shoes' },
  { label: 'Accessories', href: '#new-arrivals', filter: 'accessories' },
  { label: 'Sale', href: '#new-arrivals', filter: 'sale', accent: true },
]

/** Service benefits strip (PRD §6). */
export const benefits = [
  {
    icon: 'Truck',
    title: 'Free Shipping',
    text: `On orders over $${FREE_SHIPPING_THRESHOLD}`,
  },
  { icon: 'RotateCcw', title: 'Easy Returns', text: '30-day return policy' },
  { icon: 'Lock', title: 'Secure Payment', text: '100% secure checkout' },
  { icon: 'MapPin', title: 'Stores Near You', text: 'Find a ROOTS.CO store' },
]

/** Promotional card row (PRD §11). */
export const promos = [
  {
    id: 'student',
    variant: 'dark',
    image: '/images/photos/banner-satchel.jpg',
    alt: 'Worn brown leather satchel bag resting on a stone bench',
    kicker: 'Student Discount',
    title: ['Students get', '10% off'],
    text: 'Verify with your student email and take 10% off your first order.',
    cta: 'Learn More',
    topic: 'contact',
  },
  {
    id: 'new-season',
    variant: 'light',
    image: '/images/photos/banner-puffer.jpg',
    alt: 'Rust coloured quilted puffer jacket on a white mannequin',
    kicker: 'Autumn / Winter',
    title: ['New season', 'new look'],
    text: 'Relaxed tailoring and warm neutrals, restated for the season ahead.',
    cta: 'Shop Now',
    href: '#new-arrivals',
    filter: 'all',
  },
  {
    id: 'store',
    variant: 'image',
    image: '/images/photos/banner-tote.jpg',
    alt: 'Black structured leather tote photographed on a white studio background',
    kicker: 'Visit Us',
    title: ['Visit us', 'in store'],
    text: 'Find a ROOTS.CO store near you.',
    cta: 'Find a Store',
    topic: 'stores',
  },
]

/** Dark brand-values band (PRD §15). */
export const brandValues = [
  {
    icon: Leaf,
    title: 'Sustainable Materials',
    text: 'Thoughtfully selected materials for a better future.',
  },
  {
    icon: Scale,
    title: 'Ethical Production',
    text: 'Responsible production and better working practices.',
  },
  {
    icon: Users,
    title: 'Community Focused',
    text: 'Supporting people and communities, locally and globally.',
  },
  {
    icon: Hammer,
    title: 'Built to Last',
    text: 'Quality pieces designed for everyday use.',
  },
]

/** Footer link columns (PRD §16). */
export const footerColumns = [
  {
    title: 'Shop',
    links: [
      { label: 'New In', href: '#new-arrivals', filter: 'all' },
      { label: 'Tops', href: '#new-arrivals', filter: 'tops' },
      { label: 'Tailoring', href: '#new-arrivals', filter: 'tailoring' },
      { label: 'Outerwear', href: '#new-arrivals', filter: 'outerwear' },
      { label: 'Shoes', href: '#new-arrivals', filter: 'shoes' },
      { label: 'Accessories', href: '#new-arrivals', filter: 'accessories' },
      { label: 'Sale', href: '#new-arrivals', filter: 'sale' },
    ],
  },
  // `filter` links apply a category and jump to the grid; `topic` links open
  // the help/about dialog (see src/data/info.js). No link relies on a hash
  // target that does not exist.
  {
    title: 'Help',
    links: [
      { label: 'Contact', topic: 'contact' },
      { label: 'Shipping', topic: 'shipping' },
      { label: 'Returns', topic: 'returns' },
      { label: 'FAQ', topic: 'faq' },
      { label: 'Size Guide', topic: 'size-guide' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Our Story', topic: 'story' },
      { label: 'Sustainability', topic: 'sustainability' },
      { label: 'Stores', topic: 'stores' },
      { label: 'Careers', topic: 'careers' },
    ],
  },
]

/** Chat widget scripted replies (PRD §13). */
export const chatReplies = {
  'Order help': 'Happy to help with your order. Share your order number and I can check its status right away.',
  'Product question': 'Ask away — I can tell you about fit, fabric or care for any piece in the collection.',
  'Contact support': 'Our care team replies within one business day at support@root.co.',
}

export const supportHours = 'Mon–Fri, 9:00–18:00 CET'
