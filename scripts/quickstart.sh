#!/bin/bash
set -e

echo "🚀 VitalCV Pilot - Quick Start Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker${NC}"

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not found. Please install Docker Compose first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ first.${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION}${NC}"

echo ""
echo "🔧 Setting up environment..."

# Copy .env.example if .env doesn't exist
if [ ! -f backend/.env ]; then
    echo "Creating backend/.env from .env.example..."
    cp .env.example backend/.env
    echo -e "${GREEN}✅ backend/.env created${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env already exists, skipping${NC}"
fi

if [ ! -f frontend/.env.local ]; then
    echo "Creating frontend/.env.local..."
    cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
EOF
    echo -e "${GREEN}✅ frontend/.env.local created${NC}"
else
    echo -e "${YELLOW}⚠️  frontend/.env.local already exists, skipping${NC}"
fi

echo ""
echo "🐳 Starting Docker services..."

docker-compose -f docker-compose.dev.yml up -d postgres redis acapy-mock prometheus grafana mailhog

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo ""
echo "🔍 Checking service health..."

if docker-compose -f docker-compose.dev.yml ps | grep -q "postgres.*Up"; then
    echo -e "${GREEN}✅ PostgreSQL${NC}"
else
    echo -e "${RED}❌ PostgreSQL failed to start${NC}"
fi

if docker-compose -f docker-compose.dev.yml ps | grep -q "redis.*Up"; then
    echo -e "${GREEN}✅ Redis${NC}"
else
    echo -e "${RED}❌ Redis failed to start${NC}"
fi

echo ""
echo "📦 Installing dependencies..."

cd backend
npm install --silent
echo -e "${GREEN}✅ Backend dependencies${NC}"

cd ../frontend
npm install --silent
echo -e "${GREEN}✅ Frontend dependencies${NC}"

cd ..

echo ""
echo "🗄️  Setting up database..."

cd backend
npx prisma generate > /dev/null 2>&1
echo -e "${GREEN}✅ Prisma client generated${NC}"

npx prisma migrate deploy > /dev/null 2>&1 || echo -e "${YELLOW}⚠️  No migrations to apply${NC}"

# Seed data (optional)
if [ "$1" == "--seed" ]; then
    echo "🌱 Seeding demo data..."
    npm run seed > /dev/null 2>&1 || echo -e "${YELLOW}⚠️  Seed script not found${NC}"
fi

cd ..

echo ""
echo "✨ Setup complete!"
echo ""
echo "🎯 Quick Access URLs:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Frontend:    ${GREEN}http://localhost:3002${NC}"
echo -e "Backend API: ${GREEN}http://localhost:3000${NC}"
echo -e "Health:      ${GREEN}http://localhost:3000/api/health${NC}"
echo -e "Metrics:     ${GREEN}http://localhost:3000/metrics${NC}"
echo -e "SLO:         ${GREEN}http://localhost:3000/api/metrics/slo${NC}"
echo ""
echo -e "Grafana:     ${GREEN}http://localhost:3001${NC} (admin/admin)"
echo -e "Prometheus:  ${GREEN}http://localhost:9090${NC}"
echo -e "MailHog:     ${GREEN}http://localhost:8025${NC}"
echo -e "ACA-Py Mock: ${GREEN}http://localhost:8031${NC}"
echo ""
echo "🚀 To start the application:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "📖 Documentation:"
echo "  README.dev.md - Developer guide"
echo "  docs/ - Technical documentation"
echo "  release/pilot-v0.1-notes.md - Release notes"
echo ""
echo "🧪 Run tests:"
echo "  cd backend && npm test"
echo ""
echo "🛑 To stop services:"
echo "  docker-compose -f docker-compose.dev.yml down"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
