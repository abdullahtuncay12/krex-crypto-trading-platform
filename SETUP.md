# Setup Guide

This guide will help you set up the Crypto Trading Signals project from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js 18+** and npm
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **PostgreSQL 14+**
   - Download from: https://www.postgresql.org/download/
   - Or use Docker (see below)

3. **Redis 7+**
   - Download from: https://redis.io/download
   - Or use Docker (see below)

4. **Docker and Docker Compose** (Optional, but recommended)
   - Download from: https://www.docker.com/products/docker-desktop

## Quick Start with Docker

If you have Docker installed, this is the easiest way to get started:

1. **Start PostgreSQL and Redis:**
   ```bash
   docker-compose up -d
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   
   # Frontend
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your configuration
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Health Check: http://localhost:3001/health

## Manual Setup (Without Docker)

### 1. Install PostgreSQL

**Windows:**
- Download installer from https://www.postgresql.org/download/windows/
- Run installer and follow the wizard
- Remember the password you set for the postgres user

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE crypto_signals;

# Exit psql
\q
```

### 3. Install Redis

**Windows:**
- Download from https://github.com/microsoftarchive/redis/releases
- Or use WSL2 with Linux instructions

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

### 4. Install Project Dependencies

```bash
# Install all workspace dependencies
npm install
```

### 5. Configure Environment Variables

**Backend (.env):**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and update:
- Database connection details (if different from defaults)
- Redis connection details (if different from defaults)
- JWT secret (generate a secure random string)
- Exchange API keys (optional for now)
- Stripe keys (optional for now)

**Frontend (.env):**
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env` and update:
- API base URL (default is fine for local development)
- Stripe publishable key (optional for now)

### 6. Start Development Servers

**Option 1: Start both servers together**
```bash
npm run dev
```

**Option 2: Start servers separately**

Terminal 1 (Backend):
```bash
npm run dev:backend
```

Terminal 2 (Frontend):
```bash
npm run dev:frontend
```

## Verify Installation

1. **Check Backend:**
   - Open http://localhost:3001/health
   - You should see: `{"status":"ok","timestamp":"..."}`

2. **Check Frontend:**
   - Open http://localhost:3000
   - You should see the "Crypto Trading Signals" welcome page

3. **Check Database Connection:**
   - The backend console should show: "Database connected successfully"

4. **Check Redis Connection:**
   - The backend console should show: "Redis Client Connected"

## Running Tests

```bash
# Run all tests
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Run tests with coverage
cd backend && npm run test:coverage
cd frontend && npm run test:coverage
```

## Building for Production

```bash
# Build all workspaces
npm run build

# Build backend only
npm run build:backend

# Build frontend only
npm run build:frontend
```

## Troubleshooting

### Port Already in Use

If you get an error that port 3000 or 3001 is already in use:

**Windows:**
```powershell
# Find process using port
netstat -ano | findstr :3000
# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
# Find and kill process using port
lsof -ti:3000 | xargs kill -9
```

### Database Connection Failed

- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `backend/.env`
- Ensure database exists: `psql -U postgres -l`

### Redis Connection Failed

- Verify Redis is running: `redis-cli ping` (should return "PONG")
- Check Redis URL in `backend/.env`

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules backend/node_modules frontend/node_modules
npm install
```

## Next Steps

After successful setup:

1. Review the [README.md](README.md) for project overview
2. Check [.kiro/specs/crypto-trading-signals/](../.kiro/specs/crypto-trading-signals/) for requirements and design
3. Start implementing Task 2: Database models and migrations

## Project Structure

```
crypto-trading-signals/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── db/             # Database migrations
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── index.ts        # Entry point
│   ├── .env.example        # Environment template
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store
│   │   ├── App.tsx        # Root component
│   │   └── main.tsx       # Entry point
│   ├── .env.example       # Environment template
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml     # Docker services
├── package.json           # Root workspace config
└── README.md             # Project documentation
```

## Support

If you encounter any issues not covered in this guide, please check:
- The project's issue tracker
- The requirements and design documents in `.kiro/specs/`
- Node.js and npm documentation
