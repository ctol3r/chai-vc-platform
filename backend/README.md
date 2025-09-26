# Backend Quickstart

## Node/Deps
- Node 20.x (or the version in CI)
- Install (local dev): `npm install --legacy-peer-deps` (temporary until ethers/hardhat align)

## Build & Test
```bash
cd backend
npm install --legacy-peer-deps
npm run build
npm test -- --runInBand
```
