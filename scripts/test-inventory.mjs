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
const Header = headerMod.default
const InventoryModal = inventoryModalMod.default

let failed = 0
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`)
  if (!ok) failed += 1
}

console.log('Inventory Catalogue Verification:')
const initial = createInitialInventory()
check('seeded 18 products into inventory', initial.length === 18)
check('SKU format correctly formatted', initial[0].sku.startsWith('RC-'))
check('tracks cost and stock', typeof initial[0].cost === 'number' && typeof initial[0].stock === 'number')

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
  'Does not render inventory controls/table to unauthorized user',
  !lockedModalMarkup.includes('Total Valuation')
)

await server.close()
console.log(failed ? `\nFAIL: ${failed} assertion(s)` : '\nPASS: all inventory assertions passed')
process.exit(failed ? 1 : 0)
