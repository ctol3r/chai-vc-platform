import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { isValidNPI } from '../../utils/validateNpi';
import QRCode from 'qrcode';

/**
 * Credential detail page.
 *
 * This implementation demonstrates a "share only status" toggle for privacy-preserving
 * credential sharing, and includes NPI validation functionality.
 */
export default function CredentialDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [shareStatusOnly, setShareStatusOnly] = useState(false);
  const [shareOutput, setShareOutput] = useState<string | null>(null);
  const [npi, setNpi] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  
  const npiValid = npi ? isValidNPI(npi) : null;

  function generateStatusProof(vcId: string | string[] | undefined) {
    // Placeholder: real implementation would produce a cryptographic proof.
    return `Proof of status for VC ${vcId}`;
  }

  function generateFullVC(vcId: string | string[] | undefined) {
    // Placeholder representing the full credential payload with selective fields.
    const base: any = { id: vcId, type: 'VerifiableCredential', issuer: 'did:chai:issuer:demo', subject: 'did:chai:subject:demo' };
    const allFields: Record<string, any> = {
      name: 'Dr. Demo',
      npi: npi || '1234567893',
      specialty: 'Internal Medicine',
      license: 'MD-12345',
    };
    const subject: Record<string, any> = {};
    if (selectedFields.length === 0) {
      Object.assign(subject, allFields);
    } else {
      for (const key of selectedFields) subject[key] = allFields[key];
    }
    base.credentialSubject = subject;
    return JSON.stringify(base);
  }

  function handleShare() {
    const output = shareStatusOnly ? generateStatusProof(id) : generateFullVC(id);
    setShareOutput(output);
  }

  useEffect(() => {
    async function renderQr() {
      if (!canvasRef.current || !shareOutput) return;
      try {
        await QRCode.toCanvas(canvasRef.current, shareOutput, { width: 256 });
      } catch (e) {
        // silently ignore QR rendering errors
      }
    }
    renderQr();
  }, [shareOutput]);

  return (
    <div>
      <h1>Credential {id}</h1>
      
      {/* NPI Validation Section */}
      <div style={{ marginBottom: '20px' }}>
        <h2>NPI Validation</h2>
        <input
          type="text"
          value={npi}
          onChange={(e) => setNpi(e.target.value)}
          placeholder="Enter NPI"
        />
        {npiValid !== null && (
          <p>{npiValid ? 'NPI is valid' : 'NPI is invalid'}</p>
        )}
      </div>

      {/* Share Only Status Section */}
      <div>
        <h2>Share Credential</h2>
        <div style={{ marginBottom: 8 }}>
          <strong>Select fields (optional):</strong>
          <div>
            {['name','npi','specialty','license'].map((f) => (
              <label key={f} style={{ marginRight: 12 }}>
                <input
                  type="checkbox"
                  checked={selectedFields.includes(f)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedFields((prev) => [...prev, f]);
                    else setSelectedFields((prev) => prev.filter((x) => x !== f));
                  }}
                />{' '}
                {f}
              </label>
            ))}
          </div>
        </div>
        <label>
          <input
            type="checkbox"
            checked={shareStatusOnly}
            onChange={(e) => setShareStatusOnly(e.target.checked)}
          />
          Share only status
        </label>
        <br />
        <button onClick={handleShare}>Share</button>
        {shareOutput && (
          <div style={{ marginTop: '12px' }}>
            <pre data-testid="share-output" style={{ whiteSpace: 'pre-wrap' }}>{shareOutput}</pre>
            <p>Scan QR to share:</p>
            <canvas ref={canvasRef} />
          </div>
        )}
      </div>
    </div>
  );
}
