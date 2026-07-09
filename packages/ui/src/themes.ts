import { colors } from './tokens.js';

/**
 * Theme palettes as typed objects — the programmatic mirror of the palette CSS
 * (`theme-admin.css`, `theme-heritage.css`). Every palette shares the same
 * shape (token names), so switching a theme changes only values, never the
 * component code that consumes them.
 */
export interface Palette {
  bg: string;
  surface: string;
  surface2: string;
  elevated: string;
  gold: {
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
  };
  fg: string;
  muted: string;
  faint: string;
  line: string;
  lineStrong: string;
  danger: string;
  success: string;
}

/** Admin palette (seller portal) — cool near-black + molten gold. */
export const adminTheme: Palette = colors;

/** Heritage palette (public storefront) — warm espresso + aged gold. */
export const heritageTheme: Palette = {
  bg: '#17110a',
  surface: '#1f1710',
  surface2: '#2a2016',
  elevated: '#34281a',
  gold: {
    300: '#ecd49a',
    400: '#dcbb6f',
    500: '#c99f4a',
    600: '#ab7f30',
    700: '#866221',
  },
  fg: '#f1eadd',
  muted: '#b6a893',
  faint: '#82735f',
  line: 'rgba(201, 159, 74, 0.18)',
  lineStrong: 'rgba(201, 159, 74, 0.35)',
  danger: '#d9534f',
  success: '#4c9a6a',
};

export const themes = { admin: adminTheme, heritage: heritageTheme } as const;

export type ThemeName = keyof typeof themes;
