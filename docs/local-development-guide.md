# Local Development Guide

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Docker and Docker Compose
- Python 3.9+ (for ACA-Py agent)
- Git

### Initial Setup

1. **Clone and Configure**
   ```bash
   git clone <repository-url>
   cd chai-vc-platform
   cp .env.example .env
   ```

2. **Install Dependencies**
   ```bash
   # Root dependencies
   npm install

   # Backend dependencies
   cd backend && npm install && cd ..

   # Frontend dependencies
   cd frontend && npm install && cd ..
   ```

3. **Database Setup**
   ```bash
   # Start PostgreSQL (via Docker)
   docker run -d --name postgres-chai \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=chai_vc_dev \
     -p 5432:5432 postgres:14

   # Run migrations
   cd backend
   npx prisma migrate dev
   npx prisma generate
   npx prisma db seed
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1: Backend API
   cd backend && npm run dev

   # Terminal 2: Frontend
   cd frontend && npm run dev

   # Terminal 3: ACA-Py Agent (optional)
   cd aca_py_agent && python -m aca_py start --auto-provision
   ```

## Environment Configuration

### Core Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/chai_vc_dev

# API Configuration
API_PORT=4000
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql

# Security (generate secure values for production)
JWT_SECRET=your-secure-jwt-secret
ENCRYPTION_KEY=your-32-byte-encryption-key
```

### Service URLs
- **Frontend**: http://localhost:3000
- **Backend GraphQL**: http://localhost:4000/graphql
- **GraphQL Playground**: http://localhost:4000/graphql (development only)
- **ACA-Py Admin**: http://localhost:8021
- **Database**: postgresql://localhost:5432/chai_vc_dev

## Development Workflow

### Daily Development

1. **Pull Latest Changes**
   ```bash
   git pull origin main
   npm install  # Update dependencies if needed
   ```

2. **Database Updates**
   ```bash
   cd backend
   npx prisma migrate dev  # Apply new migrations
   npx prisma generate     # Regenerate Prisma client
   ```

3. **Start Development**
   ```bash
   # Option 1: Individual terminals
   cd backend && npm run dev
   cd frontend && npm run dev

   # Option 2: Using Make (if available)
   make up
   ```

### Code Quality

```bash
# Linting
npm run lint           # Root project
cd backend && npm run lint
cd frontend && npm run lint

# Type checking
cd backend && npm run build
cd frontend && npm run type-check

# Testing
cd backend && npm test
# Frontend tests (when available)
cd frontend && npm test
```

## Project Structure

```
chai-vc-platform/
├── backend/              # GraphQL API server
│   ├── src/
│   │   ├── graphql/     # GraphQL schema & resolvers
│   │   ├── controllers/ # REST endpoints
│   │   ├── services/    # Business logic
│   │   ├── models/      # Data models
│   │   └── utils/       # Utilities
│   ├── prisma/          # Database schema & migrations
│   └── __tests__/       # Backend tests
├── frontend/            # Next.js React application
│   ├── pages/           # Next.js pages
│   ├── components/      # React components
│   ├── utils/           # Frontend utilities
│   └── vault/           # Client-side encryption
├── aca_py_agent/        # Aries Cloud Agent
├── contracts/           # Smart contracts
├── docs/                # Documentation
└── scripts/            # Build & utility scripts
```

## Database Management

### Common Operations

```bash
cd backend

# Reset database (destructive)
npx prisma migrate reset

# Apply pending migrations
npx prisma migrate dev

# Generate Prisma client after schema changes
npx prisma generate

# Seed database with test data
npm run seed

# Open Prisma Studio (database GUI)
npx prisma studio  # Opens http://localhost:5555
```

### Database Schema Changes

1. Edit `backend/prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name description-of-change`
3. Update seed data if needed: `backend/prisma/seed.ts`
4. Test migration: `npx prisma migrate reset && npm run seed`

## Testing

### Backend Testing

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- credential_controller.test.ts

# Generate test coverage
npm test -- --coverage
```

