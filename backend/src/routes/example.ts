/**
 * Example Routes - Demonstrates RBAC Middleware Usage
 * 
 * This file shows how to use requireAuth and requireRole middleware
 * to protect routes with authentication and role-based authorization.
 * 
 * Requirements: 1.4, 1.5, 3.4
 */

import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

/**
 * Public route - no authentication required
 */
router.get('/public', (req: Request, res: Response) => {
  res.json({ message: 'This is a public endpoint' });
});

/**
 * Protected route - requires authentication
 * Any authenticated user (normal or premium) can access
 */
router.get('/protected', requireAuth, (req: Request, res: Response) => {
  res.json({
    message: 'This is a protected endpoint',
    user: req.user,
  });
});

/**
 * Premium-only route - requires authentication AND premium role
 * Only premium users can access
 * Returns 401 if not authenticated, 403 if not premium
 */
router.get('/premium', requireAuth, requireRole('premium'), (req: Request, res: Response) => {
  res.json({
    message: 'This is a premium-only endpoint',
    user: req.user,
  });
});

/**
 * Normal user route - requires authentication AND normal role
 * Both normal and premium users can access (premium users have all normal permissions)
 */
router.get('/normal', requireAuth, requireRole('normal'), (req: Request, res: Response) => {
  res.json({
    message: 'This endpoint is accessible to all authenticated users',
    user: req.user,
  });
});

export default router;
