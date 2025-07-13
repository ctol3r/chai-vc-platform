import React, { useState } from 'react';
import QRCode from 'qrcode.react';

/**
 * Minimal demo component showing how a wallet could share a
 * W3C Verifiable Presentation through a QR code. The presentation
 * is constructed in-memory for demonstration purposes.
 */
export default function ShareWallet() {
  const [vp, setVp] = useState<string | null>(null);

  function generatePresentation() {
    // Example credential; in a real wallet this would be pulled from storage
    const credential = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential'],
      issuer: 'did:example:issuer',
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: 'did:example:holder',
        claim: 'demo credential',
      },
    };

    const presentation = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: [credential],
      holder: 'did:example:holder',
    };

    setVp(JSON.stringify(presentation));
  }

  return (
    <div>
      <h1>Share Verifiable Presentation</h1>
      <button onClick={generatePresentation}>Generate Presentation</button>
      {vp && <QRCode value={vp} />}
    </div>
  );
}
