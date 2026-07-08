import globals from 'globals';
import base from './base.js';

/** ESLint preset for Node.js/back-end packages. */
export default [
  ...base,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
