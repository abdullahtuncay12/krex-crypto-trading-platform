# Implementation Plan: Cryptocurrency Trading Signals SaaS

## Overview

This implementation plan breaks down the cryptocurrency trading signals platform into discrete, incremental coding tasks. The approach follows a bottom-up strategy: starting with foundational infrastructure (database, authentication), building core services (exchange integration, signal generation), implementing the API layer, and finally creating the React frontend. Each task builds on previous work, ensuring no orphaned code and enabling early validation through testing.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Create monorepo structure with backend and frontend directories
  - Initialize Node.js/Express backend with TypeScript
  - Initialize React frontend with TypeScript and TailwindCSS
  - Configure PostgreSQL database connection
  - Configure Redis for caching
  - Set up Jest and fast-check for testing
  - Create environment configuration files
  - _Requirements: All (foundational)_

- [x] 2. Implement database models and migrations
  - [x] 2.1 Create User model with authentication fields
    - Define User schema with id, email, passwordHash, name, role, timestamps
    - Create database migration for users table
    - Add indexes on email (unique) and role
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 2.2 Create Subscription model
    - Define Subscription schema with userId, planId, status, period dates, Stripe ID
    - Create database migration for subscriptions table
    - Add indexes on userId, status, currentPeriodEnd
    - _Requirements: 8.2, 8.4, 8.5_
  
  - [x] 2.3 Create TradingSignal model
    - Define TradingSignalRecord schema with cryptocurrency, recommendation, prices, signal type
    - Create database migration for trading_signals table
    - Add indexes on cryptocurrency, createdAt, signalType
    - _Requirements: 3.1, 4.1, 4.2, 4.3_
  
  - [x] 2.4 Create CompletedTrade model
    - Define CompletedTradeRecord schema with signal reference, prices, profit
    - Create database migration for completed_trades table
    - Add indexes on cryptocurrency, exitDate, profitPercent
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 2.5 Create Alert and AlertPreferences models
    - Define Alert schema with userId, cryptocurrency, alertType, message
    - Define AlertPreferences schema with userId, thresholds, enabled cryptocurrencies
    - Create database migrations for both tables
    - Add appropriate indexes
    - _Requirements: 10.1, 10.3, 10.4_

- [ ] 3. Implement authentication system
  - [x] 3.1 Create authentication service
    - Implement user registration with bcrypt password hashing
    - Implement login with JWT token generation
    - Implement token verification middleware
    - Default new users to 'normal' role
    - _Requirements: 1.1, 1.4_
  
  - [ ]*  3.2 Write property test for default role assignment
    - **Property 1: Default role assignment on registration**
    - **Validates: Requirements 1.1**
  
  - [x] 3.3 Create RBAC middleware
    - Implement requireAuth middleware for protected routes
    - Implement requireRole middleware for role-based access
    - Return 401 for unauthenticated, 403 for unauthorized
    - _Requirements: 1.4, 1.5, 3.4_
  
  - [ ]* 3.4 Write property test for authentication enforcement
    - **Property 4: Authentication required for protected endpoints**
    - **Validates: Requirements 1.4**
  
  - [ ]* 3.5 Write property test for role-based authorization
    - **Property 5: Role-based authorization enforcement**
    - **Validates: Requirements 1.5, 3.4**

- [ ] 4. Implement exchange API integration
  - [x] 4.1 Create exchange client wrappers
    - Implement BinanceClient with getCurrentPrice, getHistoricalData, get24hVolume
    - Implement CoinbaseClient with same methods
    - Implement BybitClient with same methods
    - Add retry logic with exponential backoff for all clients
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 4.2 Write unit tests for exchange clients
    - Test successful data fetch from each exchange
    - Test retry behavior on API failures
    - Test rate limit handling
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 4.3 Write property test for retry mechanism
    - **Property 12: Exchange API retry on failure**
    - **Validates: Requirements 5.4**
  
  - [x] 4.4 Create ExchangeAggregator service
    - Aggregate data from multiple exchange clients
    - Implement Redis caching with 30-second TTL
    - Handle partial failures (use available exchanges)
    - Return error when all exchanges unavailable
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [ ]* 4.5 Write unit tests for ExchangeAggregator
    - Test data aggregation from multiple sources
    - Test caching behavior
    - Test fallback to cache on API failure
    - Test error when all exchanges down (edge case)
    - _Requirements: 5.4, 5.5_

