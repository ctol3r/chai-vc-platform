import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', style }) => {
  return (
    <div
      className={`card ${className}`}
      style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '1rem',
        ...style,
      }}
    >
      {title && (
        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;
