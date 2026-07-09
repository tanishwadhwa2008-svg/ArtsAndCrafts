/**
 * Design tokens as typed constants.
 *
 * These mirror the CSS custom properties declared in `theme.css` (the Tailwind
 * `@theme`). Use these when you need a token value in TypeScript — e.g. inline
 * styles, chart libraries, or canvas rendering — so colours/fonts stay in sync
 * with the single source of truth rather than being hard-coded.
 *
 * Spacing, radii and breakpoints intentionally follow Tailwind's default 4/8px
 * scale and are not re-declared here.
 */

export const colors = {
  bg: '#0a0a0b',
  surface: '#16120b',
  surface2: '#1e180f',
  elevated: '#271f13',
  gold: {
    300: '#f6de8b',
    400: '#f2ce5b',
    500: '#e3b23c',
    600: '#c8901f',
    700: '#9c6f16',
  },
  fg: '#edeae3',
  muted: '#a9a29a',
  faint: '#6e675e',
  line: 'rgba(227, 178, 60, 0.16)',
  lineStrong: 'rgba(227, 178, 60, 0.32)',
  danger: '#e5484d',
  success: '#43b581',
} as const;

export const fonts = {
  display: "'Cinzel', ui-serif, serif",
  serif: "'Cormorant Garamond', ui-serif, serif",
  sans: "'Manrope', ui-sans-serif, system-ui, sans-serif",
} as const;

/** All design tokens grouped for convenient consumption. */
export const tokens = { colors, fonts } as const;

export type Colors = typeof colors;
export type Fonts = typeof fonts;
export type Tokens = typeof tokens;
