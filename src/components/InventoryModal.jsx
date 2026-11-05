import { useEffect, useMemo, useRef, useState } from 'react'
import {
  X,
  Package,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  RefreshCw,
  Search,
  Layers,
  Lock,
  TrendingUp,
  Trash2,
  Edit2,
  Sparkles,
  BarChart3,
  ChevronDown,
} from 'lucide-react'
import { useOverlay } from '../hooks/useOverlay.js'
import { useInventory } from '../context/InventoryContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { formatPrice, cn } from '../lib/utils.js'

const CATEGORIES = [
  'All',
  'Accessories',
  'Tailoring',
  'Outerwear',
  'Shoes',
  'Tops',
  'Bottoms',
  'Dresses',
]

export default function InventoryModal() {
  const panelRef = useRef(null)
  const {
    inventory,
    isInventoryOpen,
    closeInventory,
    updateStock,
    adjustStock,
    restockAllLow,
    addItem,
    updateItem,
    deleteItem,
    resetInventory,
    stats,
  } = useInventory()
  const { isAdmin, signInAsDemo } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all | instock | low | out
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [actionNotice, setActionNotice] = useState(null)
  // Whether the table has scrolled far enough to auto-roll the analytics
  // section up — it rolls back down automatically back at the top.
  const [isChartsRolledUp, setIsChartsRolledUp] = useState(false)

  useOverlay(isInventoryOpen, panelRef, closeInventory)

  const showNotice = (text) => {
    setActionNotice(text)
    window.setTimeout(() => setActionNotice(null), 3000)
  }

  // Filter products by category, status, and search query
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false
      }

      // Status filter
      const threshold = item.lowStockThreshold || 5
      if (statusFilter === 'instock' && item.stock <= threshold) return false
      if (statusFilter === 'low' && (item.stock === 0 || item.stock > threshold)) return false
      if (statusFilter === 'out' && item.stock > 0) return false

      // Search query (name, sku, category)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = item.name.toLowerCase().includes(q)
        const matchSku = item.sku.toLowerCase().includes(q)
        const matchCat = item.category.toLowerCase().includes(q)
        if (!matchName && !matchSku && !matchCat) return false
      }

      return true
    })
  }, [inventory, selectedCategory, statusFilter, searchQuery])

  // Form state for adding new item
  const [newItem, setNewItem] = useState({
    name: '',
    sku: '',
    category: 'Accessories',
    price: 1200,
    cost: 540,
    stock: 15,
    lowStockThreshold: 5,
    location: 'Aisle A / Bin 1',
  })

  const handleAddNewItem = (e) => {
    e.preventDefault()
    if (!newItem.name.trim()) return

    addItem(newItem)
    showNotice(`Added "${newItem.name}" to inventory`)
    setIsAddFormOpen(false)
    setNewItem({
      name: '',
      sku: '',
      category: 'Accessories',
      price: 1200,
      cost: 540,
      stock: 15,
      lowStockThreshold: 5,
      location: 'Aisle A / Bin 1',
    })
  }

  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!editingItem) return
    updateItem(editingItem.id, editingItem)
    showNotice(`Updated ${editingItem.name}`)
    setEditingItem(null)
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[76] flex h-screen w-screen items-end justify-center sm:items-center',
        isInventoryOpen ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      aria-hidden={!isInventoryOpen}
    >
      {/* Main Panel — full-screen back-office dashboard */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inventory-title"
        className={cn(
          'on-dark relative flex h-full max-h-full w-full max-w-none flex-col overflow-hidden bg-white shadow-2xl',
          'transition-all duration-300 ease-soft',
          isInventoryOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-[0.98] opacity-0',
        )}
      >
        {/* Permission Guard */}
        {!isAdmin ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Lock size={30} strokeWidth={1.8} />
            </span>
            <h2 id="inventory-title" className="mt-5 text-xl font-semibold uppercase tracking-tight">
              Administrator Access Required
            </h2>
            <p className="mt-2.5 max-w-md text-sm leading-relaxed text-ash">
              The inventory management system is strictly confidential and reserved for store administrators. Regular customers browsing the shop cannot access stock controls.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  await signInAsDemo('admin')
                  showNotice('Authenticated as Store Administrator')
                }}
                className="btn-dark flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-label"
              >
                <ShieldCheck size={16} strokeWidth={1.8} />
                Sign in as Admin (Demo)
              </button>
              <button
                type="button"
                onClick={closeInventory}
                className="btn-outline px-5 py-2.5 text-xs font-semibold uppercase tracking-label"
              >
                Return to Shop
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="border-b border-line bg-mist/40 px-6 py-4.5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white">
                    <Package size={20} strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 id="inventory-title" className="text-base font-semibold uppercase tracking-tight sm:text-lg">
                        Inventory System
                      </h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[9px] font-bold uppercase tracking-label text-white">
                        <ShieldCheck size={11} strokeWidth={2} />
                        Admin Only
                      </span>
                    </div>
                    <p className="text-[11px] text-ash">
                      Live warehouse stock control &bull; Internal back-office view (hidden from shop customers)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      restockAllLow(15)
                      showNotice('Restocked all low/out-of-stock items (+15 units each)')
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-[11px] font-medium text-ink transition-colors duration-200 hover:bg-off"
                    title="Restock all low or zero-stock products"
                  >
                    <RefreshCw size={13} strokeWidth={1.6} />
                    <span className="hidden sm:inline">Restock Low</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddFormOpen(!isAddFormOpen)}
                    className="flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-[11px] font-medium text-white transition-colors duration-200 hover:bg-ink/80"
                  >
                    <Plus size={14} strokeWidth={2} />
                    <span>{isAddFormOpen ? 'Close Form' : 'Add Item'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={closeInventory}
                    aria-label="Close inventory dashboard"
                    className="rounded-full p-2 text-ash transition-colors duration-200 hover:bg-off hover:text-ink"
                  >
                    <X size={20} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Toast Notification */}
              {actionNotice && (
                <div className="mt-2.5 flex items-center justify-between rounded-lg bg-ink px-3.5 py-1.5 text-xs text-white animate-fade">
                  <span className="flex items-center gap-2">
                    <Sparkles size={14} className="text-accent" />
                    {actionNotice}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActionNotice(null)}
                    className="text-white/70 hover:text-white"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
            </header>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 border-b border-line bg-white px-6 py-3.5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4 gap-3 text-left">
              <KpiCard
                label="Total SKUs"
                value={stats.totalSkus}
                icon={Layers}
                detail="Active products"
              />
              <KpiCard
                label="Units in Stock"
                value={stats.totalUnits.toLocaleString()}
                icon={Package}
                detail="Total warehouse units"
              />
              <KpiCard
                label="In Stock"
                value={stats.inStockCount}
                icon={CheckCircle2}
                iconColor="text-emerald-600"
                detail="Healthy supply"
              />
              <KpiCard
                label="Low Stock"
                value={stats.lowStockCount}
                icon={AlertTriangle}
                iconColor={stats.lowStockCount > 0 ? 'text-amber-500' : 'text-ash'}
                detail="≤ 5 units remaining"
                highlight={stats.lowStockCount > 0}
                highlightColor="bg-amber-50 text-amber-900 border-amber-200"
              />
              <KpiCard
                label="Out of Stock"
                value={stats.outOfStockCount}
                icon={XCircle}
                iconColor={stats.outOfStockCount > 0 ? 'text-accent' : 'text-ash'}
                detail="Needs reorder"
                highlight={stats.outOfStockCount > 0}
                highlightColor="bg-red-50 text-red-900 border-red-200"
              />
              <KpiCard
                label="Retail Value"
                value={formatPrice(stats.totalValue)}
                icon={TrendingUp}
                iconColor="text-ink"
                detail={`Est. Cost ${formatPrice(stats.totalCost)}`}
              />
            </div>

            {/* Analytics Charts */}
            <InventoryCharts
              inventory={inventory}
              stats={stats}
              rolledUpByScroll={isChartsRolledUp}
            />

            {/* Collapsible Add Product Drawer */}
            {isAddFormOpen && (
              <div className="border-b border-line bg-mist/60 px-6 py-4 animate-rise">
                <div className="flex items-center justify-between pb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-label text-ink">
                    Add New Product to Warehouse Inventory
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddFormOpen(false)}
                    className="text-xs text-ash hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
                <form onSubmit={handleAddNewItem} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-label text-ash">
                      Product Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Silk Harrington Jacket"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      className="mt-1 w-full rounded-md border border-line bg-white px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-label text-ash">
                      Category
                    </label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      className="mt-1 w-full rounded-md border border-line bg-white px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink"
                    >
                      {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-label text-ash">
                      Retail Price ($)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newItem.price}
                      onChange={(e) => {
                        const price = Number(e.target.value)
                        setNewItem({
                          ...newItem,
                          price,
                          cost: Math.round(price * 0.45),
                        })
                      }}
                      className="mt-1 w-full rounded-md border border-line bg-white px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-label text-ash">
                      Initial Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newItem.stock}
                      onChange={(e) => setNewItem({ ...newItem, stock: Number(e.target.value) })}
                      className="mt-1 w-full rounded-md border border-line bg-white px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="btn-dark w-full py-2 text-xs font-semibold uppercase tracking-label"
                    >
                      Create Record
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Editing Modal / Drawer */}
            {editingItem && (
              <div className="border-b border-line bg-off/80 px-6 py-4 animate-rise">
                <div className="flex items-center justify-between pb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-label text-ink">
                    Edit Inventory Record: {editingItem.name} ({editingItem.sku})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="text-xs text-ash hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
                <form onSubmit={handleSaveEdit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-label text-ash">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="mt-1 w-full rounded-md border border-line bg-white px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-label text-ash">
                      Stock Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingItem.stock}
                      onChange={(e) => setEditingItem({ ...editingItem, stock: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="mt-1 w-full rounded-md border border-line bg-white px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-label text-ash">
                      Low Threshold
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editingItem.lowStockThreshold || 5}
                      onChange={(e) => setEditingItem({ ...editingItem, lowStockThreshold: Number(e.target.value) })}
                      className="mt-1 w-full rounded-md border border-line bg-white px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-label text-ash">
                      Warehouse Location
                    </label>
                    <input
                      type="text"
                      value={editingItem.location || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                      className="mt-1 w-full rounded-md border border-line bg-white px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      className="btn-dark flex-1 py-2 text-xs font-semibold uppercase tracking-label"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="btn-outline py-2 px-3 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-mist/20 px-6 py-3">
              {/* Left: Search input */}
              <div className="relative w-full max-w-xs">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ash">
                  <Search size={14} strokeWidth={1.5} />
                </span>
                <input
                  type="text"
                  placeholder="Search by name, SKU, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-line bg-white py-1.5 pl-9 pr-8 text-xs text-ink outline-none transition-colors duration-200 placeholder:text-ash/60 focus:border-ink"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ash hover:text-ink"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  ['all', `All (${inventory.length})`],
                  ['instock', `In Stock (${stats.inStockCount})`],
                  ['low', `Low Stock (${stats.lowStockCount})`],
                  ['out', `Out of Stock (${stats.outOfStockCount})`],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setStatusFilter(id)}
                    className={cn(
                      'rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-label transition-colors duration-200',
                      statusFilter === id
                        ? 'bg-ink text-white'
                        : 'border border-line bg-white text-ash hover:border-ink hover:text-ink',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Category Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-label text-ash">
                  Category:
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-lg border border-line bg-white px-2.5 py-1 text-xs text-ink outline-none focus:border-ink"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset all inventory levels to catalogue defaults?')) {
                      resetInventory()
                      showNotice('Inventory reset to initial catalogue state')
                    }
                  }}
                  className="text-[10px] text-ash hover:text-accent underline underline-offset-2 ml-1"
                  title="Reset inventory to original default state"
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            {/* Inventory Table Container */}
            <div
              className="min-h-0 flex-1 overflow-y-auto px-6 py-4"
              onScroll={(event) => {
                // Roll the analytics section up once the list is scrolled past
                // the top, and roll it back down when the user returns there.
                setIsChartsRolledUp(event.currentTarget.scrollTop > 40)
              }}
            >
              {filteredInventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-ash">
                  <Package size={36} strokeWidth={1.2} className="opacity-40" />
                  <p className="mt-3 text-sm font-medium text-ink">No inventory items match your filter</p>
                  <p className="mt-1 text-xs">Try clearing your search query or switching filters.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('all')
                      setSelectedCategory('All')
                    }}
                    className="mt-4 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-off"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-line">
                  <table className="min-w-full divide-y divide-line text-left text-xs">
                    <thead className="bg-mist/60 text-[10px] font-semibold uppercase tracking-label text-ash">
                      <tr>
                        <th className="px-4 py-3">Product / SKU</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Price / Margin</th>
                        <th className="px-4 py-3 text-center">Stock Level</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Adjust Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line bg-white">
                      {filteredInventory.map((item) => {
                        const threshold = item.lowStockThreshold || 5
                        const isOut = item.stock <= 0
                        const isLow = !isOut && item.stock <= threshold
                        const marginPercent = Math.round(((item.price - item.cost) / item.price) * 100)

                        return (
                          <tr
                            key={item.id}
                            className={cn(
                              'transition-colors duration-150 hover:bg-mist/30',
                              isOut && 'bg-red-50/20',
                              isLow && 'bg-amber-50/20',
                            )}
                          >
                            {/* Product Info */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image}
                                  alt=""
                                  className="h-10 w-10 shrink-0 rounded-lg object-cover bg-mist"
                                />
                                <div>
                                  <p className="font-semibold text-ink">{item.name}</p>
                                  <div className="flex items-center gap-2 text-[10px] text-ash">
                                    <span className="font-mono">{item.sku}</span>
                                    <span>&bull;</span>
                                    <span>{item.location || 'Warehouse Main'}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="px-4 py-3 text-ash">
                              <span className="rounded bg-off px-2 py-0.5 text-[10px] font-medium text-ink">
                                {item.category}
                              </span>
                            </td>

                            {/* Price / Margin */}
                            <td className="px-4 py-3">
                              <p className="font-medium text-ink">{formatPrice(item.price)}</p>
                              <p className="text-[10px] text-ash">
                                Cost {formatPrice(item.cost)} &bull; {marginPercent}% margin
                              </p>
                            </td>

                            {/* Stock Quantity Control */}
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => adjustStock(item.id, -1)}
                                  disabled={item.stock <= 0}
                                  aria-label={`Decrease stock for ${item.name}`}
                                  className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink transition-colors duration-200 hover:bg-off disabled:opacity-30"
                                >
                                  <Minus size={12} strokeWidth={2} />
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={item.stock}
                                  onChange={(e) => updateStock(item.id, e.target.value)}
                                  aria-label={`Stock count for ${item.name}`}
                                  className="h-7 w-14 rounded-md border border-line bg-white text-center font-mono text-xs font-semibold text-ink outline-none focus:border-ink"
                                />
                                <button
                                  type="button"
                                  onClick={() => adjustStock(item.id, 1)}
                                  aria-label={`Increase stock for ${item.name}`}
                                  className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink transition-colors duration-200 hover:bg-off"
                                >
                                  <Plus size={12} strokeWidth={2} />
                                </button>
                              </div>
                            </td>

                            {/* Status Pill */}
                            <td className="px-4 py-3">
                              {isOut ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800">
                                  <XCircle size={11} strokeWidth={2} />
                                  Out of stock
                                </span>
                              ) : isLow ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                  <AlertTriangle size={11} strokeWidth={2} />
                                  Low: {item.stock} left
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                                  <CheckCircle2 size={11} strokeWidth={2} />
                                  In stock ({item.stock})
                                </span>
                              )}
                            </td>

                            {/* Action Buttons */}
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    adjustStock(item.id, 10)
                                    showNotice(`Added +10 units to ${item.name}`)
                                  }}
                                  className="rounded border border-line px-2 py-1 text-[10px] font-medium text-ink transition-colors duration-200 hover:bg-off"
                                  title="Quick add +10 units"
                                >
                                  +10
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingItem(item)}
                                  className="rounded p-1 text-ash transition-colors duration-200 hover:bg-off hover:text-ink"
                                  aria-label={`Edit ${item.name}`}
                                  title="Edit item details"
                                >
                                  <Edit2 size={13} strokeWidth={1.6} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Delete "${item.name}" from inventory?`)) {
                                      deleteItem(item.id)
                                      showNotice(`Deleted ${item.name}`)
                                    }
                                  }}
                                  className="rounded p-1 text-ash transition-colors duration-200 hover:bg-red-50 hover:text-accent"
                                  aria-label={`Delete ${item.name}`}
                                  title="Delete item"
                                >
                                  <Trash2 size={13} strokeWidth={1.6} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-mist/30 px-6 py-3">
              <div className="text-[11px] text-ash">
                Showing {filteredInventory.length} of {inventory.length} inventory items &bull; Stock changes persist locally in real-time.
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-medium text-ink">
                  Total Valuation: {formatPrice(stats.totalValue)}
                </span>
                <button
                  type="button"
                  onClick={closeInventory}
                  className="btn-dark px-4 py-1.5 text-xs font-semibold uppercase tracking-label"
                >
                  Done
                </button>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-ink',
  detail,
  highlight = false,
  highlightColor = '',
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-line p-3 transition-colors duration-200',
        highlight ? highlightColor : 'bg-off/50',
      )}
    >
      <div className="flex items-center justify-between text-ash">
        <span className="text-[10px] font-semibold uppercase tracking-label">{label}</span>
        <Icon size={14} className={iconColor} strokeWidth={1.8} />
      </div>
      <p className="mt-1 text-lg font-bold tracking-tight text-ink">{value}</p>
      {detail && <p className="mt-0.5 text-[9px] text-ash truncate">{detail}</p>}
    </div>
  )
}

/**
 * Lean SVG analytics built from live inventory state (no chart library needed):
 * a units-per-category bar chart plus the overall stock-health donut.
 * Auto-rolls up as the inventory table is scrolled down (giving it more room)
 * and rolls back down at the top; a manual toggle always stays available.
 */
function InventoryCharts({ inventory, stats, rolledUpByScroll = false }) {
  const [manualOpen, setManualOpen] = useState(true)
  // Pins the charts open after a manual "Show" while the table is scrolled
  // down; normal auto-rolling resumes once the user returns to the top.
  const [pinnedOpen, setPinnedOpen] = useState(false)
  // Expanding beats the roll-up only via the manual pin; the plain manual
  // toggle still loses to auto-rolling so scroll keeps its rhythm.
  const isExpanded = pinnedOpen || (manualOpen && !rolledUpByScroll)

  // Returning to the top clears the pin, restoring regular auto-rolling.
  useEffect(() => {
    if (!rolledUpByScroll) setPinnedOpen(false)
  }, [rolledUpByScroll])

  // Roll up live stock figures per category — works with any category,
  // including ones added through the "Add Item" form.
  const byCategory = useMemo(() => {
    const map = new Map()
    for (const item of inventory) {
      const category = item.category || 'Other'
      const entry = map.get(category) || { category, units: 0, skus: 0 }
      entry.units += item.stock
      entry.skus += 1
      map.set(category, entry)
    }
    return [...map.values()].sort((a, b) => b.units - a.units)
  }, [inventory])

  const maxUnits = Math.max(1, ...byCategory.map((row) => row.units))
  const totalUnits = byCategory.reduce((sum, row) => sum + row.units, 0)

  // Donut segments mirror the status colours used in the table pills.
  const segments = [
    { label: 'In Stock', value: stats.inStockCount, color: '#059669' },
    { label: 'Low Stock', value: stats.lowStockCount, color: '#D97706' },
    { label: 'Out of Stock', value: stats.outOfStockCount, color: '#DC2626' },
  ]
  const skuTotal = segments.reduce((sum, segment) => sum + segment.value, 0)
  const radius = 52
  const circumference = 2 * Math.PI * radius
  let dashOffset = 0

  return (
    <section className="border-b border-line bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-label text-ink">
          <BarChart3 size={14} strokeWidth={1.8} />
          Stock Analytics
          <span className="rounded-full bg-mist px-2 py-0.5 text-[9px] font-bold text-ash">LIVE</span>
        </h3>
        <button
          type="button"
          onClick={() => {
            // Branch on actual visibility, not the flags — after an auto-roll
            // the charts are shut while manualOpen is still true, so the
            // "Show Charts" click must land in the pin branch.
            if (isExpanded) {
              setManualOpen(false)
              setPinnedOpen(false)
            } else {
              setPinnedOpen(true)
            }
          }}
          className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-label text-ash transition-colors duration-200 hover:text-ink"
          title={isExpanded ? 'Collapse charts to give the table more room' : 'Show stock analytics'}
        >
          <span>{isExpanded ? 'Hide Charts' : 'Show Charts'}</span>
          <ChevronDown
            size={13}
            strokeWidth={2}
            className={cn('transition-transform duration-300', isExpanded && 'rotate-180')}
          />
        </button>
      </div>

      {/* Rolls open/shut smoothly — driven by table scroll plus the manual pin. */}
      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-soft',
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="mt-3 grid min-h-0 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-3">
          {/* Bar chart: units in stock per category */}
          <div className="rounded-xl border border-line bg-off/40 p-4 lg:col-span-2">
            <div className="flex items-baseline justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-label text-ash">
                Units in Stock by Category
              </p>
              <p className="font-mono text-[10px] text-ash">
                {totalUnits.toLocaleString()} units &bull; {byCategory.length} categories
              </p>
            </div>
            <div className="mt-3 space-y-2">
              {byCategory.map((row) => {
                const pct = Math.round((row.units / maxUnits) * 100)
                return (
                  <div
                    key={row.category}
                    className="group flex items-center gap-3"
                    title={`${row.units} units across ${row.skus} SKU${row.skus === 1 ? '' : 's'} (${Math.round((row.units / (totalUnits || 1)) * 100)}% of all stock)`}
                  >
                    <span className="w-24 shrink-0 truncate text-[10px] font-semibold uppercase tracking-wideish text-ink sm:w-32">
                      {row.category}
                    </span>
                    <div className="h-5 flex-1 overflow-hidden rounded bg-mist/70">
                      <div
                        className="h-full rounded bg-ink/80 transition-[width] duration-500 ease-soft group-hover:bg-accent"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right font-mono text-xs font-semibold text-ink">
                      {row.units.toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Donut chart: SKU stock health split */}
          <div className="rounded-xl border border-line bg-off/40 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-label text-ash">Stock Health</p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <svg viewBox="0 0 140 140" className="h-32 w-32 shrink-0" role="img" aria-label="Stock health breakdown">
                <circle cx="70" cy="70" r={radius} fill="none" stroke="#EDE7DC" strokeWidth="18" />
                {skuTotal > 0 &&
                  segments
                    .filter((segment) => segment.value > 0)
                    .map((segment) => {
                      const length = (segment.value / skuTotal) * circumference
                      const offset = dashOffset
                      dashOffset += length
                      return (
                        <circle
                          key={segment.label}
                          cx="70"
                          cy="70"
                          r={radius}
                          fill="none"
                          stroke={segment.color}
                          strokeWidth="18"
                          strokeDasharray={`${length} ${circumference - length}`}
                          strokeDashoffset={-offset}
                          transform="rotate(-90 70 70)"
                        >
                          <title>{`${segment.label}: ${segment.value} of ${skuTotal} SKUs`}</title>
                        </circle>
                      )
                    })}
                <text x="70" y="67" textAnchor="middle" className="fill-ink" fontSize="20" fontWeight="700">
                  {skuTotal}
                </text>
                <text x="70" y="83" textAnchor="middle" className="fill-ash" fontSize="9" letterSpacing="1.5">
                  SKUS
                </text>
              </svg>
              <ul className="min-w-[120px] flex-1 space-y-1.5">
                {segments.map((segment) => (
                  <li key={segment.label} className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="flex items-center gap-2 text-ash">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: segment.color }}
                      />
                      {segment.label}
                    </span>
                    <span className="font-mono font-semibold text-ink">
                      {segment.value}
                      {skuTotal > 0 && (
                        <span className="font-normal text-ash"> &middot; {Math.round((segment.value / skuTotal) * 100)}%</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
