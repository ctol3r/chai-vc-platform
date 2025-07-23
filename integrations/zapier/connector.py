import requests


def send_credential_to_zapier(credential: dict, webhook_url: str) -> dict:
    """Send a credential payload to a Zapier webhook.

    Args:
        credential: Credential data to send.
        webhook_url: The Zapier webhook URL.

    Returns:
        The JSON response from Zapier.
    """
    response = requests.post(webhook_url, json=credential)
    response.raise_for_status()
    return response.json()
