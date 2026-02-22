#!/bin/bash

echo "🚀 Setting up Crypto Trading Signals project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. You'll need to install PostgreSQL and Redis manually."
else
    echo "✅ Docker is installed"
    echo "🐳 Starting PostgreSQL and Redis with Docker Compose..."
    docker-compose up -d
    echo "⏳ Waiting for services to be ready..."
    sleep 5
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment files
echo "📝 Setting up environment files..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env (please update with your configuration)"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env (please update with your configuration)"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your configuration"
echo "2. Update frontend/.env with your configuration"
echo "3. Run 'npm run dev' to start both backend and frontend"
echo ""
echo "Services:"
echo "- Backend: http://localhost:3001"
echo "- Frontend: http://localhost:3000"
echo "- PostgreSQL: localhost:5432"
echo "- Redis: localhost:6379"
