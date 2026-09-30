/**
 * Content for the help / about dialog opened by the footer, the promo cards
 * and the support widget. Each topic renders a title, a short intro and a set
 * of entries, so the same component covers FAQ, shipping, returns, the size
 * guide and the store list without hard-coding copy in JSX.
 */

export const infoTopics = {
  contact: {
    title: 'Contact us',
    intro: 'Our care team replies within one business day.',
    entries: [
      { q: 'Email', a: 'support@root.co' },
      { q: 'Phone', a: '+1 (555) 018-4400, Mon–Fri 9am–6pm ET' },
      { q: 'Live chat', a: 'Use the support bubble in the corner of any page.' },
      { q: 'Press', a: 'press@root.co' },
    ],
  },

  shipping: {
    title: 'Shipping',
    intro: 'Free standard shipping on orders over $75.',
    entries: [
      { q: 'Standard', a: '3–5 business days. Free over $75, otherwise $6.' },
      { q: 'Express', a: '1–2 business days. $14 flat rate.' },
      { q: 'Next day', a: 'Order before 2pm ET for next business day. $24.' },
      { q: 'International', a: '7–14 business days. Duties calculated at checkout.' },
    ],
  },

  returns: {
    title: 'Returns & exchanges',
    intro: '30 days free returns, no questions asked.',
    entries: [
      { q: 'How do I start a return?', a: 'Open your order in the account dialog and select "Start a return". We email a prepaid label.' },
      { q: 'What is the window?', a: '30 days from delivery. Items must be unworn with tags attached.' },
      { q: 'Exchanges', a: 'Free for a different size or colour. We hold the replacement until the return arrives.' },
      { q: 'Refunds', a: 'Issued to the original payment method within 5 business days of the return arriving.' },
    ],
  },

  faq: {
    title: 'Frequently asked questions',
    intro: 'The questions we are asked most often.',
    entries: [
      { q: 'Do you ship internationally?', a: 'Yes, to 40 countries. Duties and taxes are calculated at checkout so there is nothing to pay on arrival.' },
      { q: 'How do I find my size?', a: 'Every product page lists measurements in centimetres alongside the size label. See the size guide for how to measure.' },
      { q: 'Are your products genuinely leather?', a: 'Bags and shoes are full-grain leather that develops a patina over time. Everything else is cotton, linen or merino.' },
      { q: 'Can I change my order after placing it?', a: 'Within one hour. After that it is picked and packed, so start a return instead.' },
      { q: 'Is this a real shop?', a: 'No. ROOT.CO is a portfolio project — no orders are placed and no payments are taken.' },
    ],
  },

  'size-guide': {
    title: 'Size guide',
    intro: 'Measurements in centimetres. If you are between sizes, size up.',
    entries: [
      { q: 'XS', a: 'Chest 86 · Waist 71 · Length 66' },
      { q: 'S', a: 'Chest 91 · Waist 76 · Length 68' },
      { q: 'M', a: 'Chest 97 · Waist 82 · Length 70' },
      { q: 'L', a: 'Chest 103 · Waist 88 · Length 72' },
      { q: 'XL', a: 'Chest 109 · Waist 94 · Length 74' },
      { q: 'How to measure', a: 'Chest at the fullest point, waist at the narrowest, length from the shoulder to the hem. Keep the tape level and relaxed.' },
    ],
  },

  stores: {
    title: 'Stores',
    intro: 'Eleven locations, with two more opening this year.',
    entries: [
      { q: 'New York — SoHo', a: '118 Wooster St · Mon–Sat 10–7 · Sun 12–6' },
      { q: 'New York — Williamsburg', a: '142 N 6th St · Mon–Sat 11–7 · Sun 12–6' },
      { q: 'Los Angeles — Silver Lake', a: '2910 Rowena Ave · Daily 11–7' },
      { q: 'Chicago — Wicker Park', a: '1542 N Damen Ave · Mon–Sat 11–7' },
      { q: 'London — Shoreditch', a: '48 Redchurch St · Mon–Sat 10–7 · Sun 12–5' },
      { q: 'Stockists', a: 'Available at Nordstrom, Selfridges and END. in selected regions.' },
    ],
  },

  sustainability: {
    title: 'Sustainability',
    intro: 'A narrow palette, made in small runs, with repair for life.',
    entries: [
      { q: 'Materials', a: 'Organic cotton, European flax linen and mulesing-free merino. Every mill is named on the product page.' },
      { q: 'Production', a: 'Small runs from eleven long-term factories. We produce against demand rather than forecasting.' },
      { q: 'Repairs', a: 'Free repairs for the life of the garment. Send it back and we will mend, re-tape or re-sole it.' },
      { q: 'Packaging', a: 'Recycled and recyclable paper only. No plastic, no void fill.' },
    ],
  },

  careers: {
    title: 'Careers',
    intro: 'We hire rarely and for a long time.',
    entries: [
      { q: 'Open roles', a: 'No positions are open at the moment.' },
      { q: 'Speculative', a: 'We always read design applications. Send work to work@root.co.' },
      { q: 'How we hire', a: 'One conversation, one paid exercise, one conversation. We pay for every exercise.' },
      { q: 'Internships', a: 'Two six-week placements each year, open to students and career changers.' },
    ],
  },

  story: {
    title: 'Our story',
    intro: 'ROOT.CO started as a way to wear fewer things better.',
    entries: [
      { q: '2021', a: 'Founded in a Brooklyn spare room with 40 products and one wool coat.' },
      { q: 'Today', a: 'Eleven stores, a fixed palette, and a repair programme for everything we have ever made.' },
      { q: 'The rule', a: 'Nothing new until something is retired. The wardrobe should get smaller, not bigger.' },
    ],
  },
}

export const infoTopicIds = Object.keys(infoTopics)
