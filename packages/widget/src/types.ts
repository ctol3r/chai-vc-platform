/**
 * TypeScript type definitions for VitalCV Widget
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
  branding?: WidgetBranding;
  /** Callback handlers */
  onComplete?: (data: WidgetResult) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

export interface WidgetBranding {
  /** Primary brand color (hex) */
  primaryColor?: string;
  /** Logo URL */
  logo?: string;
  /** Font family */
  fontFamily?: string;
  /** Button border radius */
  borderRadius?: string;
}

export interface WidgetResult {
  /** Claim ID */
  claimId: string;
  /** Status ID for tracking */
  statusId: string;
  /** Optional proof token */
  proof?: string;
  /** Provider NPI */
  npi?: string;
}

export interface WidgetMessage {
  type: 'widget:ready' | 'widget:complete' | 'widget:error' | 'widget:close' | 'widget:resize';
  payload?: any;
}

export interface WidgetTokenRequest {
  /** Origin of the embedding site */
  origin: string;
  /** Optional partner ID */
  partnerId?: string;
}

export interface WidgetTokenResponse {
  /** Short-lived embed token */
  token: string;
  /** Token expiration time (Unix timestamp) */
  expiresAt: number;
  /** Widget URL to embed */
  widgetUrl: string;
}

/**
 * Widget instance interface
 */
export interface IVitalCVWidget {
  /** Open the widget */
  open(): Promise<void>;
  /** Close the widget */
  close(): void;
  /** Send message to widget */
  postMessage(message: WidgetMessage): void;
}
