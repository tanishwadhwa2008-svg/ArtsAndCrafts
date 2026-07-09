export type NavLink = { href: string; label: string };

/** Primary navigation shown in the desktop header. */
export const primaryNav: NavLink[] = [
  { href: '/collections', label: 'Collections' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

/** Navigation shown inside the mobile drawer (adds utility links). */
export const mobileNav: NavLink[] = [...primaryNav, { href: '/search', label: 'Search' }];

/** Grouped link sections rendered in the footer. */
export const footerSections: { title: string; links: NavLink[] }[] = [
  {
    title: 'Explore',
    links: [
      { href: '/collections', label: 'Collections' },
      { href: '/about', label: 'About' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '/contact', label: 'Contact' },
      { href: '/search', label: 'Search' },
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
