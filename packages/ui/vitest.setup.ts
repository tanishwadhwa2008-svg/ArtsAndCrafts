import { afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';

// Register the axe matcher and tidy the DOM between tests.
expect.extend(toHaveNoViolations);
afterEach(() => cleanup());
