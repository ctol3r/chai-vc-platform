"""Utilities for retrieving secrets from HashiCorp Vault.

Falls back to environment variables when hvac is unavailable so unit tests
can run without Vault.
"""
import os
from typing import Optional

try:
    import hvac  # type: ignore
except Exception:  # pragma: no cover
    hvac = None

def get_npdb_key() -> Optional[str]:
    """Return the NPDB API key.

    If Vault is configured, the key is retrieved from the ``npdb`` path in the
    KV store. Otherwise the ``NPDB_API_KEY`` environment variable is used.
    """
    if hvac is None:
        return os.getenv("NPDB_API_KEY")

    client = hvac.Client(url=os.getenv("VAULT_ADDR"), token=os.getenv("VAULT_TOKEN"))
    secret = client.secrets.kv.v2.read_secret_version(path="npdb")
    return secret["data"]["data"].get("api_key")
