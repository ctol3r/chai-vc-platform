# Widget Integration Guide for Partners

## Quick Start

### 1. Get Your API Key

Contact VitalCV to receive your partner API key:
- Email: partners@vitalcv.com
- Include: Company name, domain, expected volume

### 2. Install Widget

**Option A: NPM (React/Vue/Angular)**

```bash
npm install @vitalcv/widget
```

**Option B: CDN (Plain JavaScript)**

```html
<script src="https://cdn.vitalcv.com/widget/v0.1.0/vitalcv-widget.min.js"></script>
```

### 3. Add to Your Page

```html
<div id="vitalcv-widget"></div>

<script>
  const widget = VitalCVWidget.createWidget({
    containerId: 'vitalcv-widget',
    apiKey: 'YOUR_API_KEY_HERE',
    onComplete: (data) => {
      console.log('Application submitted:', data.claimId);
      // Send to your backend for processing
    }
  });
  
  // Open when user clicks "Apply with VitalCV"
  document.getElementById('apply-btn').onclick = () => widget.open();
</script>
```

## Integration Steps

### Step 1: Whitelist Your Domain

Provide your domain(s) for CORS whitelisting:
- Production: `https://yourdomain.com`
- Staging: `https://staging.yourdomain.com`
- Development: `http://localhost:3000`

### Step 2: Configure CSP Headers

Add these Content Security Policy directives:

```html
<meta http-equiv="Content-Security-Policy" content="
  frame-src https://api.vitalcv.com https://cdn.vitalcv.com;
  connect-src https://api.vitalcv.com;
  img-src https://cdn.vitalcv.com data:;
">
```

### Step 3: Handle Completion Events

When a user completes credential verification:

```javascript
onComplete: async (data) => {
  // Verify the claim with VitalCV backend
  const response = await fetch('/your-backend/verify-claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      claimId: data.claimId,
      statusId: data.statusId,
      providerId: data.providerId,
    })
  });
  
  if (response.ok) {
    // Proceed with application
    redirectTo('/application/next-step');
  }
}
```

### Step 4: Backend Verification

Verify claims on your backend:

```javascript
// Node.js example
const axios = require('axios');

async function verifyVitalCVClaim(statusId, apiKey) {
  const response = await axios.get(
    `https://api.vitalcv.com/api/claim/status?statusId=${statusId}`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    }
  );
  
  const status = response.data;
  
  // Check verification level
  if (status.level >= 3) {
    // Level 3+ = Issuer attested
    return { verified: true, data: status };
  }
  
  return { verified: false, reason: 'Pending verification' };
}
```

## Advanced Configuration

### Custom Theming

```javascript
createWidget({
  containerId: 'widget',
  apiKey: 'YOUR_KEY',
  theme: {
    primaryColor: '#1e40af',  // Your brand color
    fontSize: '16px',
    borderRadius: '8px'
  }
});
```

### Event Handling

```javascript
createWidget({
  containerId: 'widget',
  apiKey: 'YOUR_KEY',
  
  onComplete: (data) => {
    console.log('✅ Claim completed:', data);
  },
  
  onError: (error) => {
    console.error('❌ Error:', error);
    // Show user-friendly error message
    alert(`Verification failed: ${error.message}`);
  },
  
  onClose: () => {
    console.log('Widget closed by user');
  }
});
```

## Security Best Practices

### 1. Validate on Backend

**Never trust client-side data alone.** Always verify claims with VitalCV API:

```javascript
// ❌ BAD - Don't trust client data
onComplete: (data) => {
  acceptApplication(data.providerId);
}

// ✅ GOOD - Verify with backend
onComplete: async (data) => {
  const verified = await yourBackend.verifyWithVitalCV(data.statusId);
  if (verified) {
    acceptApplication(data.providerId);
  }
}
```

### 2. Use HTTPS Only

Widget only works over HTTPS in production. Development allows HTTP for `localhost`.

### 3. Rotate API Keys

Rotate your API keys periodically:
- Monthly rotation recommended
- Immediately rotate if compromised
- Contact support@vitalcv.com for key rotation

### 4. Monitor Failed Verifications

Track failed verifications in your analytics to detect potential abuse.

## Troubleshooting

### Widget Not Loading

**Problem:** Blank iframe or loading spinner

**Solutions:**
- Check CSP headers allow `frame-src https://api.vitalcv.com`
- Verify API key is valid
- Check browser console for errors
- Ensure container element exists: `document.getElementById('vitalcv-widget')`

