import { NavLink } from 'react-router-dom';
import {
  Boxes,
  Contact,
  FolderTree,
  Gem,
  Layers,
  LayoutDashboard,
  Package,
  Settings,
  X,
} from 'lucide-react';
import { cn } from '../../lib/cn.js';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: FolderTree },
  { to: '/collections', label: 'Collections', icon: Layers },
  { to: '/contact', label: 'Contact', icon: Contact },
  // Homepage and Pages (block CMS) are intentionally hidden for now. Their
  // routes and components remain in App.tsx so the feature can be re-enabled
  // later by restoring these two nav entries.
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function SidebarInner({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-line px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-b from-gold-400 to-gold-600 text-[#1a1206]">
          <Gem className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold tracking-wide text-gold-300">A&C India</p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-faint">Seller Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 py-5">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-6 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-gold-500/10 text-gold-300'
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
    </>
  );
}

/** Static sidebar shown from the `lg` breakpoint up. */
export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface/60 lg:flex">
      <SidebarInner />
    </aside>
  );
}

/** Slide-in drawer for small screens. */
export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div className={cn('fixed inset-0 z-40 lg:hidden', open ? '' : 'pointer-events-none')}>
      <div
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
      <aside
        className={cn(
          'absolute left-0 top-0 flex h-full w-64 flex-col border-r border-line bg-surface shadow-2xl transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-3 top-4 rounded-md p-1.5 text-muted hover:bg-white/5 hover:text-fg"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarInner onNavigate={onClose} />
      </aside>
    </div>
  );
}
