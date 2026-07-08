import { Router } from 'express';
import { forgotPasswordSchema, loginSchema, registerSchema } from '@arts/shared';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../middleware/async-handler.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { verifyCsrf } from '../../middleware/verify-csrf.js';
import { authRateLimiter } from '../../middleware/auth-rate-limit.js';
import * as authController from './auth.controller.js';

/**
 * Authentication routes, mounted at `/api/v1/auth`.
 *
 * - register/login are rate-limited (brute-force defense).
 * - refresh/logout rely on the httpOnly refresh cookie and are CSRF-protected.
 * - me requires a valid access token.
 */
export const authRouter = Router();

authRouter.post(
  '/register',
  authRateLimiter,
  validate({ body: registerSchema }),
  asyncHandler(authController.registerHandler),
);

authRouter.post(
  '/login',
  authRateLimiter,
  validate({ body: loginSchema }),
  asyncHandler(authController.loginHandler),
);

authRouter.post('/refresh', verifyCsrf, asyncHandler(authController.refreshHandler));

authRouter.post('/logout', verifyCsrf, asyncHandler(authController.logoutHandler));

authRouter.get('/me', requireAuth, asyncHandler(authController.meHandler));

authRouter.post(
  '/forgot-password',
  authRateLimiter,
  validate({ body: forgotPasswordSchema }),
  asyncHandler(authController.forgotPasswordHandler),
);
