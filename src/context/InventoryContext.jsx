import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { products } from '../data/products.js'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

const InventoryContext = createContext(null)
const STORAGE_KEY = 'rootco.inventory.v1'

/**
 * Generates initial realistic inventory records from the base products catalogue.
 */
export function createInitialInventory() {
  const initialStockLevels = {
    1: 16, // Structured Leather Tote
    2: 3,  // Brown Leather Satchel (Low stock)
    3: 11, // Checked Tailored Suit
    4: 0,  // Quilted Puffer Jacket (Out of stock demo)
    5: 4,  // Wool Coat Rail (Low stock)
    6: 22, // Tan Leather Brogues
    7: 14, // Leather & Knitwear Edit
    8: 8,  // White Court Sneakers
    9: 25, // Long Sleeve Jersey Top
    10: 19, // Straight Leg Denim
    11: 6, // Tapered Jeans
    12: 15, // Poplin Shirt Rail
    13: 2, // Linen Dress Rail (Low stock)
    14: 17, // Rose Ribbed Knit
    15: 30, // Blush Merino Scarf
    16: 12, // Plaid Oxford Shirt
    17: 9, // Weekend Capsule
    18: 0, // Rose Wool Trouser (Out of stock demo)
  }

  return products.map((product) => {
    const categoryCode = product.category.slice(0, 3).toUpperCase()
    const sku = `RC-${categoryCode}-${String(product.id).padStart(3, '0')}`
    const defaultStock = initialStockLevels[product.id] ?? 12
    const cost = Math.round(product.price * 0.45)
    const aisle = String.fromCharCode(65 + ((product.id * 3) % 6))
    const bin = (product.id % 8) + 1

    return {
      id: product.id,
      sku,
      name: product.name,
      category: product.category,
      price: product.price,
      cost,
      stock: defaultStock,
      lowStockThreshold: 5,
      image: product.image,
      sizes: product.sizes || ['ONE SIZE'],
      location: `Aisle ${aisle} / Bin ${bin}`,
      lastUpdated: new Date().toISOString(),
    }
  })
}

