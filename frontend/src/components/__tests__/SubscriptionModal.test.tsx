import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SubscriptionModal from '../SubscriptionModal';
import { subscriptionAPI } from '../../api/client';

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardElement: () => <div data-testid="card-element">Card Element</div>,
  useStripe: () => ({
    createPaymentMethod: jest.fn(() =>
      Promise.resolve({
        paymentMethod: { id: 'pm_test_123' },
        error: null,
      })
    ),
  }),
  useElements: () => ({
    getElement: jest.fn(() => ({})),
  }),
}));

// Mock API
jest.mock('../../api/client', () => ({
  subscriptionAPI: {
    upgrade: jest.fn(),
  },
}));

describe('SubscriptionModal', () => {
  const mockOnClose = jest.fn();
  const mockOnUpgrade = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <SubscriptionModal isOpen={false} onClose={mockOnClose} onUpgrade={mockOnUpgrade} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      render(<SubscriptionModal isOpen={true} onClose={mockOnClose} onUpgrade={mockOnUpgrade} />);
      expect(screen.getByText('Upgrade to Premium')).toBeInTheDocument();
    });
  });

  describe('Premium Plan Display', () => {
    beforeEach(() => {
      render(<SubscriptionModal isOpen={true} onClose={mockOnClose} onUpgrade={mockOnUpgrade} />);
    });

    it('should display premium plan name', () => {
      expect(screen.getByText('Premium')).toBeInTheDocument();
    });

    it('should display premium plan pricing', () => {
      expect(screen.getByText('$29.99')).toBeInTheDocument();
      expect(screen.getByText('/month')).toBeInTheDocument();
    });

    it('should display all premium features', () => {
      const expectedFeatures = [
        'Advanced trading signals with AI analysis',
        'Real-time data updates',
        'Stop-loss recommendations',
        'Limit order suggestions',
        'Price movement alerts',
        'Pump detection notifications',
        'Extended historical analysis',
        'Priority support',
      ];

      expectedFeatures.forEach((feature) => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });

    it('should display feature checkmarks', () => {
      const checkmarks = screen.getAllByRole('img', { hidden: true });
      // At least 8 checkmarks for features
      expect(checkmarks.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe('Payment Flow', () => {
    it('should show Continue to Payment button initially', () => {
      render(<SubscriptionModal isOpen={true} onClose={mockOnClose} onUpgrade={mockOnUpgrade} />);
      expect(screen.getByText('Continue to Payment')).toBeInTheDocument();
    });

    it('should show payment form when Continue to Payment is clicked', () => {
      render(<SubscriptionModal isOpen={true} onClose={mockOnClose} onUpgrade={mockOnUpgrade} />);
      
      const continueButton = screen.getByText('Continue to Payment');
      fireEvent.click(continueButton);

      expect(screen.getByTestId('card-element')).toBeInTheDocument();
      expect(screen.getByText('Subscribe for $29.99/month')).toBeInTheDocument();
    });

    it('should display cancellation policy', () => {
      render(<SubscriptionModal isOpen={true} onClose={mockOnClose} onUpgrade={mockOnUpgrade} />);
      expect(
        screen.getByText(/Cancel anytime. Your subscription will remain active until the end of the billing period./)
      ).toBeInTheDocument();
    });
  });

  describe('Payment Submission', () => {
    it('should handle successful payment', async () => {
      (subscriptionAPI.upgrade as jest.Mock).mockResolvedValue({ data: { success: true } });

      render(<SubscriptionModal isOpen={true} onClose={mockOnClose} onUpgrade={mockOnUpgrade} />);

      // Navigate to payment form
      fireEvent.click(screen.getByText('Continue to Payment'));

      // Submit payment
      const submitButton = screen.getByText('Subscribe for $29.99/month');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Your premium membership is now active.')).toBeInTheDocument();
      });

      // Wait for auto-close
      await waitFor(
        () => {
          expect(mockOnUpgrade).toHaveBeenCalled();
          expect(mockOnClose).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
    });

    it('should handle payment failure', async () => {
      (subscriptionAPI.upgrade as jest.Mock).mockRejectedValue(new Error('Payment declined'));

      render(<SubscriptionModal isOpen={true} onClose={mockOnClose} onUpgrade={mockOnUpgrade} />);

      // Navigate to payment form
      fireEvent.click(screen.getByText('Continue to Payment'));

      // Submit payment
      const submitButton = screen.getByText('Subscribe for $29.99/month');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Payment declined')).toBeInTheDocument();
      });

      // Should not close modal on failure
      expect(mockOnClose).not.toHaveBeenCalled();
      expect(mockOnUpgrade).not.toHaveBeenCalled();
    });

    it('should show processing state during payment', async () => {
      (subscriptionAPI.upgrade as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<SubscriptionModal isOpen={true} onClose={mockOnClose} onUpgrade={mockOnUpgrade} />);

      // Navigate to payment form
      fireEvent.click(screen.getByText('Continue to Payment'));

      // Submit payment
      const submitButton = screen.getByText('Subscribe for $29.99/month');
      fireEvent.click(submitButton);

      // Check processing state
      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Modal Close', () => {
    it('should call onClose when close button is clicked', () => {
      render(<SubscriptionModal isOpen={true} onClose={mockOnClose} onUpgrade={mockOnUpgrade} />);

      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should reset state when modal is closed', () => {
      const { rerender } = render(
        <SubscriptionModal isOpen={true} onClose={mockOnClose} onUpgrade={mockOnUpgrade} />
      );

      // Navigate to payment form
      fireEvent.click(screen.getByText('Continue to Payment'));
      expect(screen.getByTestId('card-element')).toBeInTheDocument();

      // Close modal
      fireEvent.click(screen.getByLabelText('Close modal'));

      // Reopen modal
      rerender(<SubscriptionModal isOpen={false} onClose={mockOnClose} onUpgrade={mockOnUpgrade} />);
      rerender(<SubscriptionModal isOpen={true} onClose={mockOnClose} onUpgrade={mockOnUpgrade} />);

      // Should be back to initial state
      expect(screen.getByText('Continue to Payment')).toBeInTheDocument();
      expect(screen.queryByTestId('card-element')).not.toBeInTheDocument();
    });
  });

  describe('Stripe Elements Integration', () => {
    it('should render Stripe CardElement in payment form', () => {
      render(<SubscriptionModal isOpen={true} onClose={mockOnClose} onUpgrade={mockOnUpgrade} />);

      fireEvent.click(screen.getByText('Continue to Payment'));

      expect(screen.getByTestId('card-element')).toBeInTheDocument();
    });

    it('should disable submit button when Stripe is not loaded', () => {
      const { useStripe } = require('@stripe/react-stripe-js');
      useStripe.mockReturnValue(null);

      render(<SubscriptionModal isOpen={true} onClose={mockOnClose} onUpgrade={mockOnUpgrade} />);

      fireEvent.click(screen.getByText('Continue to Payment'));

      const submitButton = screen.getByText('Subscribe for $29.99/month');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Upgrade Prompt for Normal Users', () => {
    it('should display modal when normal user tries premium features', () => {
      render(<SubscriptionModal isOpen={true} onClose={mockOnClose} onUpgrade={mockOnUpgrade} />);

      // Modal should show premium features
      expect(screen.getByText('Advanced trading signals with AI analysis')).toBeInTheDocument();
      expect(screen.getByText('Real-time data updates')).toBeInTheDocument();
      expect(screen.getByText('Stop-loss recommendations')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when payment fails', async () => {
      (subscriptionAPI.upgrade as jest.Mock).mockRejectedValue(new Error('Card declined'));

      render(<SubscriptionModal isOpen={true} onClose={mockOnClose} onUpgrade={mockOnUpgrade} />);

      fireEvent.click(screen.getByText('Continue to Payment'));
      fireEvent.click(screen.getByText('Subscribe for $29.99/month'));

      await waitFor(() => {
        expect(screen.getByText('Card declined')).toBeInTheDocument();
      });
    });

    it('should handle Stripe error', async () => {
      const { useStripe } = require('@stripe/react-stripe-js');
      useStripe.mockReturnValue({
        createPaymentMethod: jest.fn(() =>
          Promise.resolve({
            error: { message: 'Invalid card number' },
            paymentMethod: null,
          })
        ),
      });

      render(<SubscriptionModal isOpen={true} onClose={mockOnClose} onUpgrade={mockOnUpgrade} />);

      fireEvent.click(screen.getByText('Continue to Payment'));
      fireEvent.click(screen.getByText('Subscribe for $29.99/month'));

      await waitFor(() => {
        expect(screen.getByText('Invalid card number')).toBeInTheDocument();
      });
    });
  });
});
