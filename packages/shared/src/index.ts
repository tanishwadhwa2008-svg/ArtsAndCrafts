/**
 * Shared package entrypoint.
 *
 * Cross-cutting types, constants, and Zod schemas that must stay in sync
 * between the API and the web apps live here. Feature schemas (products,
 * categories, auth, etc.) will be added in later phases.
 */

export * from './roles.js';
export * from './http.js';
