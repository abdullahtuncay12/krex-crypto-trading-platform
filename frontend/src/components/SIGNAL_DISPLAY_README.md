# SignalDisplay Component

## Overview

The `SignalDisplay` component displays trading signals with visual indicators and role-based content. It shows buy/sell/hold recommendations with confidence levels, timestamps, and analysis. Premium users see additional features like stop-loss, limit orders, risk levels, and detailed analysis.

## Features

### Visual Indicators (Requirement 9.4)
- **Buy Signal**: Green background with upward arrow icon
- **Sell Signal**: Red background with downward arrow icon
- **Hold Signal**: Yellow background with horizontal line icon

### Basic Features (All Users)
- Trading recommendation (buy/sell/hold)
- Confidence level percentage
- Timestamp of signal generation
- Basic analysis text

### Premium Features (Premium Users Only)
- Stop-loss recommendations (Requirement 4.2)
- Limit order suggestions (Requirement 4.3)
- Risk level indicator (low/medium/high)
- Detailed analysis text

### Upgrade Prompt
- Normal users see an upgrade prompt instead of premium features
- Encourages users to upgrade to access advanced insights

## Interface

### TradingSignal Type

\`\`\`typescript
interface TradingSignal {
  recommendation: 'buy' | 'sell' | 'hold';
  confidence: number;           // 0-100
  timestamp: Date;
  basicAnalysis: string;
  // Premium-only fields
  stopLoss?: number;
  limitOrder?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  detailedAnalysis?: string;
}
\`\`\`

### Props

\`\`\`typescript
interface SignalDisplayProps {
  signal: TradingSignal;
  userRole: 'normal' | 'premium';
}
\`\`\`

## Usage

\`\`\`tsx
import { SignalDisplay } from './components';

// For normal user
<SignalDisplay 
  signal={tradingSignal} 
  userRole="normal" 
/>

// For premium user
<SignalDisplay 
  signal={premiumSignal} 
  userRole="premium" 
/>
\`\`\`

## Color Coding

### Recommendation Colors
- **Buy**: Green (`bg-green-100`, `text-green-800`, `border-green-300`)
- **Sell**: Red (`bg-red-100`, `text-red-800`, `border-red-300`)
- **Hold**: Yellow (`bg-yellow-100`, `text-yellow-800`, `border-yellow-300`)

### Risk Level Colors
- **Low**: Green (`text-green-600`)
- **Medium**: Yellow (`text-yellow-600`)
- **High**: Red (`text-red-600`)

## Component Structure

1. **Header Section**: Displays recommendation with icon, confidence percentage
2. **Timestamp**: Shows when the signal was generated
3. **Basic Analysis**: Available to all users
4. **Premium Section**: Only visible to premium users
   - Stop-loss and limit order values
   - Risk level indicator
   - Detailed analysis
5. **Upgrade Prompt**: Only visible to normal users

## Requirements Validation

- **Requirement 3.1**: Displays buy/sell/hold recommendation for all users
- **Requirement 4.1**: Shows advanced signals for premium users
- **Requirement 4.2**: Includes stop-loss recommendations for premium users
- **Requirement 4.3**: Includes limit order suggestions for premium users
- **Requirement 9.4**: Uses clear visual indicators (color coding and icons)

## Testing

The component includes comprehensive tests covering:
- Visual indicators for each recommendation type
- Confidence level display
- Timestamp formatting
- Basic analysis display
- Premium feature visibility based on user role
- Upgrade prompt for normal users
- Risk level color coding
- Edge cases (zero confidence, 100% confidence, missing optional fields)

Run tests with:
\`\`\`bash
npm test -- SignalDisplay.test.tsx
\`\`\`

## Implementation Notes

- Uses TailwindCSS for styling
- Responsive design with max-width constraint
- Icons are inline SVG for better performance
- Timestamp formatted using locale-specific formatting
- Premium features are conditionally rendered based on userRole prop
- Component is fully typed with TypeScript
