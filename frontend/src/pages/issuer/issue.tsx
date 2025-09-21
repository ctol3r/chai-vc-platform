import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import IssuerForm, { IssuerFormValues } from "@/components/IssuerForm";
import {
  ISSUE_CREDENTIAL_MUTATION,
  IssueCredentialResult,
  IssueCredentialVariables,
} from "@/graphql/mutations/issueCredential";
import { useVault } from "@/hooks/useVault";

const encodePayload = (payload: Record<string, unknown>) => JSON.stringify(payload, Object.keys(payload).sort());

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  const { createHash } = await import("crypto");
  return "0x" + createHash("sha256").update(data).digest("hex");
}

function parseCredentialId(value: string): number {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error("Credential ID must be a number");
  }
  return parsed;
}

function IssueCredentialPage() {
  const [issueCredential, { loading }] = useMutation<IssueCredentialResult, IssueCredentialVariables>(
    ISSUE_CREDENTIAL_MUTATION
  );
  const { encrypt } = useVault();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    chainTxId?: string | null;
    chainStatus?: string | null;
    proofToken?: string | null;
    vaultCiphertext?: string;
    vaultIv?: string;
  } | null>(null);

  const handleSubmit = async (values: IssuerFormValues) => {
    setError(null);
    setResult(null);
    try {
      const payload = {
        account: values.account.trim(),
        clinicianName: values.clinicianName.trim(),
        licenseNumber: values.licenseNumber.trim(),
        issuedAt: new Date().toISOString(),
      };
      const hash = await sha256Hex(encodePayload(payload));
      const variables: IssueCredentialVariables = {
        id: parseCredentialId(values.credentialId),
        hash,
        shareStatusOnly: values.shareStatusOnly,
      };

      const encrypted = await encrypt(payload);
      const { data } = await issueCredential({ variables });
      if (!data?.issueCredential) {
        throw new Error("No mutation response received");
      }
      setResult({
        ...data.issueCredential,
        vaultCiphertext: encrypted.ciphertext,
        vaultIv: encrypted.iv,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  return (
    <IssuerForm onSubmit={handleSubmit} submitting={loading} result={result} error={error} />
  );
}

export default IssueCredentialPage;
