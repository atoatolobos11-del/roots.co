# ROOTS.CO — Fashion E-Commerce Portfolio

> Project requirement document. Implementation notes live in `README.md`.

## 1. Project Overview

| | |
| --- | --- |
| **Project name** | ROOTS.CO |
| **Type** | Responsive fashion e-commerce portfolio website |
| **Purpose** | Recreate the UI structure, layout, spacing, typography hierarchy, product presentation and overall visual experience of a ROOTS.CO reference design as an original portfolio project |
| **Deployment** | Vercel |
| **Version control** | Git + GitHub |
| **Containerization** | Docker |
| **Frontend** | React + Tailwind CSS |
| **Runtime / tooling** | Node.js |

The reference design is design inspiration only. All branding, product names, copy, icons and
imagery in this project are original or properly licensed — no protected asset is copied.

## 2. Design Goal

A clean, modern fashion shopping homepage with a premium minimalist appearance:

- white / light neutral background
- black and dark-gray typography
- thin borders
- compact navigation
- large fashion imagery
- rounded product cards
- circular category icons
- editorial promotional banners
- product grids
- strong whitespace
- small uppercase labels
- minimal black buttons
- responsive mobile behaviour

## 3. Reference UI Structure

```
Announcement Bar
        ↓
Main Header / Navigation
        ↓
Hero Banner
        ↓
Free Shipping / Returns / Security / Store Info
        ↓
Shop by Category
        ↓
New Arrivals
        ↓
Promotional Cards
        ↓
Explore Collections
        ↓
Sustainability / Brand Values Footer
```

## 4. Header

### 4.1 Top Announcement Bar

Very thin black bar at the very top. Black background, small white uppercase centred text,
24–30 px high, responsive type. `FREE SHIPPING ON ORDERS OVER $75`.

### 4.2 Main Navigation

- **Left** — minimalist `ROOTS.CO` wordmark.
- **Centre (desktop)** — NEW IN, WOMEN, MEN, SHOES, ACCESSORIES, SALE.
- **Right** — search, account, wishlist and shopping bag, using Lucide icons.
- **Desktop** — full horizontal nav, centred menu, utility icons right.
- **Mobile** — logo left, cart and menu icons right, hamburger opens a drawer.
- The header is sticky while scrolling.

## 5. Hero Section

- Large full-width fashion image: female model, male model, neutral studio background, centred
  composition, original/licensed photography.
- Text overlay toward the left: small label, large uppercase headline
  (`WEAR YOUR / CONFIDENCE`), description, primary `SHOP NEW IN` and secondary
  `EXPLORE COLLECTIONS` buttons.
- Hero height adapts to the viewport; mobile repositions the text instead of overflowing.

## 6. Service Benefits Bar

Four columns directly below the hero: FREE SHIPPING (over a threshold), EASY RETURNS (30 days),
SECURE PAYMENT (100% secure checkout), STORES NEAR YOU. Each item has a small icon, a bold
uppercase title and smaller supporting text. Desktop 4-up, mobile 2-column grid or horizontal
scroll.

## 7. Shop by Category

Centred `SHOP BY CATEGORY` section with a `View all →` action. Seven categories: Tops, Bottoms,
Dresses, Shoes, Accessories, Men, Sale. Each uses a circular image with a name below, a consistent
diameter, subtle hover scale, and a darker treatment for Sale.

## 8. New Arrivals

`NEW ARRIVALS` heading, `Fresh styles. Just in.` subheading, `View all →`, and a product grid:
5–6 cards on desktop, 3–4 on tablet, 2 per row or a carousel on mobile.

## 9. Product Card

Every card has the same structure: product image, wishlist heart in the top-right, optional
badge, product name, price and optional original price. On hover the image zooms slightly and a
secondary image is shown, the heart stays accessible, and transitions are smooth. Nothing is
hover-only on mobile.

## 10. Sample Product Data

Fictional products: Ribbed Knit Top, Straight Leg Denim, Linen Blend Dress, Oversized
Sweatshirt, Classic Sneakers, Structured Shoulder Bag, Relaxed Cotton Shirt, Wide Leg Trousers,
Minimal Leather Loafers, Everyday Crossbody Bag.

```js
{
  id: 1,
  name: 'Ribbed Knit Top',
  price: 29.9,
  category: 'Tops',
  image: '/images/products/ribbed-knit-top-1.svg',
  badge: 'NEW',
  isFavorite: false,
}
```

## 11. Promotional Banner Row

Three promotional cards below New Arrivals:

1. **Student discount** — dark/photographic, `STUDENTS GET 10% OFF`, `LEARN MORE`.
2. **New season** — light editorial, `NEW SEASON / NEW LOOK`, `SHOP NOW`.
3. **Visit us in store** — image based, `VISIT US IN STORE`, `FIND A STORE`.

Desktop shows all three side by side; mobile stacks them.

## 12. Explore Collections

