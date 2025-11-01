'use client';

import React, { useState, useEffect } from 'react';
import Card from '../../../components/Card';

interface CredentialTemplate {
  id: string;
  name: string;
  credDefId: string;
  requiredAttributes: string[];
}

interface Provider {
  npi: string;
  name: string;
  license_state?: string;
}

export default function IssuerIssuePage() {
  const [step, setStep] = useState(1);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [templates, setTemplates] = useState<CredentialTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CredentialTemplate | null>(null);
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [evidence, setEvidence] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  // Load credential templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/issuer/credential-definitions');
      if (response.ok) {
        const data = await response.json();
        // Map credential definitions to templates
        const templateList: CredentialTemplate[] = (data.credentialDefinitions || []).map((def: any) => ({
          id: def.credDefId,
          name: def.tag || 'Medical License',
          credDefId: def.credDefId,
          requiredAttributes: ['name', 'npi', 'license_number', 'license_state'],
        }));
        
        setTemplates(templateList);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const searchProvider = async (npi: string) => {
    if (!npi || npi.length < 10) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/npi/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npi }),
      });

      if (!response.ok) {
        throw new Error('Provider not found');
      }

      const data = await response.json();
      const provider: Provider = {
        npi: data.npi,
        name: data.name,
        license_state: data.provider?.addresses?.[0]?.state || 'Unknown',
      };

      setSelectedProvider(provider);
      setProviders([provider]);
      
      // Auto-populate some attributes
      setAttributes({
        name: provider.name || '',
        npi: provider.npi,
        license_state: provider.license_state || '',
      });

      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to find provider');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: CredentialTemplate) => {
    setSelectedTemplate(template);
    setStep(3);
  };

  const handleAttributeChange = (key: string, value: string) => {
    setAttributes((prev) => ({ ...prev, [key]: value }));
  };

  const handleEvidenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEvidence(Array.from(e.target.files));
    }
  };

  const handlePreview = () => {
    setStep(4);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Convert attributes to array format
      const attributeArray = Object.entries(attributes).map(([name, value]) => ({
        name,
        value,
      }));

      const response = await fetch('/api/issuer/attest-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId: 'default-connection', // TODO: Real connection management
          credDefId: selectedTemplate?.credDefId,
          template: selectedTemplate?.name,
          attributes: attributeArray,
          issuerId: 'issuer-admin', // TODO: Get from auth
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit issuance request');
      }

      const data = await response.json();
      setRequestId(data.requestId);
      setStep(5);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Issue Verifiable Credential</h1>

      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#991b1b',
          }}
        >
          {error}
        </div>
      )}

      {/* Step 1: Select Provider */}
      {step === 1 && (
        <Card title="Step 1: Select Provider">
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="npi">Search by NPI</label>
            <input
              id="npi"
              type="text"
              placeholder="Enter 10-digit NPI"
              maxLength={10}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginTop: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  searchProvider((e.target as HTMLInputElement).value);
                }
              }}
            />
          </div>
          <button
            onClick={() => {
              const input = document.getElementById('npi') as HTMLInputElement;
              searchProvider(input.value);
            }}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Searching...' : 'Search Provider'}
          </button>
        </Card>
      )}

      {/* Step 2: Select Template */}
      {step === 2 && selectedProvider && (
        <Card title="Step 2: Select Credential Template">
          <div style={{ marginBottom: '1.5rem' }}>
            <strong>Selected Provider:</strong>
            <div style={{ marginTop: '0.5rem', color: '#6b7280' }}>
              {selectedProvider.name} (NPI: {selectedProvider.npi})
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                style={{
                  padding: '1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{template.name}</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                  Required: {template.requiredAttributes.join(', ')}
                </p>
              </div>
            ))}

            {templates.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                No credential templates available. Check ACA-Py configuration.
              </div>
            )}
          </div>

          <button
            onClick={() => setStep(1)}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
          >
            Back
          </button>
        </Card>
      )}

      {/* Step 3: Enter Attributes */}
      {step === 3 && selectedTemplate && (
        <Card title={`Step 3: Enter Attributes - ${selectedTemplate.name}`}>
          <div style={{ marginBottom: '1.5rem' }}>
            {selectedTemplate.requiredAttributes.map((attr) => (
              <div key={attr} style={{ marginBottom: '1rem' }}>
                <label htmlFor={attr}>
                  {attr.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </label>
                <input
                  id={attr}
                  type="text"
                  value={attributes[attr] || ''}
                  onChange={(e) => handleAttributeChange(attr, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    marginTop: '0.25rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="evidence">Attach Evidence (Optional)</label>
            <input
              id="evidence"
              type="file"
              multiple
              onChange={handleEvidenceUpload}
              style={{ width: '100%', marginTop: '0.5rem' }}
            />
            {evidence.length > 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                {evidence.length} file(s) selected
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setStep(2)}>Back</button>
            <button
              onClick={handlePreview}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              Preview
            </button>
          </div>
        </Card>
      )}

      {/* Step 4: Preview */}
      {step === 4 && (
        <Card title="Step 4: Preview & Confirm">
          <div style={{ marginBottom: '1.5rem' }}>
            <h3>Provider</h3>
            <p>{selectedProvider?.name} (NPI: {selectedProvider?.npi})</p>

            <h3>Template</h3>
            <p>{selectedTemplate?.name}</p>

            <h3>Attributes</h3>
            <ul>
              {Object.entries(attributes).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {value}
                </li>
              ))}
            </ul>

            {evidence.length > 0 && (
              <>
                <h3>Evidence</h3>
                <ul>
                  {evidence.map((file, idx) => (
                    <li key={idx}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setStep(3)}>Back</button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Submitting...' : 'Issue Credential'}
            </button>
          </div>
        </Card>
      )}

      {/* Step 5: Success */}
      {step === 5 && requestId && (
        <Card title="✅ Credential Issuance Requested">
          <div style={{ marginBottom: '1.5rem' }}>
            <p>Your credential issuance request has been submitted and is being processed.</p>
            <div
              style={{
                backgroundColor: '#f3f4f6',
                padding: '1rem',
                borderRadius: '4px',
                marginTop: '1rem',
              }}
            >
              <strong>Request ID:</strong> <code>{requestId}</code>
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
              The credential will be issued via ACA-Py and delivered to the provider's wallet.
              You can check the status at any time.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => {
                setStep(1);
                setSelectedProvider(null);
                setSelectedTemplate(null);
                setAttributes({});
                setEvidence([]);
                setRequestId(null);
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              Issue Another Credential
            </button>
            <button
              onClick={() => window.location.href = `/api/issuer/attest-status/${requestId}`}
              style={{ padding: '0.5rem 1rem' }}
            >
              Check Status
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
