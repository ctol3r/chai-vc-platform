import requests


def send_event_to_n8n(event: dict, webhook_url: str) -> dict:
    """Send an event payload to an n8n webhook.

    Args:
        event: Event data to send.
        webhook_url: The n8n webhook URL.

    Returns:
        The JSON response from n8n.
    """
    response = requests.post(webhook_url, json=event)
    response.raise_for_status()
    return response.json()
