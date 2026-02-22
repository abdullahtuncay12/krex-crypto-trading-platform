# Cryptocurrency Trading Signals SaaS

A full-stack web application that provides users with AI-driven trading recommendations for cryptocurrencies. The platform integrates with major exchange APIs (Binance, Coinbase, Bybit) and implements a two-tier membership model (normal and premium) with role-based access control.

## Project Structure

```
crypto-trading-signals/
├── backend/          # Node.js/Express backend with TypeScript
├── frontend/         # React frontend with TypeScript and TailwindCSS
└── package.json      # Root package.json for workspace management
```

## Technology Stack

### Backend
- Node.js 18+ with Express.js
- TypeScript
- PostgreSQL for persistent data
- Redis for caching
- JWT authentication
- Jest and fast-check for testing

### Frontend
- React 18+
- Redux Toolkit for state management
- TypeScript
- TailwindCSS for styling
- Vite for build tooling
- Chart.js for data visualization

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 7+

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd crypto-trading-signals
```

2. Install dependencies for all workspaces:
```bash
npm install
```

3. Set up environment variables:

Backend:
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

Frontend:
```bash
cd frontend
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
# Create PostgreSQL database
createdb crypto_signals

# Run migrations (to be added in future tasks)
cd backend
npm run migrate
```

5. Start Redis:
```bash
redis-server
```

## Development

Start both backend and frontend in development mode:
```bash
npm run dev
```

Or start them separately:

Backend:
```bash
npm run dev:backend
```

Frontend:
```bash
npm run dev:frontend
```

The backend will run on http://localhost:3001 and the frontend on http://localhost:3000.

## Testing

Run all tests:
```bash
npm test
```

Run tests for specific workspace:
```bash
npm run test:backend
npm run test:frontend
```

Run tests with coverage:
```bash
cd backend && npm run test:coverage
cd frontend && npm run test:coverage
```

## Building for Production

Build all workspaces:
```bash
npm run build
```

Build specific workspace:
```bash
npm run build:backend
npm run build:frontend
```

## API Documentation

The backend API will be available at http://localhost:3001/api

Key endpoints (to be implemented):
- `/api/auth/*` - Authentication endpoints
- `/api/cryptocurrencies/*` - Cryptocurrency data
- `/api/signals/*` - Trading signals
- `/api/subscriptions/*` - Subscription management
- `/api/alerts/*` - Alert management (premium only)

## Features

### Normal Users
- View basic trading signals (buy/sell/hold)
- Search and select cryptocurrencies
- View historical price data (30 days)
- View premium signal performance

### Premium Users
- All normal user features
- Advanced trading signals with stop-loss and limit orders
- Real-time data updates
- Price movement and pump alerts
- Extended historical analysis
- Configurable alert preferences

## License

Private - All rights reserved
