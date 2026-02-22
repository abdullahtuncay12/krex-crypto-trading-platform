import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { subscriptionAPI } from '../api/client';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const PREMIUM_PLAN: SubscriptionPlan = {
  id: 'premium',
  name: 'Premium',
  price: 29.99,
  features: [
    'Advanced trading signals with AI analysis',
    'Real-time data updates',
    'Stop-loss recommendations',
    'Limit order suggestions',
    'Price movement alerts',
    'Pump detection notifications',
    'Extended historical analysis',
    'Priority support',
  ],
};

const PaymentForm: React.FC<{
  plan: SubscriptionPlan;
  onSuccess: () => void;
  onError: (error: string) => void;
}> = ({ plan, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (!paymentMethod) {
        throw new Error('Failed to create payment method');
      }

      // Submit subscription upgrade
      await subscriptionAPI.upgrade({
        planId: plan.id,
        paymentMethodId: paymentMethod.id,
      });

      onSuccess();
    } catch (err: any) {
      onError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
          !stripe || processing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {processing ? 'Processing...' : `Subscribe for $${plan.price}/month`}
      </button>
    </form>
  );
};

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  const [showPayment, setShowPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleSuccess = () => {
    setSuccess(true);
    setError(null);
    setTimeout(() => {
      onUpgrade();
      onClose();
      // Reset state
      setShowPayment(false);
      setSuccess(false);
    }, 2000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleClose = () => {
    setShowPayment(false);
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Upgrade to Premium</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600">Your premium membership is now active.</p>
            </div>
          ) : (
            <>
              {/* Plan Details */}
              <div className="mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6 mb-6">
                  <h3 className="text-3xl font-bold mb-2">{PREMIUM_PLAN.name}</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">${PREMIUM_PLAN.price}</span>
                    <span className="text-xl ml-2">/month</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 mb-3">Premium Features:</h4>
                  {PREMIUM_PLAN.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Payment Form or CTA */}
              {showPayment ? (
                <>
                  {!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start">
                          <svg
                            className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          <div>
                            <p className="text-yellow-800 font-semibold">Demo Mode</p>
                            <p className="text-yellow-700 text-sm mb-2">Stripe is not configured. This is a demo upgrade - no real payment will be processed.</p>
                            <p className="text-yellow-700 text-sm">To enable real payments, set VITE_STRIPE_PUBLISHABLE_KEY in .env file.</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleSuccess}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        Demo Upgrade (Free)
                      </button>
                    </div>
                  ) : (
                    <Elements stripe={stripePromise}>
                      <PaymentForm plan={PREMIUM_PLAN} onSuccess={handleSuccess} onError={handleError} />
                    </Elements>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Continue to Payment
                  </button>
                  <p className="text-sm text-gray-500 text-center">
                    Cancel anytime. Your subscription will remain active until the end of the billing period.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
