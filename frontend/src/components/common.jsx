import React from 'react';

export const GlassCard = ({ children, className = '', ...props }) => (
    <div className={`glass-card ${className}`} {...props}>
        {children}
    </div>
);

export const GlassButton = ({ children, className = '', variant = 'primary', ...props }) => (
    <button className={`glass-button ${variant === 'secondary' ? 'secondary' : ''} ${className}`} {...props}>
        {children}
    </button>
);

export const GlassInput = ({ className = '', ...props }) => (
    <input className={`glass-input ${className}`} {...props} />
);

export const Notification = ({ type = 'success', message, onClose }) => {
    const colors = {
        success: 'var(--success)',
        error: 'var(--error)',
        warning: 'var(--warning)',
        info: 'var(--primary)'
    };

    return (
        <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            padding: '16px 24px',
            borderRadius: '12px',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${colors[type]}`,
            color: '#fff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out'
        }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[type] }} className="pulse" />
            <span style={{ fontWeight: 500 }}>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginLeft: '12px' }}>✕</button>
        </div>
    );
};
