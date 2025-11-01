/**
 * @vitalcv/widget
 * Embeddable widget for VitalCV credential verification
 */

export interface WidgetConfig {
  /** Target container element ID */
  containerId: string;
  
  /** Partner API key */
  apiKey: string;
  
  /** Backend API URL */
  apiUrl?: string;
  
  /** Allowed origins for postMessage */
  allowedOrigins?: string[];
  
  /** Theme customization */
  theme?: {
    primaryColor?: string;
    fontSize?: string;
    borderRadius?: string;
  };
  
  /** Event handlers */
  onComplete?: (data: WidgetCompleteData) => void;
  onError?: (error: WidgetError) => void;
  onClose?: () => void;
}

export interface WidgetCompleteData {
  claimId: string;
  statusId: string;
  providerId: string;
  sdJWT?: string;
  disclosedClaims?: string[];
}

export interface WidgetError {
  code: string;
  message: string;
  details?: any;
}

export interface WidgetAPI {
  open: () => void;
  close: () => void;
  destroy: () => void;
}

/**
 * Initialize VitalCV widget
 */
export function createWidget(config: WidgetConfig): WidgetAPI {
  const {
    containerId,
    apiKey,
    apiUrl = 'https://api.vitalcv.com',
    allowedOrigins = [],
    theme = {},
    onComplete,
    onError,
    onClose,
  } = config;

  let iframe: HTMLIFrameElement | null = null;
  let container: HTMLElement | null = null;

  // Validate container exists
  container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container element #${containerId} not found`);
  }

  /**
   * Create iframe
   */
  function createIframe(): HTMLIFrameElement {
    const frame = document.createElement('iframe');
    frame.style.width = '100%';
    frame.style.height = '600px';
    frame.style.border = 'none';
    frame.style.borderRadius = theme.borderRadius || '8px';
    
    // Sandbox attributes for security
    frame.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups');
    
    // Build widget URL with params
    const params = new URLSearchParams({
      apiKey,
      theme: JSON.stringify(theme),
      origin: window.location.origin,
    });
    
    frame.src = `${apiUrl}/widget?${params.toString()}`;
    
    return frame;
  }

  /**
   * Handle postMessage from widget
   */
  function handleMessage(event: MessageEvent) {
    // Verify origin
    const isAllowedOrigin =
      event.origin === apiUrl ||
      allowedOrigins.includes(event.origin);

    if (!isAllowedOrigin) {
      console.warn('Blocked message from untrusted origin:', event.origin);
      return;
    }

    const { type, data } = event.data;

    switch (type) {
      case 'widget:complete':
        if (onComplete) {
          onComplete(data as WidgetCompleteData);
        }
        break;

      case 'widget:error':
        if (onError) {
          onError(data as WidgetError);
        }
        break;

      case 'widget:close':
        close();
        if (onClose) {
          onClose();
        }
        break;

      case 'widget:ready':
        // Widget loaded successfully
        console.log('VitalCV widget ready');
        break;

      default:
        console.warn('Unknown widget message type:', type);
    }
  }

  /**
   * Open widget
   */
  function open() {
    if (!container) {
      throw new Error('Container not found');
    }

    if (iframe) {
      return; // Already open
    }

    iframe = createIframe();
    container.appendChild(iframe);

    // Listen for postMessage events
    window.addEventListener('message', handleMessage);
  }

  /**
   * Close widget
   */
  function close() {
    if (iframe && container) {
      container.removeChild(iframe);
      iframe = null;
    }

    window.removeEventListener('message', handleMessage);
  }

  /**
   * Destroy widget and cleanup
   */
  function destroy() {
    close();
    container = null;
  }

  // Return API
  return {
    open,
    close,
    destroy,
  };
}

/**
 * Create widget and auto-open
 */
export function openWidget(config: WidgetConfig): WidgetAPI {
  const widget = createWidget(config);
  widget.open();
  return widget;
}

// Default export
export default {
  createWidget,
  openWidget,
};
