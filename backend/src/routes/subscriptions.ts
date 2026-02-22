/**
 * Subscription Routes
 * 
 * Provides endpoints for subscription management including upgrade, cancellation,
 * status retrieval, and Stripe webhook handling.
 * 
 * Requirements: 8.1, 8.2, 8.4
 */

import { Router, Request, Response } from 'express';
import { subscriptionManager } from '../services/SubscriptionManager';
import { requireAuth } from '../middleware/auth';
import { validateSubscriptionUpgrade } from '../middleware/validation';
import Stripe from 'stripe';

const router = Router();

/**
 * POST /api/subscriptions/upgrade
 * Upgrade user to premium subscription
 * 
 * Headers:
 * - Authorization: Bearer <token> (required)
 * 
 * Request body:
 * - planId: string (required, Stripe price ID)
 * - paymentMethodId: string (required, Stripe payment method ID)
 * 
 * Response:
 * - subscription: Subscription object
 * 
 * Requirements 8.1, 8.2: Display premium subscription options and activate immediately
 */
router.post('/upgrade', requireAuth, validateSubscriptionUpgrade, async (req: Request, res: Response) => {
  try {
    const { planId, paymentMethodId } = req.body;

    // User is attached to request by requireAuth middleware
    const userId = req.user!.id;

    const subscription = await subscriptionManager.createSubscription(
      userId,
      planId,
      paymentMethodId
    );

    res.status(201).json({
      subscription,
    });
  } catch (error) {
    if (error instanceof Error) {
      // Handle user already has active subscription
      if (error.message === 'User already has an active subscription') {
        res.status(409).json({
          error: {
            code: 'SUBSCRIPTION_ALREADY_ACTIVE',
            message: 'You already have an active subscription',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // Handle user not found
      if (error.message === 'User not found') {
        res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // Handle Stripe errors
      if (error instanceof Stripe.errors.StripeError) {
        res.status(402).json({
          error: {
            code: 'PAYMENT_FAILED',
            message: error.message,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // Handle other errors
      res.status(500).json({
        error: {
          code: 'SUBSCRIPTION_CREATION_FAILED',
          message: 'Failed to create subscription',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * POST /api/subscriptions/cancel
 * Cancel user's subscription (maintains access until period end)
 * 
 * Headers:
 * - Authorization: Bearer <token> (required)
 * 
 * Response:
 * - subscription: Updated subscription object
 * 
 * Requirement 8.4: Access retention on subscription cancellation
 */
router.post('/cancel', requireAuth, async (req: Request, res: Response) => {
  try {
    // User is attached to request by requireAuth middleware
    const userId = req.user!.id;

    const subscription = await subscriptionManager.cancelSubscription(userId);

    res.status(200).json({
      subscription,
    });
  } catch (error) {
    if (error instanceof Error) {
      // Handle no subscription found
      if (error.message === 'No subscription found for user') {
        res.status(404).json({
          error: {
            code: 'SUBSCRIPTION_NOT_FOUND',
            message: 'No subscription found for user',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // Handle subscription not active
      if (error.message === 'Subscription is not active') {
        res.status(400).json({
          error: {
            code: 'SUBSCRIPTION_NOT_ACTIVE',
            message: 'Subscription is not active',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // Handle other errors
      res.status(500).json({
        error: {
          code: 'SUBSCRIPTION_CANCELLATION_FAILED',
          message: 'Failed to cancel subscription',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * GET /api/subscriptions/status
 * Get current user's subscription status
 * 
 * Headers:
 * - Authorization: Bearer <token> (required)
 * 
 * Response:
 * - subscription: Subscription object (if exists)
 * - status: 'active' | 'cancelled' | 'expired' | 'none'
 */
router.get('/status', requireAuth, async (req: Request, res: Response) => {
  try {
    // User is attached to request by requireAuth middleware
    const userId = req.user!.id;

    const { subscriptionRepository } = await import('../models/SubscriptionRepository');
    const subscription = await subscriptionRepository.findByUserId(userId);

    if (!subscription) {
      res.status(200).json({
        subscription: null,
        status: 'none',
      });
      return;
    }

    res.status(200).json({
      subscription,
      status: subscription.status,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve subscription status',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 * 
 * This endpoint is public (no authentication required) as it's called by Stripe.
 * Webhook signature verification is performed using Stripe's library.
 * 
 * Requirements 8.2, 8.5: Handle payment success and failure
 */
router.post('/webhooks/stripe', async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      res.status(400).json({
        error: {
          code: 'MISSING_SIGNATURE',
          message: 'Missing Stripe signature',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      res.status(500).json({
        error: {
          code: 'WEBHOOK_NOT_CONFIGURED',
          message: 'Webhook endpoint not properly configured',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Verify webhook signature
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-11-20.acacia',
    });

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      res.status(400).json({
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Invalid webhook signature',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Handle different event types
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await subscriptionManager.handlePaymentSuccess(
            invoice.subscription as string
          );
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await subscriptionManager.handlePaymentFailure(
            invoice.subscription as string
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        // Handle subscription deletion (e.g., when user cancels immediately)
        await subscriptionManager.handlePaymentFailure(subscription.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt of the event
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      error: {
        code: 'WEBHOOK_PROCESSING_FAILED',
        message: 'Failed to process webhook',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

export default router;
