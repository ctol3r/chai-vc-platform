# @vitalcv/widget

Embeddable widget for VitalCV credential verification and claim submission.

## Installation

```bash
npm install @vitalcv/widget
```

Or via CDN:

```html
<script src="https://cdn.vitalcv.com/widget/v0.1.0/vitalcv-widget.min.js"></script>
```

## Usage

### Basic Example

```javascript
import { initWidget } from '@vitalcv/widget';

const widget = initWidget({
  apiUrl: 'https://api.vitalcv.com',
  allowedOrigins: ['https://vitalcv.com'],
  onComplete: (result) => {
    console.log('Claim submitted:', result.claimId);
    // Handle completion (e.g., redirect, show success message)
  },
  onError: (error) => {
    console.error('Widget error:', error);
  },
});

// Open widget
document.getElementById('apply-btn').addEventListener('click', () => {
  widget.open();
});
```

### React Example

```tsx
import React from 'react';
import { VitalCVWidget, WidgetConfig } from '@vitalcv/widget';

const ApplyButton: React.FC = () => {
  const handleApply = async () => {
    const widget = new VitalCVWidget({
      apiUrl: 'https://api.vitalcv.com',
      mode: 'modal',
      onComplete: (result) => {
        alert(`Application submitted: ${result.claimId}`);
      },
    });

    await widget.open();
  };

  return (
    <button onClick={handleApply}>
      Apply with VitalCV
    </button>
  );
};

export default ApplyButton;
```

### Vue Example

```vue
<template>
  <button @click="openWidget">Apply with VitalCV</button>
</template>

<script>
import { initWidget } from '@vitalcv/widget';

export default {
  methods: {
    async openWidget() {
      const widget = initWidget({
        apiUrl: 'https://api.vitalcv.com',
        onComplete: (result) => {
          console.log('Application completed:', result);
        },
      });

      await widget.open();
    },
  },
};
</script>
```

### Plain JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>VitalCV Widget Demo</title>
</head>
<body>
  <button id="apply-btn">Apply with VitalCV</button>

  <script src="https://cdn.vitalcv.com/widget/v0.1.0/vitalcv-widget.min.js"></script>
  <script>
    const widget = VitalCV.initWidget({
      apiUrl: 'https://api.vitalcv.com',
      allowedOrigins: ['https://vitalcv.com'],
      onComplete: function(result) {
        alert('Application submitted: ' + result.claimId);
      },
      onError: function(error) {
        console.error('Error:', error);
      }
    });

    document.getElementById('apply-btn').addEventListener('click', function() {
      widget.open();
    });
  </script>
</body>
</html>
```

## Configuration

### WidgetConfig

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `apiUrl` | string | ✅ | VitalCV API endpoint URL |
| `allowedOrigins` | string[] | ❌ | Allowed origins for postMessage (security) |
| `containerId` | string | ❌ | Container element ID (inline mode only) |
| `mode` | 'modal' \| 'inline' | ❌ | Display mode (default: 'modal') |
| `branding` | WidgetBranding | ❌ | Brand customization options |
| `onComplete` | function | ❌ | Callback when claim is submitted |
| `onError` | function | ❌ | Callback on errors |
| `onClose` | function | ❌ | Callback when widget is closed |

### WidgetBranding

| Option | Type | Description |
|--------|------|-------------|
| `primaryColor` | string | Primary brand color (hex) |
| `logo` | string | Logo URL |
| `fontFamily` | string | Custom font family |
| `borderRadius` | string | Button border radius |

### WidgetResult

The `onComplete` callback receives:

```typescript
{
  claimId: string;      // Claim ID
  statusId: string;     // Status ID for tracking
  proof?: string;       // Optional proof token
  npi?: string;         // Provider NPI
}
```

## Security

### Origin Whitelist

Always specify allowed origins to prevent unauthorized access:

```javascript
const widget = initWidget({
  apiUrl: 'https://api.vitalcv.com',
  allowedOrigins: [
    'https://vitalcv.com',
    'https://yoursite.com'
  ],
});
```

### Content Security Policy (CSP)

Add these CSP directives to your site:

```html
<meta http-equiv="Content-Security-Policy" 
      content="frame-src https://api.vitalcv.com; connect-src https://api.vitalcv.com;">
```

### Embed Token

The widget automatically requests a short-lived embed token from the backend. Tokens expire after 5 minutes.

## Customization

### Branding

```javascript
const widget = initWidget({
  apiUrl: 'https://api.vitalcv.com',
  branding: {
    primaryColor: '#3b82f6',
    logo: 'https://yoursite.com/logo.png',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '8px',
  },
});
```

### Inline Mode

```html
<div id="vitalcv-widget-container"></div>

<script>
  const widget = VitalCV.initWidget({
    apiUrl: 'https://api.vitalcv.com',
    mode: 'inline',
    containerId: 'vitalcv-widget-container',
  });

  widget.open();
</script>
```

## Events

The widget communicates via postMessage:

### Outgoing Events (Widget → Parent)

- `widget:ready` - Widget loaded successfully
- `widget:complete` - Claim submission completed
- `widget:error` - Error occurred
- `widget:close` - Widget closed by user
- `widget:resize` - Widget height changed (inline mode)

### Handling Events

```javascript
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://api.vitalcv.com') return;

  const message = event.data;
  
  switch (message.type) {
    case 'widget:complete':
      console.log('Claim ID:', message.payload.claimId);
      break;
    
    case 'widget:error':
      console.error('Error:', message.payload.error);
      break;
  }
});
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari (iOS 14+)
- Chrome Mobile

## TypeScript

Full TypeScript support with type definitions included:

```typescript
import { VitalCVWidget, WidgetConfig, WidgetResult } from '@vitalcv/widget';

const config: WidgetConfig = {
  apiUrl: 'https://api.vitalcv.com',
  onComplete: (result: WidgetResult) => {
    console.log(result.claimId);
  },
};

const widget = new VitalCVWidget(config);
```

## Testing

### Development Mode

```javascript
const widget = initWidget({
  apiUrl: 'http://localhost:3000', // Local backend
  allowedOrigins: ['http://localhost:3001'],
});
```

### Mock Mode

Use the stub backend for testing without real credentials:

```bash
export ACAPY_STUB=true
npm run dev
```

## Troubleshooting

### Widget doesn't load

1. Check CSP headers allow iframe from VitalCV domain
2. Verify `apiUrl` is correct and accessible
3. Check browser console for CORS errors
4. Ensure origin is in `allowedOrigins` list

### postMessage not working

1. Verify origin whitelist includes your domain
2. Check event listener is set up before opening widget
3. Ensure HTTPS is used in production

### Token errors

1. Tokens expire after 5 minutes
2. Request new token for each widget open
3. Verify backend `/api/widget/token` endpoint is accessible

## Support

- Documentation: https://docs.vitalcv.com/widget
- Issues: https://github.com/vitalcv/widget/issues
- Email: support@vitalcv.com

## License

MIT License - See LICENSE file for details

## Version

Current version: **0.1.0** (Pilot)

## Changelog

### v0.1.0 (2024)
- Initial release
- Modal and inline modes
- Brand customization
- postMessage API
- TypeScript support
- React/Vue/Plain JS examples
