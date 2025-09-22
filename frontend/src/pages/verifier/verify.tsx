import { FormEvent, useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client/react";
import {
  VERIFY_PROOF,
  VerifyProofResponse,
  VerifyProofVariables,
} from "@/graphql/queries/verifyProof";
import useVault from "@/hooks/useVault";

export default function VerifyProofPage() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState<{ valid: boolean; reason?: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { get: loadLatestToken, set: rememberToken } = useVault(
    "latest-status-proof"
  );

  const [verifyProof, { loading }] = useLazyQuery<
    VerifyProofResponse,
    VerifyProofVariables
  >(VERIFY_PROOF, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    let active = true;
    loadLatestToken()
      .then((stored) => {
        if (stored && active) {
          setToken(stored);
        }
      })
      .catch(() => {
        /* swallow vault read errors */
      });
    return () => {
      active = false;
    };
  }, [loadLatestToken]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult(null);
    setError(null);

    try {
      const trimmed = token.trim();
      if (!trimmed) {
        throw new Error("Proof token is required");
      }

      if (trimmed.length < 12) {
        throw new Error("Proof token appears too short to be valid");
      }

      const response = await verifyProof({
        variables: { presentationToken: trimmed },
      });

      if (response.error) {
        throw response.error;
      }

      if (!response.data?.verifyProof) {
        throw new Error("No verification response received");
      }

      setResult(response.data.verifyProof);
      await rememberToken(trimmed);
    } catch (err) {
      if (err && typeof err === "object" && "message" in err) {
        setError(String((err as { message?: unknown }).message ?? ""));
        return;
      }
      setError(String(err));
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "2rem" }}>
      {/* TODO: replace inline styles with shared verification layout components. */}
      <h1>Verify Status Proof</h1>
      <p>Paste a proof token to confirm whether the underlying credential is still active.</p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
        <label style={{ display: "grid", gap: "0.5rem" }}>
          Proof Token
          <textarea
            value={token}
            onChange={(event) => setToken(event.target.value)}
            rows={6}
            placeholder="MOCK-PROOF-XXXX"
            style={{ padding: "0.5rem", fontFamily: "monospace" }}
            required
          />
        </label>

        <button type="submit" disabled={loading} style={{ padding: "0.75rem", width: "fit-content" }}>
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#fee2e2", color: "#991b1b" }}>
          <strong>Verification failed:</strong> {error}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            background: result.valid ? "#ecfdf5" : "#fff4e5",
            borderRadius: "0.75rem",
          }}
        >
          <h2>{result.valid ? "Proof valid" : "Proof rejected"}</h2>
          {result.reason && <p>{result.reason}</p>}
        </div>
      )}
    </div>
  );
}
