# MPC Service

This service demonstrates a simplified multiparty computation (MPC) flow
for joint verifications between institutions. Each institution submits a
list of hashed credentials. The service exposes an API to compute the
intersection of all submitted credentials so institutions can verify
shared data without revealing additional information.

## Endpoints

- `POST /submit` – Submit an institution name and a list of credential
  hashes.
- `GET /intersection` – Compute the intersection across all submitted
  credential sets.

Run the service locally with:

```bash
pip install -r requirements.txt
python app.py
```
