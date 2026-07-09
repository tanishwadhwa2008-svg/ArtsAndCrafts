export type NavLink = { href: string; label: string };

/** Primary navigation shown in the desktop header. */
export const primaryNav: NavLink[] = [
  { href: '/collections', label: 'Collections' },
  { href: '/makers', label: 'Makers' },
  { href: '/story', label: 'Story' },
];

/** Navigation shown inside the mobile drawer (adds utility links). */
export const mobileNav: NavLink[] = [
  ...primaryNav,
  { href: '/search', label: 'Search' },
  { href: '/contact', label: 'Contact' },
];

/** Grouped link sections rendered in the footer. */
export const footerSections: { title: string; links: NavLink[] }[] = [
  { title: 'Explore', links: primaryNav },
  {
    title: 'Company',
    links: [
      { href: '/search', label: 'Search' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
];
