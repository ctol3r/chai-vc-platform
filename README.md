# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Embed Widget

The `ai-matcher-service` now exposes a simple Flask application that serves
an embeddable JavaScript widget. Partner websites can include the following
snippet to display a verification badge for a credential:

```html
<script src="https://your-domain/widget.js" data-credential-id="123"></script>
```

The script fetches `/verify/123` from the same origin and renders a small box
indicating whether the credential is verified. The verification endpoint is
CORS enabled so the widget can be embedded from any domain.
