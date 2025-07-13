import React, { useState } from 'react';
import QRCode from 'react-qr-code';

interface ShareProfileButtonProps {
  /**
   * URL to encode in the QR code.
   */
  profileUrl: string;
}

/**
 * Renders a button that toggles a QR code containing the user's profile URL.
 * This is a stub component intended for demonstration.
 */
const ShareProfileButton: React.FC<ShareProfileButtonProps> = ({ profileUrl }) => {
  const [showQR, setShowQR] = useState(false);

  return (
    <div>
      <button onClick={() => setShowQR(!showQR)}>
        Share My Profile
      </button>
      {showQR && (
        <div style={{ marginTop: '1rem' }}>
          <QRCode value={profileUrl} size={128} />
        </div>
      )}
    </div>
  );
};

export default ShareProfileButton;