- [x] 5. Checkpoint - Ensure exchange integration works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement signal generation service
  - [x] 6.1 Create SignalGenerator service
    - Implement calculateRSI for momentum analysis
    - Implement calculateMACD for trend analysis
    - Implement calculateBollingerBands for volatility analysis
    - Implement determineRecommendation logic (buy/sell/hold)
    - _Requirements: 3.1, 4.1_
  
  - [x] 6.2 Implement basic signal generation
    - Create generateBasicSignal method for normal users
    - Return recommendation, confidence, timestamp, basic analysis
    - Use ExchangeAggregator for price data
    - Store generated signals in database
    - _Requirements: 3.1, 3.2_
  
  - [x] 6.3 Implement premium signal generation
    - Create generatePremiumSignal method for premium users
    - Include all basic signal fields plus stopLoss and limitOrder
    - Implement calculateStopLoss based on volatility
    - Implement calculateLimitOrder based on recommendation
    - Add detailed analysis and risk level
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 6.4 Write property test for signal generation
    - **Property 7: Signal generation for selected cryptocurrency**
    - **Validates: Requirements 2.3, 3.1**
  
  - [ ]* 6.5 Write property test for premium signal completeness
    - **Property 10: Premium signal field completeness**
    - **Validates: Requirements 4.2, 4.3**
  
  - [ ]* 6.6 Write unit tests for signal generation
    - Test basic signal for normal users
    - Test premium signal with stop-loss and limit orders
    - Test signal with empty price history (edge case)
    - Test signal with extreme volatility (edge case)
    - _Requirements: 3.1, 4.1, 4.2, 4.3_

- [ ] 7. Implement subscription management
  - [x] 7.1 Create SubscriptionManager service
    - Integrate with Stripe API for payment processing
    - Implement createSubscription method
    - Implement cancelSubscription method
    - Implement handlePaymentSuccess webhook handler
    - Implement handlePaymentFailure webhook handler
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 7.2 Implement role update logic
    - Update user role to 'premium' on successful payment
    - Set cancelAtPeriodEnd flag on cancellation (don't immediately revoke)
    - Implement checkExpiredSubscriptions scheduled job
    - Revert user role to 'normal' when subscription expires
    - _Requirements: 1.2, 1.3, 8.2, 8.4_
  
  - [ ]* 7.3 Write property test for role upgrade
    - **Property 2: Role upgrade on premium subscription**
    - **Validates: Requirements 1.2**
  
  - [ ]* 7.4 Write property test for role downgrade
    - **Property 3: Role downgrade on subscription expiration**
    - **Validates: Requirements 1.3**
  
  - [ ]* 7.5 Write property test for premium activation
    - **Property 19: Premium activation on payment success**
    - **Validates: Requirements 8.2**
  
  - [ ]* 7.6 Write property test for access retention
    - **Property 20: Access retention on subscription cancellation**
    - **Validates: Requirements 8.4**
  
  - [ ]* 7.7 Write property test for payment failure notification
    - **Property 21: Notification on payment failure**
    - **Validates: Requirements 8.5**
  
  - [ ]* 7.8 Write unit tests for subscription flows
    - Test successful upgrade to premium
    - Test subscription cancellation flow
    - Test payment failure notification
    - Test expired subscription handling
    - _Requirements: 8.2, 8.4, 8.5_

- [ ] 8. Implement alert system for premium users
  - [x] 8.1 Create AlertService
    - Implement checkPriceMovements method (runs every 60 seconds)
    - Implement detectPumpSignals method
    - Implement sendAlert method for in-app notifications
    - Query user alert preferences before sending
    - Store alerts in database
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 8.2 Implement alert preference management
    - Create methods to save and retrieve user alert preferences
    - Support configuration of price movement threshold
    - Support enabling/disabling pump alerts
    - Support selecting cryptocurrencies to monitor
    - _Requirements: 10.3_
  
  - [ ]* 8.3 Write property test for alert generation
    - **Property 11: Alert generation on trading opportunities**
    - **Validates: Requirements 4.5, 10.1**
  
  - [ ]* 8.4 Write property test for alert preferences
    - **Property 23: Alert preferences persistence**
    - **Validates: Requirements 10.3**
  
  - [ ]* 8.5 Write property test for alert content
    - **Property 24: Alert content completeness**
    - **Validates: Requirements 10.4**

- [x] 9. Checkpoint - Ensure core services work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement REST API endpoints
  - [x] 10.1 Create authentication endpoints
    - POST /api/auth/register - user registration
    - POST /api/auth/login - user login with JWT
    - GET /api/auth/me - get current user info
    - Apply validation middleware for request bodies
    - _Requirements: 1.1, 1.4_
  
  - [x] 10.2 Create cryptocurrency endpoints
    - GET /api/cryptocurrencies - list all supported cryptocurrencies
    - GET /api/cryptocurrencies/:symbol - get specific cryptocurrency data
    - GET /api/cryptocurrencies/:symbol/history - get historical price data
    - Use ExchangeAggregator service for data
    - _Requirements: 2.1, 2.2, 2.3, 7.1, 7.2_
  
  - [x] 10.3 Create trading signal endpoints
    - GET /api/signals/:symbol - get trading signal (role-based response)
    - GET /api/signals/performance - get public performance data
    - Apply requireAuth middleware
    - Return basic or premium signal based on user role
    - _Requirements: 3.1, 4.1, 6.1_
  
  - [x] 10.4 Create subscription endpoints
    - POST /api/subscriptions/upgrade - upgrade to premium
    - POST /api/subscriptions/cancel - cancel subscription
    - GET /api/subscriptions/status - get subscription status
    - POST /api/webhooks/stripe - handle Stripe webhooks
    - Apply requireAuth middleware (except webhooks)
    - _Requirements: 8.1, 8.2, 8.4_
  
  - [x] 10.5 Create alert endpoints (premium only)
    - GET /api/alerts - get user alerts
    - POST /api/alerts/preferences - save alert preferences
    - GET /api/alerts/preferences - get alert preferences
    - Apply requireAuth and requireRole('premium') middleware
    - _Requirements: 10.1, 10.3, 10.4_
  
  - [ ]* 10.6 Write integration tests for API endpoints
    - Test complete user registration and login flow
    - Test cryptocurrency data retrieval
    - Test signal generation for normal and premium users
    - Test subscription upgrade and cancellation
    - Test alert preference management
    - _Requirements: 1.1, 1.4, 2.3, 3.1, 4.1, 8.2, 10.3_

- [ ] 11. Implement React frontend components
  - [x] 11.1 Set up Redux store and authentication slice
    - Create Redux store with Redux Toolkit
    - Create auth slice with login, logout, register actions
    - Create API client with Axios and JWT interceptor
    - Implement token storage in localStorage
    - _Requirements: 1.4_
  
  - [x] 11.2 Create authentication components
    - Create LoginForm component
    - Create RegisterForm component
    - Create PrivateRoute wrapper for protected pages
    - Implement form validation
    - _Requirements: 1.1, 1.4_
  
  - [x] 11.3 Create CryptoSelector component
    - Display list of cryptocurrencies in dropdown
    - Implement search/filter functionality
    - Fetch cryptocurrency list from API on mount
    - Emit onSelect event when user chooses a crypto
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ]* 11.4 Write property test for search filtering
    - **Property 6: Cryptocurrency search filtering**
    - **Validates: Requirements 2.2**
  
  - [ ]* 11.5 Write property test for display completeness
    - **Property 8: Cryptocurrency display completeness**
    - **Validates: Requirements 2.5**

