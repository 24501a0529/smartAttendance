import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, GlassButton, GlassInput, Notification } from '../components/common';
import { Lock, User, Shield } from 'lucide-react';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Login failed');
            }

            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            setNotification({ type: 'success', message: 'Login Successful' });
            setTimeout(() => navigate('/dashboard'), 1000);
        } catch (err) {
            setNotification({ type: 'error', message: err.message });
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '24px'
        }}>
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}

            <GlassCard style={{ width: '100%', maxWidth: '450px', padding: '48px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        boxShadow: '0 8px 16px var(--primary-glow)'
                    }}>
                        <Shield size={32} color="white" />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Admin Portal</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Enter your credentials to manage records</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <GlassInput
                            type="text"
                            placeholder="Username"
                            required
                            style={{ width: '100%', paddingLeft: '48px' }}
                            value={credentials.username}
                            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <GlassInput
                            type="password"
                            placeholder="Password"
                            required
                            style={{ width: '100%', paddingLeft: '48px' }}
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        />
                    </div>

                    <GlassButton type="submit" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </GlassButton>
                </form>

                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <button
                        onClick={() => navigate('/kiosk')}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                        ← Back to Kiosk Mode
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};

export default Login;
