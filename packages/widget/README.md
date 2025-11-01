# @vitalcv/widget

Embeddable widget for VitalCV credential verification. Enables partners to integrate VitalCV's credential claim flow into their applications.

## Installation

```bash
npm install @vitalcv/widget
```

## Usage

### Basic Example (Plain JavaScript)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Apply with VitalCV</title>
</head>
<body>
  <div id="vitalcv-widget"></div>

  <script src="https://unpkg.com/@vitalcv/widget@latest"></script>
  <script>
    const widget = VitalCVWidget.createWidget({
      containerId: 'vitalcv-widget',
      apiKey: 'your-partner-api-key',
      apiUrl: 'https://api.vitalcv.com',
      onComplete: (data) => {
        console.log('Claim completed:', data);
        // Send to your backend for verification
        fetch('/api/verify-claim', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      },
      onError: (error) => {
        console.error('Widget error:', error);
      }
    });

    widget.open();
  </script>
</body>
</html>
```

### React Example

```tsx
import { useEffect, useRef } from 'react';
import { createWidget, WidgetAPI } from '@vitalcv/widget';

export function ApplyButton() {
  const widgetRef = useRef<WidgetAPI | null>(null);

  useEffect(() => {
    widgetRef.current = createWidget({
      containerId: 'vitalcv-container',
      apiKey: process.env.VITALCV_API_KEY!,
      onComplete: (data) => {
        console.log('Application complete:', data);
        // Handle completion
      },
    });

    return () => {
      widgetRef.current?.destroy();
    };
  }, []);

  return (
    <div>
      <button onClick={() => widgetRef.current?.open()}>
        Apply with VitalCV
      </button>
      <div id="vitalcv-container" />
    </div>
  );
}
```

### Vue Example

```vue
<template>
  <div>
    <button @click="openWidget">Apply with VitalCV</button>
    <div id="vitalcv-widget"></div>
  </div>
</template>

<script>
import { createWidget } from '@vitalcv/widget';

export default {
  data() {
    return {
      widget: null,
    };
  },
  mounted() {
    this.widget = createWidget({
      containerId: 'vitalcv-widget',
      apiKey: process.env.VUE_APP_VITALCV_API_KEY,
      onComplete: (data) => {
        console.log('Claim completed:', data);
      },
    });
  },
  methods: {
    openWidget() {
      this.widget?.open();
    },
  },
  beforeUnmount() {
    this.widget?.destroy();
  },
};
</script>
```

## API Reference

### `createWidget(config)`

Creates a new widget instance.

**Parameters:**

- `containerId` (string, required): DOM element ID where widget will be mounted
- `apiKey` (string, required): Partner API key from VitalCV
- `apiUrl` (string, optional): Backend API URL (default: `https://api.vitalcv.com`)
- `allowedOrigins` (string[], optional): Additional allowed origins for postMessage
- `theme` (object, optional): Theme customization
  - `primaryColor` (string): Primary color (hex)
  - `fontSize` (string): Base font size
  - `borderRadius` (string): Border radius for widget
- `onComplete` (function, optional): Callback when claim is completed
- `onError` (function, optional): Callback when error occurs
- `onClose` (function, optional): Callback when widget is closed

**Returns:** `WidgetAPI` instance

### WidgetAPI

**Methods:**

- `open()`: Open the widget
- `close()`: Close the widget
- `destroy()`: Destroy widget and cleanup resources

### Events

The widget communicates via postMessage with the following event types:

#### `widget:ready`

Widget loaded and ready to use.

```javascript
{
  type: 'widget:ready'
}
```

#### `widget:complete`

Claim submission completed successfully.

```javascript
{
  type: 'widget:complete',
  data: {
    claimId: 'claim-uuid',
    statusId: 'status-uuid',
    providerId: 'provider-id'
  }
}
```

#### `widget:error`

Error occurred during claim process.

```javascript
{
  type: 'widget:error',
  data: {
    code: 'INVALID_NPI',
    message: 'NPI validation failed',
    details: { ... }
  }
}
```

#### `widget:close`

Widget was closed by user.

```javascript
{
  type: 'widget:close'
}
```

## Security

### Origin Whitelist

The widget validates postMessage origins. Configure allowed origins:

```javascript
createWidget({
  containerId: 'widget',
  apiKey: 'your-key',
  allowedOrigins: [
    'https://yourdomain.com',
    'https://staging.yourdomain.com'
  ]
});
```

### Content Security Policy

Add these CSP directives to allow widget embedding:

```html
<meta http-equiv="Content-Security-Policy" 
  content="
    frame-src https://api.vitalcv.com;
    connect-src https://api.vitalcv.com;
  ">
```

### Iframe Sandboxing

The widget uses secure iframe sandboxing:

```
sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
```

## Customization

### Theme

Customize widget appearance:

```javascript
createWidget({
  containerId: 'widget',
  apiKey: 'your-key',
  theme: {
    primaryColor: '#1e40af',
    fontSize: '16px',
    borderRadius: '12px'
  }
});
```

### Size

Control widget size via CSS:

```css
#vitalcv-widget iframe {
  width: 100%;
  height: 700px;
  max-width: 600px;
}
```

## Error Handling

```javascript
createWidget({
  containerId: 'widget',
  apiKey: 'your-key',
  onError: (error) => {
    switch (error.code) {
      case 'INVALID_NPI':
        alert('Please check the NPI and try again');
        break;
      case 'UPLOAD_FAILED':
        alert('Document upload failed. Please retry.');
        break;
      case 'API_ERROR':
        alert('Service temporarily unavailable');
        break;
      default:
        alert(`Error: ${error.message}`);
    }
  }
});
```

## Backend Verification

After receiving a completion event, verify the claim with your backend:

```javascript
onComplete: async (data) => {
  // Verify with VitalCV API
  const response = await fetch('https://api.vitalcv.com/api/claim/status', {
    params: { statusId: data.statusId },
    headers: {
      'Authorization': `Bearer ${partnerApiKey}`
    }
  });
  
  const status = await response.json();
  
  if (status.level >= 3) {
    // Credential verified - proceed with application
    processApplication(data);
  }
}
```

## TypeScript Support

Full TypeScript definitions included:

```typescript
import { createWidget, WidgetConfig, WidgetAPI } from '@vitalcv/widget';

const config: WidgetConfig = {
  containerId: 'widget',
  apiKey: 'your-key',
  onComplete: (data) => {
    // Type-safe data access
    console.log(data.claimId);
  }
};

const widget: WidgetAPI = createWidget(config);
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## CDN Usage

```html
<!-- UMD Bundle -->
<script src="https://cdn.vitalcv.com/widget/v0.1.0/vitalcv-widget.min.js"></script>

<script>
  window.VitalCVWidget.openWidget({
    containerId: 'widget',
    apiKey: 'your-key'
  });
</script>
```

## Development

### Local Development

```bash
npm install
npm run dev
```

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

## Migration Guide

### From v0.0.x to v0.1.0

No breaking changes in v0.1.0.

## Support

- **Documentation**: https://docs.vitalcv.com/widget
- **Issues**: https://github.com/vitalcv/widget/issues
- **Email**: support@vitalcv.com

## License

MIT © VitalCV

---

**Version:** 0.1.0  
**Last Updated:** 2024  
**Status:** Pilot Release
