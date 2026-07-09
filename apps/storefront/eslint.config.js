import react from '@arts/config/eslint/react';

export default [
  { ignores: ['.next/**', 'out/**', 'next-env.d.ts'] },
  ...react,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Next.js routes/layouts legitimately export `metadata`,
      // `generateMetadata`, route segment config, etc. alongside the default
      // component export. The Vite-oriented react-refresh rule doesn't apply.
      'react-refresh/only-export-components': 'off',
    },
  },
];
