'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from './dialog.js';
import { Button } from './button.js';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

interface PendingState extends ConfirmOptions {
  open: boolean;
}

const CLOSED: PendingState = { open: false, message: '' };

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PendingState>(CLOSED);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setState({ ...options, open: true });
    });
  }, []);

  const settle = useCallback((result: boolean) => {
    resolver.current?.(result);
    resolver.current = null;
    setState(CLOSED);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog open={state.open} onOpenChange={(open) => (open ? undefined : settle(false))}>
        <DialogContent className="max-w-md">
          <DialogHeader title={state.title ?? 'Are you sure?'} description={state.message} />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => settle(false)}>
              {state.cancelLabel ?? 'Cancel'}
            </Button>
            <Button
              type="button"
              variant={state.destructive ? 'danger' : 'primary'}
              onClick={() => settle(true)}
            >
              {state.confirmLabel ?? 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return ctx;
}
