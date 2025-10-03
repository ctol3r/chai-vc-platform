#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Backend setup
echo "Setting up backend..."
cd backend
npm install
./scripts/run-migrations.sh
npx prisma generate
cd ..

# ACA-Py agent setup
echo "Setting up ACA-Py agent..."
pip install -r aca_py_agent/requirements.txt

# Bug bounty setup
echo "Setting up bug bounty program..."
pip install -r bug-bounty/requirements.txt

echo "Setup complete!"