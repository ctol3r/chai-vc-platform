# VitalCV Monorepo

A Turborepo-powered monorepo for VitalCV's credential verification platform.

## 🚀 Quick Start

### Prerequisites

- Node.js v20.11.1 (use `.nvmrc`)
- pnpm 9.7.0

### Installation

```bash
pnpm install
```

### Development

Run all apps in parallel with hot reload:

```bash
pnpm dev
```

Services will be available at:
- **Frontend**: http://localhost:3005
- **Platform API**: http://localhost:4000

### Build

Build all packages:

```bash
pnpm build
```

### Testing

Run tests across all packages:

```bash
pnpm test
```

## 📦 Packages

### `@vitalcv/frontend`
Next.js 14 application providing the user interface.

**Scripts:**
- `pnpm dev` - Start dev server on port 3005
- `pnpm build` - Build for production
- `pnpm start` - Start production server

### `@vitalcv/platform-api`
Express backend API with NPI lookup, claim management, and credential issuance.

**Scripts:**
- `pnpm dev` - Start dev server with tsx
- `pnpm build` - Compile TypeScript
- `pnpm start` - Start production server

### `@vitalcv/vc-schemas`
Shared TypeScript types and schemas used across frontend and backend.

### `@vitalcv/verifier-sdk`
Client SDK for interacting with the VitalCV platform.

## 🧪 API Examples

### Health Check

```bash
# Frontend
curl -s http://localhost:3005/api/health | jq .

# Backend
curl -s http://localhost:4000/api/health | jq .
```

### NPI Lookup

Test with valid NPI numbers that pass Luhn checksum validation:

```bash
# Valid NPIs: 1467560003, 1205980003
curl -s "http://localhost:4000/api/npi/lookup?npi=1467560003" | jq .
```

Response:
```json
{
  "npi": "1467560003",
  "type": "INDIVIDUAL",
  "basic": {
    "first_name": "Test",
    "last_name": "Clinician",
    "credential": "MD"
  },
  "addresses": [],
  "taxonomies": []
}
```

## 🏗️ Project Structure

```
vitalcv/
├── packages/
│   ├── frontend/          # Next.js app
│   ├── platform-api/      # Express backend
│   ├── vc-schemas/        # Shared types
│   └── verifier-sdk/      # Client SDK
├── .github/
│   └── workflows/         # CI/CD pipelines
├── turbo.json            # Turborepo configuration
├── pnpm-workspace.yaml   # pnpm workspace config
└── package.json          # Root package
```

## 🔧 Development Tools

- **Turborepo**: Monorepo build system
- **pnpm**: Fast, disk space efficient package manager
- **TypeScript**: Type safety across all packages
- **Vitest**: Unit testing framework
- **ESLint**: Code linting

## 📝 Scripts

All scripts can be run from the root:

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm test` - Test all packages
- `pnpm e2e` - Run end-to-end tests

## 🚢 Deployment

The monorepo is configured for CI/CD with GitHub Actions:

- **ci.yml**: Runs on every push/PR to main
- **e2e-nightly.yml**: Nightly end-to-end tests

## 📚 Additional Documentation

- [API Documentation](./docs/api.md) _(coming soon)_
- [Frontend Guide](./packages/frontend/README.md) _(coming soon)_
- [Backend Guide](./packages/platform-api/README.md) _(coming soon)_

## 🔐 Environment Variables

Create `.env` files in each package as needed:

### platform-api/.env
```
PORT=4000
# Add other environment variables
```

### frontend/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:4000
# Add other environment variables
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm lint` and `pnpm test`
4. Submit a pull request

## 📄 License

[Add your license here]