`EXPLORE COLLECTIONS` with the supporting line `Handpicked styles for every vibe.` and a
horizontal row of tall image cards: Date Night, Weekend Edit, Workwear, Street Style, Minimal
Essentials. Each card has a full-height image, a dark gradient overlay, the collection title and
an `EXPLORE →` CTA.

## 13. Floating Customer Support Widget

A small fixed widget in the lower-right corner. Closed: a circular chat button. Open: a small
chat card reading `Hi! How can we help?` with Order help, Product question and Contact support
buttons. It must be fixed bottom-right, non-blocking, responsive and minimisable. Frontend-only
for the portfolio.

## 14. Floating Search / Accessibility Control

A small floating circular control near the lower-right may open search, scroll to top or expose
accessibility options. Keep it simple and avoid clutter.

## 15. Brand Values Footer

A dark section with four brand-value concepts — SUSTAINABLE MATERIALS, ETHICAL PRODUCTION,
COMMUNITY FOCUSED, BUILT TO LAST — each with an icon, a short line of copy, and a four-column
desktop / two-column mobile layout.

## 16. Footer Navigation

Standard footer with **Shop** (New In, Women, Men, Shoes, Accessories, Sale), **Help** (Contact,
Shipping, Returns, FAQ, Size Guide), **About** (Our Story, Sustainability, Stores, Careers) and
a **Newsletter** block with an email input and a `SUBSCRIBE` button.

## 17. Responsive Design

| Breakpoint | Behaviour |
| --- | --- |
| Mobile `< 640px` | Hamburger nav, 2-column product grid, horizontal category scrolling, stacked promo cards, smaller hero type, reduced section spacing, accessible support widget |
| Tablet `640–1023px` | 3–4 product columns, two-column promos, condensed nav, responsive hero |
| Desktop `≥ 1024px` | Full nav, 5–6 product columns, three promo cards, large hero, wide collection gallery, four-column footer |

## 18. Visual Design System

The reference palette was cool: `#111111` primary black · `#222222` soft black · `#FFFFFF` white ·
`#F7F7F5` off white · `#E8E8E5` light gray · `#777777` medium gray · `#DCDCD8` border gray ·
`#8C8C7A` accent.

**Shipped palette is warm** to sit with the CC0 catalogue photography, which is cream, camel, tan
leather and denim: `#1C1917` espresso · `#332E2A` soft brown-black · `#FFFFFF` white ·
`#F8F5EF` warm off white · `#EDE7DC` sand · `#7A7267` warm gray · `#DDD5C7` border ·
`#A98A62` camel accent.

The page stays primarily black, white, sand and neutral; accent colour is used sparingly.

## 19. Typography

One modern sans-serif family used consistently (Inter, Manrope, DM Sans or Montserrat).

| Level | Size |
| --- | --- |
| Hero H1 | 56–80 px desktop |
| Section H2 | 24–36 px |
| Product name | 13–15 px |
| Navigation | 10–12 px uppercase |
| Body | 12–15 px |

Mobile typography scales down responsively.

## 20. Spacing and UI Rules

Tailwind spacing throughout. Page padding `px-4` mobile, `px-6` tablet, `px-8`–`px-12` desktop.
Maximum content width ≈ 1440 px. Section spacing `py-12`–`py-20`. Card gaps `gap-3`–`gap-6`.
Subtle borders instead of heavy shadows.

## 21. Animations

Minimal and premium: `transition`, `duration-200`/`duration-300`, `ease-out`, subtle image scale,
button colour transitions, menu slide/fade. Framer Motion only if an interaction genuinely
benefits from it — this build uses CSS transitions only.

## 22. Functional Requirements

| ID | Requirement |
| --- | --- |
| FR-01 | Navigation: open, navigate to sections, open and close the mobile menu |
| FR-02 | Search filters by product name and category (e.g. `dress` → dress products) |
| FR-03 | Wishlist: toggle a heart, persisted in state / localStorage |
| FR-04 | Cart: add, remove, increase, decrease quantity, view subtotal; no real payment |
| FR-05 | Category filter: All, Tops, Bottoms, Dresses, Shoes, Accessories, Men, Sale |

## 23. React Architecture

```
src/
├── components/   # AnnouncementBar, Header, MobileMenu, Hero, BenefitsBar,
│                 # CategoryCard, CategorySection, ProductCard, ProductGrid,
│                 # ProductFilter, PromoCard, PromoSection, CollectionCard,
│                 # CollectionSection, ChatWidget, Footer, CartDrawer
├── data/         # products, categories, collections
├── context/      # CartContext, WishlistContext
├── pages/        # Home
├── App.jsx
├── main.jsx
└── index.css
```

*This build adds `ShopContext` (shared search + filter state), `SearchOverlay`, `BackToTop`,
`EditorialBand`, `Wordmark`, `ProductSection`, and `hooks/`, `lib/`.*

## 24. Node.js Requirements

Node.js drives the Vite dev server, dependency management, production builds and an optional API
layer. Version 1 needs no database and the frontend works with no backend. A later backend may
add `GET /api/products`, `GET /api/products/:id` and `GET /api/categories` with Node + Express.

## 25. Tailwind CSS Requirements

