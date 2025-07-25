import { useState } from 'react';
import { useRouter } from 'next/router';

/**
 * Credential detail page.
 *
 * This minimalist implementation demonstrates a "share only status" toggle.
 * When enabled, the user shares a proof of credential status instead of the
 * entire verifiable credential (VC).
 */
export default function CredentialDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [shareStatusOnly, setShareStatusOnly] = useState(false);
  const [shareOutput, setShareOutput] = useState<string | null>(null);

  function generateStatusProof(vcId: string | string[] | undefined) {
    // Placeholder: real implementation would produce a cryptographic proof.
    return `Proof of status for VC ${vcId}`;
  }

  function generateFullVC(vcId: string | string[] | undefined) {
    // Placeholder representing the full credential payload.
    return `Full VC data for ${vcId}`;
  }

  function handleShare() {
    const output = shareStatusOnly ? generateStatusProof(id) : generateFullVC(id);
    setShareOutput(output);
  }

  return (
    <div>
      <h1>Credential {id}</h1>
      <label>
        <input
          type="checkbox"
          checked={shareStatusOnly}
          onChange={(e) => setShareStatusOnly(e.target.checked)}
        />
        Share only status
      </label>
      <button onClick={handleShare}>Share</button>
      {shareOutput && (
        <pre data-testid="share-output">{shareOutput}</pre>
      )}
    </div>
  );
}
