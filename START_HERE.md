# 🚀 START HERE - VitalCV Pilot

Welcome to the VitalCV Pilot codebase! This guide will get you up and running in minutes.

## Quick Start (< 5 minutes)

### 1. Run Setup Script

\`\`\`bash
./scripts/quickstart.sh --seed
\`\`\`

### 2. Start Services

\`\`\`bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend  
cd frontend && npm run dev
\`\`\`

### 3. Open Application

- **Frontend**: http://localhost:3002
- **SLO Dashboard**: http://localhost:3002/dashboard/slo
- **API Health**: http://localhost:3000/api/health

## What's Implemented?

✅ **Complete Claim Flow** - NPI validation → Document upload → Status tracking  
✅ **SLO Monitoring** - Real-time dashboard with 5 key metrics  
✅ **SD-JWT** - Selective disclosure for privacy  
✅ **ACA-Py Integration** - Credential issuance via Hyperledger Aries  
✅ **Widget Package** - Embeddable widget for partners  
✅ **Full Monitoring** - Prometheus + Grafana + Health checks

## Key Documents

📖 [README.dev.md](./README.dev.md) - Developer guide  
📊 [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - Feature status  
🎉 [PILOT_COMPLETE.md](./PILOT_COMPLETE.md) - Completion summary  
📚 [INDEX.md](./INDEX.md) - Full documentation index  

## Quick Commands

\`\`\`bash
# Test everything
cd backend && npm test

# Check health
curl http://localhost:3000/api/health

# View SLO metrics
curl http://localhost:3000/api/metrics/slo

# Stop all services
docker-compose -f docker-compose.dev.yml down
\`\`\`

## Need Help?

- Read: [README.dev.md](./README.dev.md)
- Browse: [INDEX.md](./INDEX.md)
- Slack: #vitalcv-dev

---

**🎯 Status: PILOT READY**

Ready to launch! 🚀