Tailwind drives layout, breakpoints, typography, spacing, colour, borders, buttons, cards, hover
states and responsive navigation. Large custom CSS files are avoided in favour of reusable
component classes.

## 26. Image Requirements

Original or properly licensed imagery only, optimised before deployment, organised under
`public/images/{hero,products,categories,collections,banners}/`, rendered with `object-cover` and
carefully chosen focal points.

*This build generates all artwork as original SVG via `scripts/generate-assets.mjs` — resolution
independent, ~130 kB in total, and legally clean.*

## 27. Docker

`Dockerfile`, `.dockerignore` and `docker-compose.yml` implement
`npm install → npm run build → serve the production build`. Docker is for local testing only and
must not complicate the Vercel deployment.

## 28. Git Bash Workflow

```bash
git init
git add .
git commit -m "Initial ROOTS.CO portfolio"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY
git push -u origin main
```

Recommended commit messages: `feat:`, `style:`, `fix:`, `chore:`, `docs:`.

## 29. Vercel Deployment

```
React Project → Git Bash → GitHub Repository → Vercel → Production URL
```

Build command must work, no missing assets, no localhost dependency, environment variables
documented if any, responsive layout tested. Typical Vite settings: preset **Vite**, build
`npm run build`, output `dist`, install `npm install`.

## 30. Performance

Fast first load, optimised images, lazy-loaded below-the-fold images, minimal dependencies, no
unnecessary API calls, responsive image sizes, lightweight animations.

## 31. Accessibility

Semantic HTML, alt text, accessible buttons, keyboard navigation, visible focus states, correct
heading hierarchy, `aria-label` on icon-only buttons, an accessible mobile menu and sufficient
contrast.

```html
<button aria-label="Open shopping cart">
  <img alt="Woman wearing a neutral knit top" />
```

## 32. SEO Basics

Page title `ROOTS.CO — Modern Fashion & Everyday Essentials`, meta description, Open Graph
metadata, descriptive image alt text and semantic headings.

## 33. Suggested Folder Structure

```
root-co/
├── public/images/
├── src/{assets,components,context,data,pages}/
├── src/{App.jsx,main.jsx,index.css}
├── .dockerignore
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── prd.md
```

## 34. Development Phases

1. **Setup** — React + Vite, Tailwind, Lucide, Git, folders, original assets.
2. **Core layout** — announcement bar, header, hero, benefits, categories, product grid.
3. **Marketing sections** — promo cards, collections, brand values, footer.
4. **Interactions** — search, filters, wishlist, cart, mobile nav, chat widget.
5. **Polish** — responsive testing, type refinement, image optimisation, hover states,
   accessibility, loading and empty states.
6. **Deployment** — build, Docker test, commit, GitHub push, Vercel, final responsive test.

## 35. Acceptance Criteria

- [x] UI follows the reference structure
- [x] Minimalist fashion header
- [x] Hero section
- [x] Service benefits bar
- [x] Circular category section
- [x] New Arrivals product grid
- [x] Reusable product card component
- [x] Wishlist interaction
- [x] Cart interaction
- [x] Product/category search and filtering
- [x] Three-card promotional section
- [x] Explore Collections section
- [x] Floating support widget
- [x] Brand values section
- [x] Footer
- [x] Mobile navigation
- [x] Desktop / tablet / mobile layouts
- [x] Tailwind CSS for primary styling
- [x] Node.js / Vite build
- [x] Docker configuration
- [x] Git repository configured
- [ ] GitHub push (requires repository credentials)
- [ ] Vercel deployment (requires a Vercel account and the GitHub repository)
- [x] No copyrighted reference assets copied

## 36. Portfolio Presentation

**ROOTS.CO — Modern Fashion E-Commerce UI.** A responsive fashion e-commerce interface built with
React and Tailwind CSS, featuring reusable product components, category filtering, wishlist and
cart interactions, responsive navigation and a premium editorial shopping experience.

**Technologies** — React, Node.js, Tailwind CSS, Docker, Git, GitHub, Vercel.

**Skills demonstrated** — React component architecture, responsive UI development, Tailwind CSS,
state management, e-commerce UI patterns, product filtering, shopping cart functionality,
accessibility, Docker containerisation, Git/GitHub workflow, Vercel deployment.

## 37. Final Visual Target

The site should communicate **minimal · modern · fashion · premium · clean · responsive** and
match the composition:

```
BLACK ANNOUNCEMENT BAR
        ↓
ROOTS.CO NAVIGATION
        ↓
LARGE FASHION HERO
        ↓
4 BENEFIT ITEMS
        ↓
CIRCULAR CATEGORY NAVIGATION
        ↓
NEW ARRIVAL PRODUCT GRID
        ↓
3 PROMOTIONAL CARDS
        ↓
COLLECTION IMAGE GRID
        ↓
FLOATING SUPPORT WIDGET
        ↓
DARK BRAND VALUES FOOTER
        ↓
SITE FOOTER
```

Visual accuracy, clean component structure, responsive behaviour and professional portfolio
quality are the priorities.
