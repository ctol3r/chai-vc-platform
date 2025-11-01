'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const IssueVCForm = dynamic(() => import('../../../components/IssueVCForm'), {
  loading: () => <div style={{ padding: '2rem', textAlign: 'center' }}>Loading form...</div>,
  ssr: false,
});

const AdminNav = dynamic(() => import('../../../components/AdminNav'), {
  ssr: false,
});

// Simple auth check for issuer role
const checkIssuerAuth = (): { isAuthorized: boolean; role?: string } => {
  if (typeof window !== 'undefined') {
    const userRole = localStorage.getItem('userRole') || 'guest';
    const allowedRoles = ['admin', 'issuer', 'ops'];
    return {
      isAuthorized: allowedRoles.includes(userRole),
      role: userRole,
    };
  }
  return { isAuthorized: false };
};

export default function IssueVCPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const auth = checkIssuerAuth();
    setAuthorized(auth.isAuthorized);
    setUserRole(auth.role || 'guest');
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Checking permissions...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div
          style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          <h2 style={{ marginTop: 0, color: '#991b1b' }}>Access Denied</h2>
          <p style={{ color: '#991b1b' }}>
            This page requires issuer role. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminNav userRole={userRole} />
      <IssueVCForm />
    </div>
  );
}
