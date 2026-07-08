import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn.js';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin', className)} aria-hidden />;
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <Loader2 className="h-8 w-8 animate-spin text-gold-500" aria-label="Loading" />
    </div>
  );
}
