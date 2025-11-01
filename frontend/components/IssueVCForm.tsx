'use client';

import React, { useState, useEffect } from 'react';
import Card from './Card';

interface Attribute {
  name: string;
  value: string;
}

interface VCTemplate {
  id: string;
  name: string;
  description: string;
  requiredAttributes: string[];
}

const templates: VCTemplate[] = [
  {
    id: 'medical-license',
    name: 'Medical License',
    description: 'State medical license credential',
    requiredAttributes: ['name', 'npi', 'license_number', 'license_state'],
  },
  {
    id: 'board-certification',
    name: 'Board Certification',
    description: 'Specialty board certification',
    requiredAttributes: ['name', 'npi', 'board_name', 'certification_date'],
  },
  {
    id: 'hospital-privilege',
    name: 'Hospital Privilege',
    description: 'Hospital privileging credential',
    requiredAttributes: ['name', 'npi', 'hospital_name', 'privilege_type'],
  },
];

export const IssueVCForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<VCTemplate | null>(null);
  const [providerNPI, setProviderNPI] = useState('');
  const [providerInfo, setProviderInfo] = useState<any>(null);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [evidence, setEvidence] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const handleNPILookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/npi/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npi: providerNPI }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'NPI lookup failed');
      }

      const data = await response.json();
      setProviderInfo(data);
      
      // Pre-fill common attributes
      setAttributes([
        { name: 'name', value: data.name || '' },
        { name: 'npi', value: data.npi },
      ]);
      
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to lookup NPI');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: VCTemplate) => {
    setSelectedTemplate(template);
    
    // Add template-specific attributes
    const newAttributes = [...attributes];
    template.requiredAttributes.forEach((attr) => {
      if (!newAttributes.find((a) => a.name === attr)) {
        newAttributes.push({ name: attr, value: '' });
      }
    });
    setAttributes(newAttributes);
    
    setStep(3);
  };

  const handleAttributeChange = (index: number, value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index].value = value;
    setAttributes(newAttributes);
  };

  const handleEvidenceSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEvidence(Array.from(e.target.files));
    }
  };

  const handlePreview = () => {
    const missingRequired = selectedTemplate?.requiredAttributes.filter(
      (attr) => !attributes.find((a) => a.name === attr && a.value)
    );

    if (missingRequired && missingRequired.length > 0) {
      setError(`Missing required attributes: ${missingRequired.join(', ')}`);
      return;
    }

    setError(null);
    setStep(4);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/issuer/attest-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issuerId: 'issuer-' + Date.now(),
          template: selectedTemplate?.id,
          connectionId: 'default-connection', // In production, use actual connection
          credDefId: 'default-cred-def', // In production, use actual cred def
          attributes: attributes.map((a) => ({ name: a.name, value: a.value })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Issuance request failed');
      }

      const data = await response.json();
      setRequestId(data.requestId);
      setStep(5);
    } catch (err: any) {
      setError(err.message || 'Failed to submit issuance request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>Issue Verifiable Credential</h1>

      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            color: '#991b1b',
          }}
        >
          {error}
        </div>
      )}

      {/* Step 1: Provider Lookup */}
      {step === 1 && (
        <Card title="Step 1: Select Provider">
          <form onSubmit={handleNPILookup}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="npi">Provider NPI</label>
              <input
                id="npi"
                type="text"
                value={providerNPI}
                onChange={(e) => setProviderNPI(e.target.value)}
                placeholder="Enter 10-digit NPI"
                required
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
              />
            </div>
            <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem' }}>
              {loading ? 'Looking up...' : 'Lookup Provider'}
            </button>
          </form>
        </Card>
      )}

      {/* Step 2: Template Selection */}
      {step === 2 && providerInfo && (
        <Card title="Step 2: Choose Credential Template">
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
            <strong>Provider:</strong> {providerInfo.name || 'Unknown'}
            <br />
            <strong>NPI:</strong> {providerInfo.npi}
            <br />
            <strong>Type:</strong> {providerInfo.type}
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {templates.map((template) => (
              <div
                key={template.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => handleTemplateSelect(template)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <h3 style={{ marginTop: 0 }}>{template.name}</h3>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>{template.description}</p>
                <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  Required: {template.requiredAttributes.join(', ')}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep(1)}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
          >
            Back
          </button>
        </Card>
      )}

      {/* Step 3: Fill Attributes */}
      {step === 3 && selectedTemplate && (
        <Card title={`Step 3: Fill ${selectedTemplate.name} Details`}>
          <div style={{ marginBottom: '1rem' }}>
            {attributes.map((attr, index) => (
              <div key={attr.name} style={{ marginBottom: '1rem' }}>
                <label htmlFor={attr.name}>
                  {attr.name.replace(/_/g, ' ').toUpperCase()}
                  {selectedTemplate.requiredAttributes.includes(attr.name) && (
                    <span style={{ color: '#ef4444' }}> *</span>
                  )}
                </label>
                <input
                  id={attr.name}
                  type="text"
                  value={attr.value}
                  onChange={(e) => handleAttributeChange(index, e.target.value)}
                  required={selectedTemplate.requiredAttributes.includes(attr.name)}
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="evidence">Attach Evidence (Optional)</label>
            <input
              id="evidence"
              type="file"
              multiple
              onChange={handleEvidenceSelect}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
            />
            {evidence.length > 0 && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                {evidence.length} file(s) selected
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setStep(2)}>Back</button>
            <button onClick={handlePreview} style={{ backgroundColor: '#3b82f6', color: 'white' }}>
              Preview
            </button>
          </div>
        </Card>
      )}

      {/* Step 4: Preview & Confirm */}
      {step === 4 && selectedTemplate && (
        <Card title="Step 4: Preview & Confirm">
          <div style={{ marginBottom: '1rem' }}>
            <h3>Credential Preview</h3>
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.875rem' }}>
              <strong>Template:</strong> {selectedTemplate.name}
              <br />
              <strong>Provider:</strong> {providerInfo?.name}
              <br />
              <strong>NPI:</strong> {providerNPI}
              <br />
              <br />
              <strong>Attributes:</strong>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(attributes, null, 2)}
              </pre>
            </div>
          </div>

          {evidence.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h4>Attached Evidence:</h4>
              <ul>
                {evidence.map((file, index) => (
                  <li key={index}>
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setStep(3)}>Back</button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1.5rem' }}
            >
              {loading ? 'Submitting...' : 'Issue Credential'}
            </button>
          </div>
        </Card>
      )}

      {/* Step 5: Success */}
      {step === 5 && requestId && (
        <Card title="Credential Issuance Requested">
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: '#10b981' }}>Successfully Submitted!</h2>
            <p style={{ color: '#6b7280', marginTop: '1rem' }}>
              Request ID: <code style={{ backgroundColor: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{requestId}</code>
            </p>
            <p style={{ color: '#6b7280' }}>
              The credential is being issued. You can check the status at:
            </p>
            <a
              href={`/api/issuer/attest-status/${requestId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#3b82f6', textDecoration: 'underline' }}
            >
              View Status
            </a>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              onClick={() => {
                setStep(1);
                setProviderNPI('');
                setProviderInfo(null);
                setSelectedTemplate(null);
                setAttributes([]);
                setEvidence([]);
                setRequestId(null);
              }}
              style={{ padding: '0.5rem 1.5rem' }}
            >
              Issue Another Credential
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default IssueVCForm;
