'use client';

import { useState } from 'react';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X } from 'lucide-react';
import { mobileNav } from './nav';

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="inline-flex h-9 w-9 items-center justify-center text-muted transition-colors hover:text-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 lg:hidden"
        >
          <Menu className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          data-drawer-overlay
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        />
        <Dialog.Content
          data-drawer-content
          aria-describedby="mobile-nav-description"
          className="fixed inset-y-0 left-0 z-50 flex w-[84%] max-w-xs flex-col border-r border-line bg-surface p-6 shadow-2xl focus:outline-none"
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="eyebrow text-xs">Menu</Dialog.Title>
            <Dialog.Close
              aria-label="Close menu"
              className="inline-flex h-9 w-9 items-center justify-center text-muted transition-colors hover:text-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50"
            >
              <X className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <Dialog.Description id="mobile-nav-description" className="sr-only">
            Browse the Arts and Crafts of India collection.
          </Dialog.Description>

          <nav aria-label="Mobile" className="mt-8 flex flex-col">
            {mobileNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-line/70 py-4 font-display text-base uppercase tracking-[0.14em] text-fg transition-colors hover:text-gold-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
