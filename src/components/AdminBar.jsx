import { ShieldCheck, Boxes, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useInventory } from '../context/InventoryContext.jsx'

/**
 * Top-level Admin Bar displayed across the top of the site ONLY when logged in as Admin.
 * Completely hidden from normal customers and visitors.
 */
export default function AdminBar() {
  const { user, isAdmin, signInAsDemo } = useAuth()
  const { openInventory, stats } = useInventory()

  if (!isAdmin) return null

  const alerts = stats.lowStockCount + stats.outOfStockCount

  return (
    <aside aria-label="Administrator Console" className="relative z-50 border-b border-white/10 bg-neutral-950 px-4 py-2 text-white">
      <div className="shell flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <ShieldCheck size={13} strokeWidth={2.5} />
          </span>
          <span className="font-semibold uppercase tracking-label text-[11px] text-white">
            Admin Mode
          </span>
          <span className="hidden text-[11px] text-neutral-400 md:inline">
            &bull; Signed in as <strong className="text-white">{user?.email}</strong>
          </span>
          {alerts > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-label text-white">
              {alerts} stock alerts
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openInventory}
            className="flex items-center gap-1.5 rounded-md bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-label text-ink transition-colors duration-200 hover:bg-neutral-200"
          >
            <Boxes size={13} strokeWidth={2} />
            <span>Open Inventory ({stats.totalSkus} SKUs)</span>
          </button>
          <button
            type="button"
            onClick={() => signInAsDemo('customer')}
            className="flex items-center gap-1 rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-label text-neutral-300 transition-colors duration-200 hover:bg-white/20 hover:text-white"
            title="Switch to customer mode to see what shoppers see"
          >
            <EyeOff size={12} strokeWidth={2} />
            <span className="hidden sm:inline">View as</span> Customer
          </button>
        </div>
      </div>
    </aside>
  )
}
