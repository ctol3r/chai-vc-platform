"""Example matching route using a secret from Vault."""
from ..secrets import get_npdb_key


def match() -> dict:
    """Return whether the NPDB API key is available."""
    api_key = get_npdb_key()
    return {"api_key_present": api_key is not None}
