# Chai VC Platform

This project provides a basic hub for credential adapters that can translate
credentials between different networks. The hub is implemented in the
`backend` service using Node.js and TypeScript.

## Launching the Hub

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Run tests:
   ```bash
   npm test
   ```
3. Start the server:
   ```bash
   npm run build && npm start
   ```
   The hub listens on port `3000` by default.

## License

This repository is licensed under the GNU General Public License v3.0. See
[LICENSE](LICENSE) for details.
