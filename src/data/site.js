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
  { label: 'Women', href: '#new-arrivals', filter: 'tops' },
  { label: 'Men', href: '#new-arrivals', filter: 'men' },
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
  { icon: 'MapPin', title: 'Stores Near You', text: 'Find a ROOT.CO store' },
]

/** Promotional card row (PRD §11). */
export const promos = [
  {
    id: 'student',
    variant: 'dark',
    image: '/images/banners/student.svg',
    alt: 'Student wearing a ROOT.CO coat in a studio',
    kicker: 'Student Discount',
    title: ['Students get', '10% off'],
    text: 'Verify with your student email and take 10% off your first order.',
    cta: 'Learn More',
    href: '#newsletter',
  },
  {
    id: 'new-season',
    variant: 'light',
    image: '/images/banners/new-season.svg',
    alt: 'Model wearing the new season linen dress',
    kicker: 'Autumn / Winter',
    title: ['New season', 'new look'],
    text: 'Relaxed tailoring and warm neutrals, restated for the season ahead.',
    cta: 'Shop Now',
    href: '#new-arrivals',
  },
  {
    id: 'store',
    variant: 'image',
    image: '/images/banners/store.svg',
    alt: 'ROOT.CO store interior with a window display',
    kicker: 'Visit Us',
    title: ['Visit us', 'in store'],
    text: 'Find a ROOT.CO store near you.',
    cta: 'Find a Store',
    href: '#stores',
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
      { label: 'New In', href: '#new-arrivals' },
      { label: 'Women', href: '#new-arrivals', filter: 'tops' },
      { label: 'Men', href: '#new-arrivals', filter: 'men' },
      { label: 'Shoes', href: '#new-arrivals', filter: 'shoes' },
      { label: 'Accessories', href: '#new-arrivals', filter: 'accessories' },
      { label: 'Sale', href: '#new-arrivals', filter: 'sale' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Contact', href: '#contact' },
      { label: 'Shipping', href: '#contact' },
      { label: 'Returns', href: '#contact' },
      { label: 'FAQ', href: '#contact' },
      { label: 'Size Guide', href: '#contact' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Our Story', href: '#values' },
      { label: 'Sustainability', href: '#values' },
      { label: 'Stores', href: '#stores' },
      { label: 'Careers', href: '#contact' },
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
