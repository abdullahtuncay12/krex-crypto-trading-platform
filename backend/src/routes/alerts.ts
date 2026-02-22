/**
 * Alert Routes
 * 
 * Provides endpoints for alert management and preferences for premium users.
 * All endpoints require authentication and premium role.
 * 
 * Requirements: 10.1, 10.3, 10.4
 */

import { Router, Request, Response } from 'express';
import { alertRepository } from '../models/AlertRepository';
import { alertPreferencesRepository } from '../models/AlertPreferencesRepository';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateAlertPreferences } from '../middleware/validation';

const router = Router();

/**
 * GET /api/alerts
 * Get all alerts for the authenticated premium user
 * 
 * Headers:
 * - Authorization: Bearer <token> (required)
 * 
 * Response:
 * - alerts: Array of Alert objects
 * 
 * Requirements 10.1, 10.4: Alert generation and content completeness
 */
router.get('/', requireAuth, requireRole('premium'), async (req: Request, res: Response) => {
  try {
    // User is attached to request by requireAuth middleware
    const userId = req.user!.id;

    const alerts = await alertRepository.findByUserId(userId);

    res.status(200).json({
      alerts,
    });
  } catch (error) {
    console.error('Failed to retrieve alerts:', error);
    res.status(500).json({
      error: {
        code: 'ALERTS_RETRIEVAL_FAILED',
        message: 'Failed to retrieve alerts',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * POST /api/alerts/preferences
 * Save or update alert preferences for the authenticated premium user
 * 
 * Headers:
 * - Authorization: Bearer <token> (required)
 * 
 * Request body:
 * - priceMovementThreshold: number (required, percentage threshold for price alerts)
 * - enablePumpAlerts: boolean (required, whether to enable pump detection alerts)
 * - cryptocurrencies: string[] (required, array of cryptocurrency symbols to monitor)
 * 
 * Response:
 * - preferences: AlertPreferences object
 * 
 * Requirement 10.3: Alert preferences persistence
 */
router.post('/preferences', requireAuth, requireRole('premium'), validateAlertPreferences, async (req: Request, res: Response) => {
  try {
    const { priceMovementThreshold, enablePumpAlerts, cryptocurrencies } = req.body;

    // User is attached to request by requireAuth middleware
    const userId = req.user!.id;

    // Upsert preferences (create or update)
    const preferences = await alertPreferencesRepository.upsert({
      userId,
      priceMovementThreshold,
      enablePumpAlerts,
      cryptocurrencies,
    });

    res.status(200).json({
      preferences,
    });
  } catch (error) {
    console.error('Failed to save alert preferences:', error);
    res.status(500).json({
      error: {
        code: 'PREFERENCES_SAVE_FAILED',
        message: 'Failed to save alert preferences',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * GET /api/alerts/preferences
 * Get alert preferences for the authenticated premium user
 * 
 * Headers:
 * - Authorization: Bearer <token> (required)
 * 
 * Response:
 * - preferences: AlertPreferences object or null if not set
 * 
 * Requirement 10.3: Alert preferences persistence
 */
router.get('/preferences', requireAuth, requireRole('premium'), async (req: Request, res: Response) => {
  try {
    // User is attached to request by requireAuth middleware
    const userId = req.user!.id;

    const preferences = await alertPreferencesRepository.findByUserId(userId);

    res.status(200).json({
      preferences,
    });
  } catch (error) {
    console.error('Failed to retrieve alert preferences:', error);
    res.status(500).json({
      error: {
        code: 'PREFERENCES_RETRIEVAL_FAILED',
        message: 'Failed to retrieve alert preferences',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

export default router;
