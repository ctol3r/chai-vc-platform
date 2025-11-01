/**
 * VitalCV Widget - Embeddable credential verification widget
 * @packageDocumentation
 */

export interface WidgetConfig {
  /** API endpoint URL */
  apiUrl: string;
  /** Allowed origins for postMessage */
  allowedOrigins?: string[];
  /** Widget container element ID */
  containerId?: string;
  /** Widget mode: 'modal' | 'inline' */
  mode?: 'modal' | 'inline';
  /** Brand customization */
  branding?: {
    primaryColor?: string;
    logo?: string;
    fontFamily?: string;
  };
  /** Callback handlers */
  onComplete?: (data: WidgetResult) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

export interface WidgetResult {
  claimId: string;
  statusId: string;
  proof?: string;
}

export interface WidgetMessage {
  type: 'widget:ready' | 'widget:complete' | 'widget:error' | 'widget:close';
  payload?: any;
}

/**
 * VitalCV Widget Class
 */
export class VitalCVWidget {
  private config: WidgetConfig;
  private iframe?: HTMLIFrameElement;
  private container?: HTMLElement;
  private token?: string;

  constructor(config: WidgetConfig) {
    this.config = {
      mode: 'modal',
      allowedOrigins: ['https://vitalcv.com'],
      ...config,
    };

    this.setupMessageListener();
  }

  /**
   * Open the widget
   */
  async open(): Promise<void> {
    try {
      // Request embed token from backend
      const response = await fetch(`${this.config.apiUrl}/api/widget/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: window.location.origin,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to obtain widget token');
      }

      const data = await response.json();
      this.token = data.token;

      // Create iframe
      this.createIframe();
    } catch (err) {
      if (this.config.onError) {
        this.config.onError(err as Error);
      }
      throw err;
    }
  }

  /**
   * Close the widget
   */
  close(): void {
    if (this.iframe && this.iframe.parentNode) {
      this.iframe.parentNode.removeChild(this.iframe);
    }

    if (this.container && this.container.parentNode && this.config.mode === 'modal') {
      this.container.parentNode.removeChild(this.container);
    }

    this.iframe = undefined;
    this.container = undefined;

    if (this.config.onClose) {
      this.config.onClose();
    }
  }

  /**
   * Create iframe element
   */
  private createIframe(): void {
    const widgetUrl = `${this.config.apiUrl}/widget?token=${this.token}`;

    // Create container for modal mode
    if (this.config.mode === 'modal') {
      this.container = document.createElement('div');
      this.container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      document.body.appendChild(this.container);
    }

    // Create iframe
    this.iframe = document.createElement('iframe');
    this.iframe.src = widgetUrl;
    this.iframe.style.cssText = this.config.mode === 'modal'
      ? 'width: 90%; max-width: 600px; height: 80%; border: none; border-radius: 8px; background: white;'
      : 'width: 100%; height: 600px; border: 1px solid #e5e7eb; border-radius: 8px;';
    
    this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');

    // Append to container or specified element
    const targetElement = this.config.mode === 'modal'
      ? this.container!
      : document.getElementById(this.config.containerId || 'vitalcv-widget');

    if (targetElement) {
      targetElement.appendChild(this.iframe);
    }
  }

  /**
   * Setup postMessage listener
   */
  private setupMessageListener(): void {
    window.addEventListener('message', (event) => {
      // Verify origin
      const allowedOrigins = this.config.allowedOrigins || [];
      const apiOrigin = new URL(this.config.apiUrl).origin;
      
      if (!allowedOrigins.includes(event.origin) && event.origin !== apiOrigin) {
        console.warn('VitalCV Widget: Message from unauthorized origin:', event.origin);
        return;
      }

      const message = event.data as WidgetMessage;

      switch (message.type) {
        case 'widget:complete':
          if (this.config.onComplete) {
            this.config.onComplete(message.payload);
          }
          this.close();
          break;

        case 'widget:error':
          if (this.config.onError) {
            this.config.onError(new Error(message.payload?.error || 'Widget error'));
          }
          break;

        case 'widget:close':
          this.close();
          break;

        case 'widget:ready':
          console.log('VitalCV Widget ready');
          break;

        default:
          console.warn('VitalCV Widget: Unknown message type:', message.type);
      }
    });
  }
}

/**
 * Initialize VitalCV Widget
 */
export function initWidget(config: WidgetConfig): VitalCVWidget {
  return new VitalCVWidget(config);
}

// Default export
export default { VitalCVWidget, initWidget };
