# Chai VC Platform Developer Portal

Welcome to the Chai VC Platform developer portal. This portal provides the basics for interacting with our APIs and testing your integration.

## Getting an API Key

To get started, request an API key from your Chai VC Platform administrator. For testing purposes, you can use the example key below:

```
example_key_1234567890
```

Pass your API key using the `X-API-Key` HTTP header with each request.

## Example GraphQL Query

Below is a sample GraphQL query using `curl`. Replace `example_key_1234567890` with your own key when you receive one.

```bash
curl -X POST https://api.chai-vc.example.com/graphql \
  -H "Content-Type: application/json" \
  -H "X-API-Key: example_key_1234567890" \
  -d '{"query": "{ credentials { id status } }"}'
```

This request queries for a list of credentials. A successful response will look something like this:

```json
{
  "data": {
    "credentials": [
      {
        "id": "cred-123",
        "status": "verified"
      }
    ]
  }
}
```

## Further Reading

See the project [README](../README.md) for setup instructions. Additional endpoints and features will appear here as the platform evolves.
