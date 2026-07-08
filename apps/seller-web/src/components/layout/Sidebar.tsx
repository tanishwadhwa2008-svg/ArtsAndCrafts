import { NavLink } from 'react-router-dom';
import { Boxes, FolderTree, Gem, LayoutDashboard, Package, Settings } from 'lucide-react';
import { cn } from '../../lib/cn.js';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: FolderTree },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface/60 lg:flex">
      <div className="flex h-16 items-center gap-3 border-b border-line px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-b from-gold-400 to-gold-600 text-[#1a1206]">
          <Gem className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold tracking-wide text-gold-300">Artisan</p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-faint">Seller Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-gold-500/10 text-gold-300 shadow-[inset_2px_0_0_0_var(--color-gold-500)]'
                  : 'text-muted hover:bg-white/5 hover:text-fg',
              )
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line px-6 py-4">
        <p className="font-serif text-xs italic text-faint">Timeless craftsmanship, curated.</p>
      </div>
    </aside>
  );
}