- [ ] 12. Implement signal display components
  - [x] 12.1 Create SignalDisplay component
    - Display recommendation (buy/sell/hold) with visual indicators
    - Show confidence level and timestamp
    - Show basic analysis for all users
    - Show stop-loss, limit order, and detailed analysis for premium users only
    - Use color coding: green for buy, red for sell, yellow for hold
    - _Requirements: 3.1, 4.1, 4.2, 4.3, 9.4_
  
  - [ ]* 12.2 Write property test for visual indicators
    - **Property 22: Visual indicators for recommendations**
    - **Validates: Requirements 9.4**
  
  - [x] 12.3 Create HistoricalChart component
    - Use Chart.js or Recharts for visualization
    - Display price history for selected cryptocurrency
    - Fetch historical data from API
    - Show extended analysis for premium users
    - _Requirements: 7.1, 7.2, 7.4_
  
  - [ ]* 12.4 Write property test for historical data
    - **Property 16: Historical data availability**
    - **Validates: Requirements 7.1**
  
  - [ ]* 12.5 Write property test for data duration
    - **Property 17: Historical data minimum duration**
    - **Validates: Requirements 7.2**
  
  - [ ]* 12.6 Write property test for extended analysis
    - **Property 18: Extended analysis for premium users**
    - **Validates: Requirements 7.4**

- [ ] 13. Implement performance and subscription components
  - [x] 13.1 Create PerformanceDisplay component
    - Fetch completed trades from /api/signals/performance
    - Display trades at bottom of homepage
    - Show cryptocurrency, entry/exit prices, profit percentage
    - Style profitable trades in green color
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ]* 13.2 Write property test for profit color coding
    - **Property 13: Performance display profit color coding**
    - **Validates: Requirements 6.2**
  
  - [ ]* 13.3 Write property test for performance data completeness
    - **Property 14: Performance display data completeness**
    - **Validates: Requirements 6.3**
  
  - [ ]* 13.4 Write property test for performance data integrity
    - **Property 15: Performance data integrity**
    - **Validates: Requirements 6.4**
  
  - [x] 13.5 Create SubscriptionModal component
    - Display premium plan features and pricing
    - Integrate Stripe Elements for payment
    - Handle payment submission and success/failure
    - Show upgrade prompt when normal users try premium features
    - _Requirements: 8.1, 8.2_

