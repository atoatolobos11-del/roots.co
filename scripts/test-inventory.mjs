/**
 * Verification test for Inventory System and Admin Access Control
 */
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

const [invMod, authMod, cartMod, wishlistMod, shopMod, headerMod, inventoryModalMod] = await Promise.all([
  server.ssrLoadModule('/src/context/InventoryContext.jsx'),
  server.ssrLoadModule('/src/context/AuthContext.jsx'),
  server.ssrLoadModule('/src/context/CartContext.jsx'),
  server.ssrLoadModule('/src/context/WishlistContext.jsx'),
  server.ssrLoadModule('/src/context/ShopContext.jsx'),
  server.ssrLoadModule('/src/components/Header.jsx'),
  server.ssrLoadModule('/src/components/InventoryModal.jsx'),
])

const { InventoryProvider, createInitialInventory } = invMod
const { AuthProvider } = authMod
const { CartProvider } = cartMod
const { WishlistProvider } = wishlistMod
const { ShopProvider } = shopMod
const { getShopProducts } = shopMod
const Header = headerMod.default
const InventoryModal = inventoryModalMod.default
const { products: catalog } = await server.ssrLoadModule('/src/data/products.js')
const { formatPrice } = await server.ssrLoadModule('/src/lib/utils.js')

let failed = 0
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`)
  if (!ok) failed += 1
}

console.log('Inventory Catalogue Verification:')
const initial = createInitialInventory()
check('seeds the current product catalogue into inventory', initial.length === catalog.length)
check(
  'inventory names, categories, and images match the shop catalogue',
  initial.every((item, index) =>
    item.id === catalog[index].id &&
    item.name === catalog[index].name &&
    item.category === catalog[index].category &&
    item.image === catalog[index].image,
  ),
)
check('SKU format correctly formatted', initial[0].sku.startsWith('RC-'))
check('tracks cost and stock', typeof initial[0].cost === 'number' && typeof initial[0].stock === 'number')
check('all catalogue products have estimated prices', catalog.every((product) => Number.isFinite(product.price) && product.price > 0))
check('formats prices with the Philippine peso sign', formatPrice(catalog[0].price).includes('₱'))

const editedItem = { ...initial[0], name: 'Updated storefront product', price: 42 }
const legacyPricelessItem = { ...initial[1], price: null }
const addedItem = {
  id: 100,
  name: 'New storefront product',
  category: 'Accessories',
  price: 28,
  stock: 5,
  image: '/images/new-product.jpg',
  sizes: ['ONE SIZE'],
}
const shopProducts = getShopProducts(catalog, [editedItem, legacyPricelessItem, addedItem])
check('reflects inventory product edits in the storefront', shopProducts[0].name === editedItem.name && shopProducts[0].price === editedItem.price)
check('uses the bundled catalogue image instead of stale inventory paths', shopProducts[0].image === catalog[0].image)
check('fills missing saved prices from the catalogue estimate', shopProducts[1].price === catalog[1].price)
check('shows newly added inventory products in the storefront', shopProducts.some((product) => product.id === addedItem.id))
check('removes products deleted from inventory', !shopProducts.some((product) => product.id === initial[2].id))
const storefrontAddedItem = shopProducts.find((product) => product.id === addedItem.id)
check('normalizes added products for product cards', storefrontAddedItem.sizes.length > 0 && storefrontAddedItem.alt === addedItem.name)

console.log('\nCustomer (Shop) View - Non-Admin User:')
const guestMarkup = renderToStaticMarkup(
  createElement(
    AuthProvider,
    null,
    createElement(
      InventoryProvider,
      null,
      createElement(
        WishlistProvider,
        null,
        createElement(
          CartProvider,
          null,
          createElement(
            ShopProvider,
            null,
            createElement(Header, null)
          )
        )
      )
    )
  )
)

check(
  'Inventory button is NOT shown in header for normal users / guests',
  !guestMarkup.includes('Open Inventory Management') && !guestMarkup.includes('Admin Only')
)

console.log('\nInventory Modal Access Guard:')
const lockedModalMarkup = renderToStaticMarkup(
  createElement(
    AuthProvider,
    null,
    createElement(
      InventoryProvider,
      null,
      createElement(InventoryModal, null)
    )
  )
)

check(
  'Guards unauthorized access when not logged in as admin',
  lockedModalMarkup.includes('Administrator Access Required')
)
check(
  'Does not offer a one-click admin sign-in inside inventory',
  !lockedModalMarkup.includes('Sign in as Admin (Demo)')
)
check(
  'Does not render inventory controls/table to unauthorized user',
  !lockedModalMarkup.includes('Total Valuation')
)

await server.close()
console.log(failed ? `\nFAIL: ${failed} assertion(s)` : '\nPASS: all inventory assertions passed')
process.exit(failed ? 1 : 0)
