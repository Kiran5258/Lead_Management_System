import React from 'react';

const Loader = ({ message = 'Loading leads data...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      gap: '1.5rem'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '3px solid var(--border-color)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontFamily: 'var(--font-heading)' }}>{message}</p>
      
      {/* Inject custom keyframe styles in the component to avoid index.css bloat */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
