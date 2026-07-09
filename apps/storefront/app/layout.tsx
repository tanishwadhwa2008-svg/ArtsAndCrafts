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
      <body>{children}</body>
    </html>
  );
}
