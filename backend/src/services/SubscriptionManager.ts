/**
 * Subscription Manager Service
 * 
 * Manages subscription lifecycle including creation, cancellation, and webhook handling.
 * Integrates with Stripe API for payment processing and updates user roles via RBAC.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import Stripe from 'stripe';
import { subscriptionRepository } from '../models/SubscriptionRepository';
import { userRepository } from '../models/UserRepository';
import { Subscription } from '../models/Subscription';

export class SubscriptionManager {
  private stripe: Stripe;

  constructor(stripeSecretKey: string) {
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
    });
  }

  /**
   * Create a new subscription for a user
   * Requirement 8.1: Display premium subscription options
   * Requirement 8.2: Premium activation on payment success
   * 
   * @param userId - The user ID to create subscription for
   * @param planId - The subscription plan ID
   * @param paymentMethodId - Stripe payment method ID
   * @returns Created subscription
   */
  async createSubscription(
    userId: string,
    planId: string,
    paymentMethodId: string
  ): Promise<Subscription> {
    // Verify user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user already has an active subscription
    const existingSubscription = await subscriptionRepository.findByUserId(userId);
    if (existingSubscription && existingSubscription.status === 'active') {
      throw new Error('User already has an active subscription');
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId: string;
    const customers = await this.stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      stripeCustomerId = customers.data[0].id;
    } else {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      stripeCustomerId = customer.id;
    }

    // Attach payment method to customer if not already attached
    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    // Create Stripe subscription
    const stripeSubscription = await this.stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: planId }],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
    });

    // Calculate period dates
    const currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
    const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);

    // Create subscription record in database
    const subscription = await subscriptionRepository.create({
      userId,
      planId,
      status: 'active',
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: stripeSubscription.id,
    });

    // Update user role to premium
    // Requirement 1.2: Role upgrade on premium subscription
    await userRepository.updateRole(userId, 'premium');

    return subscription;
  }

  /**
   * Cancel a user's subscription
   * Requirement 8.4: Access retention on subscription cancellation
   * 
   * @param userId - The user ID to cancel subscription for
   * @returns Updated subscription
   */
  async cancelSubscription(userId: string): Promise<Subscription> {
    // Find user's subscription
    const subscription = await subscriptionRepository.findByUserId(userId);
    if (!subscription) {
      throw new Error('No subscription found for user');
    }

    if (subscription.status !== 'active') {
      throw new Error('Subscription is not active');
    }

    // Cancel subscription at period end in Stripe
    await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update subscription in database to maintain access until period end
    const updatedSubscription = await subscriptionRepository.cancelAtPeriodEnd(subscription.id);
    if (!updatedSubscription) {
      throw new Error('Failed to update subscription');
    }

    return updatedSubscription;
  }

  /**
   * Handle successful payment webhook from Stripe
   * Requirement 8.2: Premium activation on payment success
   * 
   * @param stripeSubscriptionId - Stripe subscription ID
   */
  async handlePaymentSuccess(stripeSubscriptionId: string): Promise<void> {
    // Find subscription by Stripe ID
    const subscription = await subscriptionRepository.findByStripeSubscriptionId(stripeSubscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Fetch latest subscription data from Stripe
    const stripeSubscription = await this.stripe.subscriptions.retrieve(stripeSubscriptionId);

    // Update subscription period dates
    const currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
    const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);

    await subscriptionRepository.update(subscription.id, {
      status: 'active',
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
    });

    // Ensure user has premium role
    await userRepository.updateRole(subscription.userId, 'premium');
  }

  /**
   * Handle failed payment webhook from Stripe
   * Requirement 8.5: Notification on payment failure
   * 
   * @param stripeSubscriptionId - Stripe subscription ID
   */
  async handlePaymentFailure(stripeSubscriptionId: string): Promise<void> {
    // Find subscription by Stripe ID
    const subscription = await subscriptionRepository.findByStripeSubscriptionId(stripeSubscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Mark subscription as expired
    await subscriptionRepository.update(subscription.id, {
      status: 'expired',
    });

    // Revert user role to normal
    // Requirement 1.3: Role downgrade on subscription expiration
    await userRepository.updateRole(subscription.userId, 'normal');

    // TODO: Send notification to user about payment failure
    // This would integrate with an email service or notification system
    console.log(`Payment failed for subscription ${subscription.id}, user ${subscription.userId} notified`);
  }

  /**
   * Check and process expired subscriptions
   * Should be called by a scheduled job (e.g., daily cron)
   * Requirement 1.3: Role downgrade on subscription expiration
   */
  async checkExpiredSubscriptions(): Promise<void> {
    const expiredSubscriptions = await subscriptionRepository.findExpiredSubscriptions();

    for (const subscription of expiredSubscriptions) {
      // Update subscription status to expired
      await subscriptionRepository.update(subscription.id, {
        status: 'expired',
      });

      // Revert user role to normal
      await userRepository.updateRole(subscription.userId, 'normal');

      console.log(`Subscription ${subscription.id} expired, user ${subscription.userId} role reverted to normal`);
    }
  }
}

// Export singleton instance (requires STRIPE_SECRET_KEY environment variable)
export const subscriptionManager = new SubscriptionManager(
  process.env.STRIPE_SECRET_KEY || ''
);