### postMessage Not Received

**Problem:** `onComplete` callback not firing

**Solutions:**
- Verify `allowedOrigins` includes your domain
- Check browser console for origin warnings
- Ensure event listener is attached before widget opens

### CORS Errors

**Problem:** API calls blocked by CORS

**Solutions:**
- Contact VitalCV to whitelist your domain
- Verify domain matches exactly (including protocol and port)
- Check for typos in domain configuration

### Verification Fails

**Problem:** Backend verification returns invalid

**Solutions:**
- Wait for `status.level >= 3` before accepting
- Check `statusId` is being sent correctly
- Verify your backend API key is correct
- Check VitalCV service status

## Testing

### Test Mode

Use test API key for development:

```javascript
createWidget({
  containerId: 'widget',
  apiKey: 'test_key_123',  // Test key - won't issue real credentials
  apiUrl: 'https://staging.api.vitalcv.com'
});
```

### Test NPIs

Use these test NPIs for development:
- `1234567893` - Valid test provider
- `9876543210` - Valid test organization
- `0000000000` - Invalid (will fail validation)

### Sample Completion Data

```json
{
  "claimId": "550e8400-e29b-41d4-a716-446655440000",
  "statusId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "providerId": "1234567893"
}
```

## Examples

### Job Application Flow

```javascript
// 1. Add widget to job application page
<button id="apply-with-vitalcv">Apply with VitalCV</button>
<div id="widget-container"></div>

<script>
const widget = VitalCVWidget.createWidget({
  containerId: 'widget-container',
  apiKey: 'YOUR_KEY',
  onComplete: async (data) => {
    // Verify credential
    const verification = await fetch('/api/verify-credential', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    if (verification.ok) {
      // Pre-fill application with verified data
      window.location = '/application/step2?verified=true';
    }
  }
});

document.getElementById('apply-with-vitalcv')
  .addEventListener('click', () => widget.open());
</script>
```

### Credentialing Portal

```javascript
// Pre-fill from existing provider data
const widget = VitalCVWidget.createWidget({
  containerId: 'widget',
  apiKey: 'YOUR_KEY',
  onComplete: async (data) => {
    // Update credentialing file
    await updateCredentialingRecord({
      providerId: data.providerId,
      verificationDate: new Date(),
      verificationSource: 'VitalCV',
      claimId: data.claimId
    });
    
    // Mark PSV as complete
    markPSVComplete(data.providerId);
  }
});
```

## Analytics

Track widget usage:

```javascript
createWidget({
  containerId: 'widget',
  apiKey: 'YOUR_KEY',
  onComplete: (data) => {
    // Track conversion
    analytics.track('VitalCV Application Complete', {
      claimId: data.claimId,
      jobId: currentJobId
    });
  },
  onError: (error) => {
    // Track errors
    analytics.track('VitalCV Application Failed', {
      errorCode: error.code,
      errorMessage: error.message
    });
  }
});
```

## Partner Dashboard

Monitor widget performance:
- **URL**: https://partners.vitalcv.com/dashboard
- **Metrics**: Conversions, completion rate, average time
- **Alerts**: Failed verifications, API errors

## Support

### Documentation
- API Reference: https://docs.vitalcv.com/api
- Widget Docs: https://docs.vitalcv.com/widget
- Integration FAQ: https://docs.vitalcv.com/faq

### Contact
- **Technical Support**: support@vitalcv.com
- **Partner Success**: partners@vitalcv.com
- **Incidents**: incident@vitalcv.com (24/7)

### SLA
- **Uptime**: 99.9% monthly
- **Support Response**: <2 hours for critical issues
- **Maintenance Windows**: Weekends, 2am-4am PST (notified 48h in advance)

## Migration & Updates

Widget follows semantic versioning. Breaking changes only in major versions.

### Stay Updated

Subscribe to updates:
- Email: partners-updates@vitalcv.com
- Slack: #vitalcv-partners
- RSS: https://status.vitalcv.com/feed

---

**Questions?** Contact partners@vitalcv.com

**Version:** 0.1.0  
**Last Updated:** 2024
