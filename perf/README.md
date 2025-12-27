# Performance Testing

This suite uses [Locust](https://locust.io) to exercise the credential issuance and verification flows.

## Run

1. Start the backend server:
   ```bash
   cd backend
   npm install
   npm start
   ```
2. In another terminal, run Locust in headless mode at the desired load:
   ```bash
   locust -f perf/locustfile.py --headless -u 50 -r 10 -t 1m --host http://localhost:4000
   ```

The test will issue, verify and present credentials. It fails if the p95 latency of the `verify` step exceeds **250ms**.
