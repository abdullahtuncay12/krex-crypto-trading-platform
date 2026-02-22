import React from 'react';
import { render, screen } from '@testing-library/react';
import { SignalDisplay, TradingSignal } from '../SignalDisplay';

describe('SignalDisplay Component', () => {
  const mockBuySignal: TradingSignal = {
    recommendation: 'buy',
    confidence: 85,
    timestamp: new Date('2024-01-15T10:30:00Z'),
    basicAnalysis: 'Strong upward momentum with RSI indicating oversold conditions.',
  };

  const mockSellSignal: TradingSignal = {
    recommendation: 'sell',
    confidence: 72,
    timestamp: new Date('2024-01-15T11:00:00Z'),
    basicAnalysis: 'Bearish trend detected with resistance at current levels.',
  };

  const mockHoldSignal: TradingSignal = {
    recommendation: 'hold',
    confidence: 60,
    timestamp: new Date('2024-01-15T12:00:00Z'),
    basicAnalysis: 'Market consolidation phase, wait for clearer signals.',
  };

  const mockPremiumSignal: TradingSignal = {
    recommendation: 'buy',
    confidence: 90,
    timestamp: new Date('2024-01-15T10:30:00Z'),
    basicAnalysis: 'Strong upward momentum with RSI indicating oversold conditions.',
    stopLoss: 42000,
    limitOrder: 48000,
    riskLevel: 'medium',
    detailedAnalysis: 'MACD crossover detected with volume confirmation. Bollinger bands suggest potential breakout.',
  };

  describe('Basic Signal Display', () => {
    it('should display buy recommendation with green styling', () => {
      render(<SignalDisplay signal={mockBuySignal} userRole="normal" />);
      
      const recommendation = screen.getByText('BUY');
      expect(recommendation).toBeInTheDocument();
      
      // Check for green color class
      const container = recommendation.closest('div');
      expect(container).toHaveClass('bg-green-100', 'text-green-800', 'border-green-300');
    });

    it('should display sell recommendation with red styling', () => {
      render(<SignalDisplay signal={mockSellSignal} userRole="normal" />);
      
      const recommendation = screen.getByText('SELL');
      expect(recommendation).toBeInTheDocument();
      
      // Check for red color class
      const container = recommendation.closest('div');
      expect(container).toHaveClass('bg-red-100', 'text-red-800', 'border-red-300');
    });

    it('should display hold recommendation with yellow styling', () => {
      render(<SignalDisplay signal={mockHoldSignal} userRole="normal" />);
      
      const recommendation = screen.getByText('HOLD');
      expect(recommendation).toBeInTheDocument();
      
      // Check for yellow color class
      const container = recommendation.closest('div');
      expect(container).toHaveClass('bg-yellow-100', 'text-yellow-800', 'border-yellow-300');
    });

    it('should display confidence level', () => {
      render(<SignalDisplay signal={mockBuySignal} userRole="normal" />);
      
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('Confidence')).toBeInTheDocument();
    });

    it('should display timestamp', () => {
      render(<SignalDisplay signal={mockBuySignal} userRole="normal" />);
      
      expect(screen.getByText(/Generated:/)).toBeInTheDocument();
    });

    it('should display basic analysis', () => {
      render(<SignalDisplay signal={mockBuySignal} userRole="normal" />);
      
      expect(screen.getByText('Analysis')).toBeInTheDocument();
      expect(screen.getByText(mockBuySignal.basicAnalysis)).toBeInTheDocument();
    });
  });

  describe('Normal User View', () => {
    it('should not display premium features for normal users', () => {
      render(<SignalDisplay signal={mockPremiumSignal} userRole="normal" />);
      
      expect(screen.queryByText('Stop Loss')).not.toBeInTheDocument();
      expect(screen.queryByText('Limit Order')).not.toBeInTheDocument();
      expect(screen.queryByText('Risk Level')).not.toBeInTheDocument();
      expect(screen.queryByText('Detailed Analysis')).not.toBeInTheDocument();
    });

    it('should display upgrade prompt for normal users', () => {
      render(<SignalDisplay signal={mockBuySignal} userRole="normal" />);
      
      expect(screen.getByText('Unlock Premium Features')).toBeInTheDocument();
      expect(screen.getByText(/Get stop-loss recommendations/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Upgrade to Premium/i })).toBeInTheDocument();
    });
  });

  describe('Premium User View', () => {
    it('should display stop-loss for premium users', () => {
      render(<SignalDisplay signal={mockPremiumSignal} userRole="premium" />);
      
      expect(screen.getByText('Stop Loss')).toBeInTheDocument();
      expect(screen.getByText('$42,000')).toBeInTheDocument();
    });

    it('should display limit order for premium users', () => {
      render(<SignalDisplay signal={mockPremiumSignal} userRole="premium" />);
      
      expect(screen.getByText('Limit Order')).toBeInTheDocument();
      expect(screen.getByText('$48,000')).toBeInTheDocument();
    });

    it('should display risk level for premium users', () => {
      render(<SignalDisplay signal={mockPremiumSignal} userRole="premium" />);
      
      expect(screen.getByText('Risk Level')).toBeInTheDocument();
      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    });

    it('should display detailed analysis for premium users', () => {
      render(<SignalDisplay signal={mockPremiumSignal} userRole="premium" />);
      
      expect(screen.getByText('Detailed Analysis')).toBeInTheDocument();
      expect(screen.getByText(mockPremiumSignal.detailedAnalysis!)).toBeInTheDocument();
    });

    it('should display premium insights badge', () => {
      render(<SignalDisplay signal={mockPremiumSignal} userRole="premium" />);
      
      expect(screen.getByText('Premium Insights')).toBeInTheDocument();
    });

    it('should not display upgrade prompt for premium users', () => {
      render(<SignalDisplay signal={mockPremiumSignal} userRole="premium" />);
      
      expect(screen.queryByText('Unlock Premium Features')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Upgrade to Premium/i })).not.toBeInTheDocument();
    });
  });

  describe('Visual Indicators', () => {
    it('should display appropriate icon for buy signal', () => {
      const { container } = render(<SignalDisplay signal={mockBuySignal} userRole="normal" />);
      
      // Check for SVG icon presence
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should display appropriate icon for sell signal', () => {
      const { container } = render(<SignalDisplay signal={mockSellSignal} userRole="normal" />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should display appropriate icon for hold signal', () => {
      const { container } = render(<SignalDisplay signal={mockHoldSignal} userRole="normal" />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Risk Level Styling', () => {
    it('should display low risk in green', () => {
      const lowRiskSignal: TradingSignal = {
        ...mockPremiumSignal,
        riskLevel: 'low',
      };
      
      render(<SignalDisplay signal={lowRiskSignal} userRole="premium" />);
      
      const riskText = screen.getByText('LOW');
      expect(riskText).toHaveClass('text-green-600');
    });

    it('should display medium risk in yellow', () => {
      render(<SignalDisplay signal={mockPremiumSignal} userRole="premium" />);
      
      const riskText = screen.getByText('MEDIUM');
      expect(riskText).toHaveClass('text-yellow-600');
    });

    it('should display high risk in red', () => {
      const highRiskSignal: TradingSignal = {
        ...mockPremiumSignal,
        riskLevel: 'high',
      };
      
      render(<SignalDisplay signal={highRiskSignal} userRole="premium" />);
      
      const riskText = screen.getByText('HIGH');
      expect(riskText).toHaveClass('text-red-600');
    });
  });

  describe('Edge Cases', () => {
    it('should handle premium signal without optional fields', () => {
      const minimalPremiumSignal: TradingSignal = {
        recommendation: 'buy',
        confidence: 75,
        timestamp: new Date('2024-01-15T10:30:00Z'),
        basicAnalysis: 'Basic analysis text.',
        stopLoss: 40000,
        limitOrder: 45000,
      };
      
      render(<SignalDisplay signal={minimalPremiumSignal} userRole="premium" />);
      
      expect(screen.getByText('Stop Loss')).toBeInTheDocument();
      expect(screen.getByText('Limit Order')).toBeInTheDocument();
      expect(screen.queryByText('Risk Level')).not.toBeInTheDocument();
      expect(screen.queryByText('Detailed Analysis')).not.toBeInTheDocument();
    });

    it('should handle zero confidence', () => {
      const zeroConfidenceSignal: TradingSignal = {
        ...mockBuySignal,
        confidence: 0,
      };
      
      render(<SignalDisplay signal={zeroConfidenceSignal} userRole="normal" />);
      
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle 100% confidence', () => {
      const maxConfidenceSignal: TradingSignal = {
        ...mockBuySignal,
        confidence: 100,
      };
      
      render(<SignalDisplay signal={maxConfidenceSignal} userRole="normal" />);
      
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });
});
