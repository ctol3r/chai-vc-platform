import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
  VERIFY_STATUS_PROOF,
  VerifyStatusProofResponse,
  VerifyStatusProofVariables,
} from "@/graphql/queries/verifyProof";

const boxStyle: React.CSSProperties = {
  maxWidth: 520,
  margin: "0 auto",
  padding: 24,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 160,
  padding: 12,
  fontFamily: "monospace",
};

const cardStyle = (background: string): React.CSSProperties => ({
  background,
  padding: 16,
  borderRadius: 8,
  color: "#1f2933",
});

const parsePresentation = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error("Presentation must be valid JSON");
  }
};

export default function VerifyStatusPage() {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ valid: boolean; reason?: string | null } | null>(null);

  const [verifyProof, { loading }] = useMutation<VerifyStatusProofResponse, VerifyStatusProofVariables>(
    VERIFY_STATUS_PROOF
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    try {
      parsePresentation(token);
      const { data } = await verifyProof({ variables: { presentation: token } });
      if (!data?.verifyStatusProof) {
        throw new Error("No verification response received");
      }
      setResult(data.verifyStatusProof);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  return (
    <div style={boxStyle}>
      <h1>Status Proof Verification</h1>
      <p>Paste a status-only presentation token. The verifier will confirm whether the credential is still valid.</p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label htmlFor="proofToken">
          Presentation (JSON)
          <textarea
            id="proofToken"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder='{"hash":"0x..."}'
            required
            style={textareaStyle}
          />
        </label>
        <button type="submit" disabled={loading} style={{ alignSelf: "flex-start", padding: "8px 16px" }}>
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>

      {error && (
        <div style={cardStyle("#fdecea")}>Error verifying proof: {error}</div>
      )}

      {result && (
        <div style={cardStyle(result.valid ? "#e3fcec" : "#fff4e5")}>
          <strong>{result.valid ? "Credential Verified" : "Verification Failed"}</strong>
          {result.reason && <p>{result.reason}</p>}
        </div>
      )}
    </div>
  );
}
