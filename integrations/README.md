# Integration Connectors

This folder provides simple connectors for low-code/no-code platforms.

## Zapier Connector

Use `integrations/zapier/connector.py` to send credential data to a Zapier Webhook.

```python
from integrations.zapier.connector import send_credential_to_zapier

credential = {"id": "123", "status": "verified"}
result = send_credential_to_zapier(credential, "https://hooks.zapier.com/...")
print(result)
```

## n8n Connector

Use `integrations/n8n/connector.py` to send events to an n8n webhook.

```python
from integrations.n8n.connector import send_event_to_n8n

event = {"type": "credential_created", "id": "123"}
result = send_event_to_n8n(event, "https://n8n.example/webhook")
print(result)
```

Both connectors use simple HTTP POST requests, allowing non-developers to configure workflows in their preferred automation platform.
