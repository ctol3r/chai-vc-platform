import { FormEvent, useState } from "react";

export type IssuerFormValues = {
  credentialId: string;
  account: string;
  clinicianName: string;
  licenseNumber: string;
  shareStatusOnly: boolean;
};

export type IssuerFormProps = {
  onSubmit: (values: IssuerFormValues) => Promise<void>;
  submitting?: boolean;
  result?: {
    chainTxId?: string | null;
    chainStatus?: string | null;
    proofToken?: string | null;
    vaultCiphertext?: string;
    vaultIv?: string;
  } | null;
  error?: string | null;
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  marginBottom: 16,
};

const inputStyle: React.CSSProperties = {
  padding: 8,
  fontSize: 14,
};

const sectionStyle: React.CSSProperties = {
  background: "#f7f7f9",
  padding: 16,
  borderRadius: 8,
  marginTop: 16,
};

export function IssuerForm({ onSubmit, submitting = false, result, error }: IssuerFormProps) {
  const [values, setValues] = useState<IssuerFormValues>({
    credentialId: "",
    account: "",
    clinicianName: "",
    licenseNumber: "",
    shareStatusOnly: true,
  });

  const handleChange = (key: keyof IssuerFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = key === "shareStatusOnly" ? e.target.checked : e.target.value;
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 24 }}>
      <h1>Issue License Credential</h1>
      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label htmlFor="credentialId">Credential ID</label>
          <input
            id="credentialId"
            name="credentialId"
            value={values.credentialId}
            onChange={handleChange("credentialId")}
            placeholder="Numeric credential ID"
            required
            style={inputStyle}
          />
        </div>
        <div style={fieldStyle}>
          <label htmlFor="account">Clinician Account (SS58)</label>
          <input
            id="account"
            name="account"
            value={values.account}
            onChange={handleChange("account")}
            placeholder="5G..."
            required
            style={inputStyle}
          />
        </div>
        <div style={fieldStyle}>
          <label htmlFor="clinicianName">Clinician Name</label>
          <input
            id="clinicianName"
            name="clinicianName"
            value={values.clinicianName}
            onChange={handleChange("clinicianName")}
            placeholder="Dr. Ada Lovelace"
            required
            style={inputStyle}
          />
        </div>
        <div style={fieldStyle}>
          <label htmlFor="licenseNumber">License Number</label>
          <input
            id="licenseNumber"
            name="licenseNumber"
            value={values.licenseNumber}
            onChange={handleChange("licenseNumber")}
            placeholder="LIC-123456"
            required
            style={inputStyle}
          />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <input
            type="checkbox"
            checked={values.shareStatusOnly}
            onChange={handleChange("shareStatusOnly")}
          />
          Share status-only proof with verifier
        </label>
        <button type="submit" disabled={submitting} style={{ padding: "8px 16px" }}>
          {submitting ? "Issuing..." : "Issue Credential"}
        </button>
      </form>

      {error && (
        <div style={{ ...sectionStyle, background: "#fdecea", color: "#b71c1c" }}>
          <strong>Issuance failed:</strong>
          <div>{error}</div>
        </div>
      )}

      {result && (
        <div style={sectionStyle}>
          <h2>Chain Receipt</h2>
          <p>
            <strong>Transaction Hash:</strong> {result.chainTxId ?? 'pending'}
          </p>
          <p>
            <strong>Status:</strong> {result.chainStatus ?? 'unknown'}
          </p>
          {result.proofToken && (
            <p>
              <strong>Proof Token:</strong> {result.proofToken}
            </p>
          )}
          {result.vaultCiphertext && (
            <details>
              <summary>Encrypted payload</summary>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
{`ciphertext: ${result.vaultCiphertext}
iv: ${result.vaultIv ?? 'n/a'}`}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

export default IssuerForm;
