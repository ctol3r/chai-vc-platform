'use client';

import React, { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Lazy-load SLODashboard for better performance
const SLODashboard = dynamic(() => import('../../../components/SLODashboard'), {
  loading: () => <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>,
  ssr: false,
});

// Simple auth check (replace with real auth in production)
const checkAuth = (): { isAuthorized: boolean; role?: string } => {
  // In production, this would check session/auth tokens
  // For pilot, we'll allow access but log the check
  if (typeof window !== 'undefined') {
    // Check localStorage or cookies for auth
    const userRole = localStorage.getItem('userRole') || 'admin';
    const allowedRoles = ['admin', 'ops'];
    return {
      isAuthorized: allowedRoles.includes(userRole),
      role: userRole,
    };
  }
  return { isAuthorized: false };
};

function SLOPageContent() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [mockData, setMockData] = useState(false);

  useEffect(() => {
    const auth = checkAuth();
    setAuthorized(auth.isAuthorized);
    
    // Check for mockSLO query parameter
    const params = new URLSearchParams(window.location.search);
    setMockData(params.get('mockSLO') === '1');
    
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
            This page requires admin or ops role. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SLODashboard mockData={mockData} />
    </div>
  );
}

export default function SLOPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
      <SLOPageContent />
    </Suspense>
  );
}