const DEFAULT_INVENTORY = createInitialInventory()

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useLocalStorage(STORAGE_KEY, DEFAULT_INVENTORY)
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)

  const openInventory = useCallback(() => setIsInventoryOpen(true), [])
  const closeInventory = useCallback(() => setIsInventoryOpen(false), [])

  const safeInventory = Array.isArray(inventory) ? inventory : DEFAULT_INVENTORY

  const getStock = useCallback(
    (id) => {
      const item = safeInventory.find((p) => p.id === id)
      return item ? item.stock : 0
    },
    [safeInventory],
  )

  const isOutOfStock = useCallback(
    (id) => {
      const item = safeInventory.find((p) => p.id === id)
      return item ? item.stock <= 0 : false
    },
    [safeInventory],
  )

  const isLowStock = useCallback(
    (id) => {
      const item = safeInventory.find((p) => p.id === id)
      return item ? item.stock > 0 && item.stock <= (item.lowStockThreshold || 5) : false
    },
    [safeInventory],
  )

  const updateStock = useCallback(
    (id, newStock) => {
      const validStock = Math.max(0, parseInt(newStock, 10) || 0)
      setInventory((current) => {
        const list = Array.isArray(current) ? current : DEFAULT_INVENTORY
        return list.map((item) =>
          item.id === id
            ? { ...item, stock: validStock, lastUpdated: new Date().toISOString() }
            : item,
        )
      })
    },
    [setInventory],
  )

  const adjustStock = useCallback(
    (id, delta) => {
      setInventory((current) => {
        const list = Array.isArray(current) ? current : DEFAULT_INVENTORY
        return list.map((item) => {
          if (item.id !== id) return item
          const updated = Math.max(0, item.stock + delta)
          return { ...item, stock: updated, lastUpdated: new Date().toISOString() }
        })
      })
    },
    [setInventory],
  )

  const restockAllLow = useCallback(
    (quantity = 15) => {
      setInventory((current) => {
        const list = Array.isArray(current) ? current : DEFAULT_INVENTORY
        return list.map((item) => {
          if (item.stock <= (item.lowStockThreshold || 5)) {
            return {
              ...item,
              stock: item.stock + quantity,
              lastUpdated: new Date().toISOString(),
            }
          }
          return item
        })
      })
    },
    [setInventory],
  )

  const updateItem = useCallback(
    (id, updates) => {
      setInventory((current) => {
        const list = Array.isArray(current) ? current : DEFAULT_INVENTORY
        return list.map((item) =>
          item.id === id
            ? { ...item, ...updates, lastUpdated: new Date().toISOString() }
            : item,
        )
      })
    },
    [setInventory],
  )

  const addItem = useCallback(
    (newItem) => {
      setInventory((current) => {
        const list = Array.isArray(current) ? current : DEFAULT_INVENTORY
        const nextId = list.length > 0 ? Math.max(...list.map((i) => i.id)) + 1 : 1
        const categoryCode = (newItem.category || 'GEN').slice(0, 3).toUpperCase()
        const sku = newItem.sku || `RC-${categoryCode}-${String(nextId).padStart(3, '0')}`
        const item = {
          id: nextId,
          sku,
          name: newItem.name || 'New Product',
          category: newItem.category || 'Accessories',
          price: Number(newItem.price) || 99,
          cost: Number(newItem.cost) || Math.round((Number(newItem.price) || 99) * 0.45),
          stock: Math.max(0, parseInt(newItem.stock, 10) || 10),
          lowStockThreshold: Number(newItem.lowStockThreshold) || 5,
          image: newItem.image || '/images/photos/structured-leather-tote.jpg',
          sizes: newItem.sizes?.length ? newItem.sizes : ['ONE SIZE'],
          location: newItem.location || 'Aisle A / Bin 1',
          lastUpdated: new Date().toISOString(),
        }
        return [item, ...list]
      })
    },
    [setInventory],
  )

  const deleteItem = useCallback(
    (id) => {
      setInventory((current) => {
        const list = Array.isArray(current) ? current : DEFAULT_INVENTORY
        return list.filter((item) => item.id !== id)
      })
    },
    [setInventory],
  )

  const resetInventory = useCallback(() => {
    setInventory(createInitialInventory())
  }, [setInventory])

  const decrementStock = useCallback(
    (cartItems) => {
      if (!Array.isArray(cartItems) || cartItems.length === 0) return
      setInventory((current) => {
        const list = Array.isArray(current) ? current : DEFAULT_INVENTORY
        return list.map((item) => {
          const match = cartItems.find(
            (ci) => (ci.productId || ci.product?.id) === item.id,
          )
          if (!match) return item
          const qty = match.quantity || 1
          return {
            ...item,
            stock: Math.max(0, item.stock - qty),
            lastUpdated: new Date().toISOString(),
          }
        })
      })
    },
    [setInventory],
  )

  const stats = useMemo(() => {
    let totalUnits = 0
    let totalValue = 0
    let totalCost = 0
    let lowStockCount = 0
    let outOfStockCount = 0
    let inStockCount = 0

    for (const item of safeInventory) {
      totalUnits += item.stock
      totalValue += item.stock * item.price
      totalCost += item.stock * item.cost
      if (item.stock <= 0) {
        outOfStockCount += 1
      } else if (item.stock <= (item.lowStockThreshold || 5)) {
        lowStockCount += 1
      } else {
        inStockCount += 1
      }
    }

    return {
      totalSkus: safeInventory.length,
      totalUnits,
      lowStockCount,
      outOfStockCount,
      inStockCount,
      totalValue,
      totalCost,
    }
  }, [safeInventory])

  const value = useMemo(
    () => ({
      inventory: safeInventory,
      isInventoryOpen,
      openInventory,
      closeInventory,
      getStock,
      isOutOfStock,
      isLowStock,
      updateStock,
      adjustStock,
      restockAllLow,
      updateItem,
      addItem,
      deleteItem,
      resetInventory,
      decrementStock,
      stats,
    }),
    [
      safeInventory,
      isInventoryOpen,
      openInventory,
      closeInventory,
      getStock,
      isOutOfStock,
      isLowStock,
      updateStock,
      adjustStock,
      restockAllLow,
      updateItem,
      addItem,
      deleteItem,
      resetInventory,
      decrementStock,
      stats,
    ],
  )

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

const fallbackContext = {
  inventory: DEFAULT_INVENTORY,
  isInventoryOpen: false,
  openInventory: () => {},
  closeInventory: () => {},
  getStock: () => 10,
  isOutOfStock: () => false,
  isLowStock: () => false,
  updateStock: () => {},
  adjustStock: () => {},
  restockAllLow: () => {},
  updateItem: () => {},
  addItem: () => {},
  deleteItem: () => {},
  resetInventory: () => {},
  decrementStock: () => {},
  stats: {
    totalSkus: DEFAULT_INVENTORY.length,
    totalUnits: 150,
    lowStockCount: 3,
    outOfStockCount: 2,
    inStockCount: 13,
    totalValue: 25000,
    totalCost: 11250,
  },
}

export function useInventory() {
  const context = useContext(InventoryContext)
  return context || fallbackContext
}
