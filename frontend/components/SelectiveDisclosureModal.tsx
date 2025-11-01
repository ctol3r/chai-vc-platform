'use client';

import React, { useState } from 'react';
import Card from './Card';

interface Claim {
  key: string;
  value: any;
  selectable: boolean;
}

interface SelectiveDisclosureModalProps {
  claims: Claim[];
  onSubmit: (selectedClaims: string[]) => void;
  onCancel: () => void;
}

export const SelectiveDisclosureModal: React.FC<SelectiveDisclosureModalProps> = ({
  claims,
  onSubmit,
  onCancel,
}) => {
  const [selectedClaims, setSelectedClaims] = useState<Set<string>>(
    new Set(claims.filter((c) => !c.selectable).map((c) => c.key))
  );

  const toggleClaim = (key: string) => {
    const newSelected = new Set(selectedClaims);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedClaims(newSelected);
  };

  const handleSubmit = () => {
    onSubmit(Array.from(selectedClaims));
  };

  const selectableClaims = claims.filter((c) => c.selectable);
  const alwaysIncluded = claims.filter((c) => !c.selectable);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card title="Select Claims to Share">
          <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
            Choose which information to share with the verifier. You control what's disclosed.
          </p>

          {/* Always Included Claims */}
          {alwaysIncluded.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Always Included:</h4>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {alwaysIncluded.map((claim) => (
                  <div
                    key={claim.key}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <strong>{claim.key}:</strong> {String(claim.value)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selectable Claims */}
          <h4 style={{ marginBottom: '0.5rem' }}>Choose to Share:</h4>
          <div style={{ marginBottom: '1.5rem' }}>
            {selectableClaims.map((claim) => (
              <label
                key={claim.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  marginBottom: '0.5rem',
                  cursor: 'pointer',
                  backgroundColor: selectedClaims.has(claim.key)
                    ? '#eff6ff'
                    : '#fff',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedClaims.has(claim.key)}
                  onChange={() => toggleClaim(claim.key)}
                  style={{ marginRight: '0.75rem' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{claim.key}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {String(claim.value)}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Summary */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '4px',
              marginBottom: '1rem',
            }}
          >
            <strong>Summary:</strong> Sharing {selectedClaims.size} of{' '}
            {claims.length} claims
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              onClick={onCancel}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: '#fff',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedClaims.size === 0}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: selectedClaims.size > 0 ? '#3b82f6' : '#9ca3af',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: selectedClaims.size > 0 ? 'pointer' : 'not-allowed',
              }}
            >
              Share Selected Claims
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SelectiveDisclosureModal;