- [ ] 14. Implement alert components for premium users
  - [x] 14.1 Create AlertList component
    - Fetch alerts from /api/alerts
    - Display alerts with cryptocurrency symbol and reason
    - Mark alerts as read when viewed
    - Show unread count badge
    - _Requirements: 10.1, 10.4_
  
  - [x] 14.2 Create AlertPreferences component
    - Allow premium users to configure alert settings
    - Set price movement threshold slider
    - Toggle pump alerts on/off
    - Select cryptocurrencies to monitor with checkboxes
    - Save preferences to API
    - _Requirements: 10.3_

- [ ] 15. Create main HomePage component
  - [x] 15.1 Compose HomePage with all components
    - Single-page layout with all features
    - CryptoSelector at top
    - SignalDisplay in main area
    - HistoricalChart below signals
    - PerformanceDisplay at bottom
    - AlertList in sidebar for premium users
    - Responsive design with TailwindCSS
    - _Requirements: 2.1, 2.3, 3.1, 4.1, 6.1, 7.1, 9.1, 9.5_
  
  - [ ]* 15.2 Write unit tests for HomePage
    - Test homepage displays cryptocurrency list
    - Test signal display shows appropriate fields based on role
    - Test performance display shows trades in green
    - Test single-page layout structure
    - _Requirements: 2.1, 6.1, 9.1_

- [ ] 16. Implement scheduled jobs and background tasks
  - [x] 16.1 Create scheduled job for signal updates
    - Use node-cron to schedule signal generation every hour
    - Generate signals for all supported cryptocurrencies
    - Store signals in database for caching
    - _Requirements: 3.5_
  
  - [x] 16.2 Create scheduled job for alert checking
    - Use node-cron to run AlertService every 60 seconds
    - Check price movements and pump signals
    - Send alerts to premium users based on preferences
    - _Requirements: 10.1, 10.2_
  
  - [x] 16.3 Create scheduled job for subscription expiration
    - Use node-cron to check expired subscriptions daily
    - Call SubscriptionManager.checkExpiredSubscriptions
    - Update user roles for expired subscriptions
    - _Requirements: 1.3, 8.4_

- [ ] 17. Add error handling and validation
  - [x] 17.1 Implement global error handler middleware
    - Catch all errors and return consistent error format
    - Log errors with request context
    - Return appropriate HTTP status codes
    - Hide sensitive error details in production
    - _Requirements: All (error handling)_
  
  - [x] 17.2 Add request validation middleware
    - Validate request bodies for all POST/PUT endpoints
    - Validate cryptocurrency symbols against supported list
    - Validate date ranges for historical data
    - Return 400 Bad Request with field-specific errors
    - _Requirements: All (validation)_
  
  - [ ]* 17.3 Write unit tests for error handling
    - Test invalid credentials return 401
    - Test insufficient permissions return 403
    - Test invalid cryptocurrency symbol returns 400
    - Test all exchanges down returns 503 (edge case)
    - Test payment failure handling
    - _Requirements: 1.4, 1.5, 5.5, 8.5_

- [ ] 18. Final checkpoint - Integration testing
  - [ ]* 18.1 Write end-to-end integration tests
    - Test complete user journey: register → login → view signals → upgrade → view premium signals
    - Test premium user journey: configure alerts → receive alert on price movement
    - Test subscription lifecycle: upgrade → cancel → access retained → expires → role reverted
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 4.1, 8.2, 8.4, 10.1_
  
  - [x] 18.2 Ensure all tests pass
    - Run all unit tests
    - Run all property tests with 100 iterations
    - Run all integration tests
    - Verify code coverage meets 80% target
    - Ask the user if questions arise

- [ ] 19. Documentation and deployment preparation
  - [x] 19.1 Create API documentation
    - Document all REST endpoints with request/response examples
    - Document authentication and authorization requirements
    - Document error codes and messages
    - _Requirements: All_
  
  - [x] 19.2 Create deployment configuration
    - Create Dockerfile for backend
    - Create Dockerfile for frontend
    - Create docker-compose.yml for local development
    - Document environment variables
    - Create database migration scripts
    - _Requirements: All_
  
  - [x] 19.3 Create README and setup instructions
    - Document project structure
    - Document installation steps
    - Document how to run locally
    - Document how to run tests
    - Document API endpoints and usage
    - _Requirements: All_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation follows a bottom-up approach: infrastructure → services → API → frontend
- All code uses TypeScript for type safety
- Redis caching improves performance for exchange API calls
- Scheduled jobs handle background tasks (signal updates, alerts, subscription expiration)
