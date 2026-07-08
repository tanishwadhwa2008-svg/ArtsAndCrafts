import { useState } from 'react';
import { LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider.js';
import { Button } from '../ui/button.js';

export function Topbar() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-surface/40 px-6 backdrop-blur">
      <p className="font-serif text-sm italic text-muted">
        Welcome back,{' '}
        <span className="text-gold-300">{user?.displayName ?? user?.email ?? 'artisan'}</span>
      </p>

      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-muted sm:flex">
          <UserRound className="h-3.5 w-3.5 text-gold-500" />
          {user?.role}
        </span>
        <Button variant="ghost" size="sm" onClick={handleLogout} disabled={loggingOut}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </header>
  );
}
