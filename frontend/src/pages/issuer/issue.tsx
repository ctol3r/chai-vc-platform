import { FormEvent, useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
  ISSUE_CREDENTIAL,
  IssueCredentialResponse,
  IssueCredentialVariables,
} from "@/graphql/mutations/issueCredential";
import useVault from "@/hooks/useVault";

type SubmissionState = {
  id?: string | null;
  chainTxId?: string | null;
  chainStatus?: string | null;
  proofToken?: string | null;
};

export default function IssueCredentialPage() {
  const [account, setAccount] = useState("");
  const [payload, setPayload] = useState("{}\n");
  const [shareStatusOnly, setShareStatusOnly] = useState(true);
  const [result, setResult] = useState<SubmissionState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { set: storeProofToken, clear: clearProofToken } = useVault(
    "latest-status-proof"
  );

  const [issueCredential, { loading }] = useMutation<
    IssueCredentialResponse,
    IssueCredentialVariables
  >(ISSUE_CREDENTIAL);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    try {
      const trimmedAccount = account.trim();
      if (!trimmedAccount) {
        throw new Error("Account is required");
      }

      if (trimmedAccount.length < 10) {
        throw new Error("Account must be a valid SS58 address");
      }

      const trimmedPayload = payload.trim();
      if (!trimmedPayload) {
        throw new Error("Credential payload is required");
      }

      if (/^[\[{]/.test(trimmedPayload)) {
        try {
          JSON.parse(trimmedPayload);
        } catch {
          throw new Error("Payload must be valid JSON when using structured data");
        }
      }

      const { data } = await issueCredential({
        variables: {
          input: {
            subjectAccount: trimmedAccount,
            payload: trimmedPayload,
            shareStatusOnly,
          },
        },
      });

      if (!data?.issueCredential) {
        throw new Error("No response from server");
      }

      setResult(data.issueCredential);

      if (shareStatusOnly && data.issueCredential.proofToken) {
        await storeProofToken(data.issueCredential.proofToken);
      }

      if (!shareStatusOnly) {
        clearProofToken();
      }
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
      {/* TODO: replace inline styles and inputs with shared design system components. */}
      <h1>Issue Credential</h1>
      <p>Submit a credential payload for a clinician account. Optionally generate a status-only proof token to share with verifiers.</p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
        <label style={{ display: "grid", gap: "0.5rem" }}>
          Clinician Account (SS58)
          <input
            value={account}
            onChange={(event) => setAccount(event.target.value)}
            placeholder="5F..."
            required
            style={{ padding: "0.5rem" }}
          />
        </label>

        <label style={{ display: "grid", gap: "0.5rem" }}>
          Credential Payload (JSON string or encoded text)
          <textarea
            value={payload}
            onChange={(event) => setPayload(event.target.value)}
            rows={8}
            style={{ padding: "0.5rem", fontFamily: "monospace" }}
          />
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="checkbox"
            checked={shareStatusOnly}
            onChange={(event) => setShareStatusOnly(event.target.checked)}
          />
          Share status-only proof token with verifier
        </label>

        <button type="submit" disabled={loading} style={{ padding: "0.75rem", width: "fit-content" }}>
          {loading ? "Issuing..." : "Issue Credential"}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#fee2e2", color: "#991b1b" }}>
          <strong>Issuance failed:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#ecfdf5", borderRadius: "0.75rem" }}>
          <h2>Chain Receipt</h2>
          {result.id && (
            <p>
              <strong>Credential ID:</strong> {result.id}
            </p>
          )}
          <p>
            <strong>Transaction Hash:</strong> {result.chainTxId ?? "pending"}
          </p>
          <p>
            <strong>Status:</strong> {result.chainStatus ?? "unknown"}
          </p>
          {result.proofToken && (
            <p>
              <strong>Proof Token:</strong> {result.proofToken}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
