import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Self-hosted brand typefaces (registered as the font-family names referenced
// by the @arts/ui theme tokens: Cinzel / Cormorant Garamond / Manrope).
import '@fontsource/cinzel/400.css';
import '@fontsource/cinzel/600.css';
import '@fontsource/cinzel/700.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';

import './globals.css';

import { AnnouncementBar } from '@/components/site/announcement-bar';
import { Footer } from '@/components/site/footer';
import { Header } from '@/components/site/header';

export const metadata: Metadata = {
  title: {
    default: 'Arts and Crafts of India — Handcrafted Heritage',
    template: '%s · Arts and Crafts of India',
  },
  description:
    'A curated collection of handcrafted art and heritage pieces, each carrying the story of its maker.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:border focus:border-gold-500 focus:bg-bg focus:px-4 focus:py-2 focus:text-xs focus:uppercase focus:tracking-[0.14em] focus:text-gold-200"
        >
          Skip to content
        </a>
        <div className="flex min-h-screen flex-col">
          <AnnouncementBar />
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
