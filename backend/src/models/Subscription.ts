/**
 * Subscription Model
 * 
 * Represents a user's subscription to premium membership.
 * Manages subscription lifecycle including status, billing periods, and Stripe integration.
 * 
 * Requirements: 8.2, 8.4, 8.5
 */

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionInput {
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd?: boolean;
  stripeSubscriptionId: string;
}

export interface UpdateSubscriptionInput {
  planId?: string;
  status?: 'active' | 'cancelled' | 'expired';
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  stripeSubscriptionId?: string;
}