### API Testing

```bash
# GraphQL Playground: http://localhost:4000/graphql

# Sample GraphQL query:
query GetCredentials {
  credentials {
    id
    name
    issuer
    createdAt
  }
}

# Sample mutation:
mutation CreateCredential {
  createCredential(
    name: "Medical License"
    issuer: "State Medical Board"
  ) {
    id
    name
    issuer
  }
}
```

## Debugging

### Backend Debugging

1. **VS Code Launch Configuration** (`.vscode/launch.json`):
   ```json
   {
     "name": "Debug Backend",
     "type": "node",
     "request": "launch",
     "program": "${workspaceFolder}/backend/src/server.ts",
     "outDir": "${workspaceFolder}/backend/dist",
     "runtimeArgs": ["-r", "ts-node/register"],
     "env": {
       "NODE_ENV": "development"
     }
   }
   ```

2. **Console Debugging**:
   ```bash
   cd backend
   DEBUG=* npm run dev  # Verbose logging
   ```

### Database Debugging

```bash
cd backend

# Check database connection
npx prisma db pull

# View current migrations
npx prisma migrate status

# Check generated client
npx prisma validate
```

## Docker Development

### Full Stack with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# Reset volumes (destructive)
docker-compose down -v
```

### Individual Services

```bash
# Database only
docker run -d --name postgres-chai \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=chai_vc_dev \
  -p 5432:5432 postgres:14

# Redis cache (optional)
docker run -d --name redis-chai -p 6379:6379 redis:alpine
```

## Blockchain Development

### Local Substrate Node

```bash
# Clone and run local Substrate node
git clone https://github.com/substrate-developer-hub/substrate-node-template
cd substrate-node-template
cargo run -- --dev --tmp

# WebSocket endpoint: ws://localhost:9944
```

### Ethereum Development

```bash
# Install and run Hardhat local node
npm install -g @ethereum/hardhat
npx hardhat node

# RPC endpoint: http://localhost:8545
```

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Reset database connection
cd backend
npx prisma migrate reset
```

#### Port Already in Use
```bash
# Find process using port
lsof -ti:4000
kill -9 $(lsof -ti:4000)  # Kill process on port 4000

# Or use different ports in .env
API_PORT=4001
```

#### Prisma Client Out of Sync
```bash
cd backend
npx prisma generate
npm run build
```

#### Node Module Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
```

### Performance Issues

#### Slow GraphQL Queries
1. Check Prisma Studio for query execution
2. Add database indexes for frequently queried fields
3. Enable query logging: `LOG_LEVEL=debug`

#### Frontend Build Slow
```bash
cd frontend
rm -rf .next
npm run build
```

## IDE Setup

### VS Code Extensions
- GraphQL: GraphQL.vscode-graphql
- Prisma: Prisma.prisma
- TypeScript: ms-vscode.vscode-typescript-next
- ESLint: dbaeumer.vscode-eslint
- Prettier: esbenp.prettier-vscode

### VS Code Settings (`.vscode/settings.json`)
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Contributing

### Git Workflow
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: add feature"`
3. Push branch: `git push origin feature/your-feature`
4. Create pull request

### Code Standards
- Use TypeScript for all new code
- Follow ESLint configuration
- Add tests for new features
- Update documentation
- Use conventional commit messages

### Pre-commit Hooks
```bash
# Install pre-commit hooks
npm install -g @commitlint/cli @commitlint/config-conventional
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js
```

## Monitoring & Observability

### Health Checks
- Backend: `curl http://localhost:4000/health`
- Frontend: `curl http://localhost:3000/api/health`
- Database: `curl http://localhost:4000/db/health`

### Logging
```bash
# Backend logs
cd backend && npm run dev | grep ERROR

# Database query logs (set in .env)
DATABASE_LOGGING=true
```

---

*Document Version: 1.0*
*Last Updated: September 2025*
*Next Review: December 2025*