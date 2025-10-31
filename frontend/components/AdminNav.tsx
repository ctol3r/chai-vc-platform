import React from 'react';
import Link from 'next/link';

interface AdminNavProps {
  userRole?: string;
}

export const AdminNav: React.FC<AdminNavProps> = ({ userRole }) => {
  // Only show nav for admin/ops roles
  const canAccessAdmin = userRole === 'admin' || userRole === 'ops';

  if (!canAccessAdmin) {
    return null;
  }

  return (
    <nav
      style={{
        backgroundColor: '#1f2937',
        color: '#fff',
        padding: '1rem',
        display: 'flex',
        gap: '2rem',
        alignItems: 'center',
      }}
    >
      <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
        VitalCV
      </Link>
      
      <div style={{ display: 'flex', gap: '1.5rem', marginLeft: 'auto' }}>
        <Link
          href="/dashboard/slo"
          style={{
            color: '#9ca3af',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
        >
          📊 SLO Dashboard
        </Link>
        
        <Link
          href="/start"
          style={{
            color: '#9ca3af',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
        >
          🚀 Start Claim
        </Link>
        
        <div
          style={{
            color: '#9ca3af',
            fontSize: '0.875rem',
            padding: '0.25rem 0.75rem',
            backgroundColor: '#374151',
            borderRadius: '9999px',
          }}
        >
          {userRole}
        </div>
      </div>
    </nav>
  );
};

export default AdminNav;
