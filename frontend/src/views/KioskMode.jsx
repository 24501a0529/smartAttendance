import React, { useEffect, useState } from 'react';
import { useWebcam } from '../hooks/useWebcam';
import { useFaceMesh } from '../hooks/useFaceMesh';
import { GlassCard, GlassButton, Notification } from '../components/common';
import { Camera, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

const KioskMode = () => {
    const { videoRef, startWebcam, captureImage, error: webcamError } = useWebcam();
    const { isLivenessValid, livenessStatus, resetLiveness } = useFaceMesh(videoRef);
    const [recognizing, setRecognizing] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        startWebcam();
    }, [startWebcam]);

    useEffect(() => {
        if (isLivenessValid && !recognizing) {
            handleRecognition();
        }
    }, [isLivenessValid]);

    const handleRecognition = async () => {
        setRecognizing(true);
        const image = captureImage();

        try {
            const formData = new FormData();
            formData.append('image_base64', image);
            formData.append('liveness_score', livenessStatus);

            const response = await fetch('http://localhost:8001/api/attendance', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Recognition failed');
            }

            const data = await response.json();
            setNotification({ type: 'success', message: `Attendance Marked: ${data.user.full_name}` });

            setTimeout(() => {
                resetLiveness();
                setRecognizing(false);
            }, 3000);
        } catch (err) {
            setNotification({ type: 'error', message: err.message });
            setRecognizing(false);
            setTimeout(() => resetLiveness(), 2000);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
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

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>Smart Attendance</h1>
                <p style={{ color: 'var(--text-muted)' }}>Position your face within the frame and blink to verify</p>
            </div>

            <GlassCard style={{
                position: 'relative',
                width: '100%',
                maxWidth: '800px',
                aspectRatio: '16/9',
                overflow: 'hidden',
                border: isLivenessValid ? '2px solid var(--success)' : '1px solid var(--glass-border)'
            }}>
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Face Recognition Overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none'
                }}>
                    {recognizing ? (
                        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            <div className="pulse" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)' }} />
                            <span style={{ fontWeight: 600 }}>Analyzing Face...</span>
                        </div>
                    ) : (
                        <div style={{
                            width: '300px',
                            height: '300px',
                            border: `2px dashed ${isLivenessValid ? 'var(--success)' : 'rgba(255,255,255,0.3)'}`,
                            borderRadius: '24px',
                            transition: 'all 0.3s ease'
                        }} />
                    )}
                </div>

                {/* Status Badge */}
                <div style={{
                    position: 'absolute',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '12px'
                }}>
                    <div className="glass-card" style={{
                        padding: '8px 16px',
                        borderRadius: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 600
                    }}>
                        <ShieldCheck size={18} color={isLivenessValid ? 'var(--success)' : 'var(--text-muted)'} />
                        <span>{livenessStatus}</span>
                    </div>
                </div>
            </GlassCard>

            {webcamError && (
                <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)' }}>
                    <AlertCircle size={20} />
                    <span>{webcamError}</span>
                </div>
            )}

            <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
                <GlassButton onClick={() => window.location.href = '/login'} variant="secondary">
                    Admin Login
                </GlassButton>
                <GlassButton onClick={resetLiveness}>
                    Reset Recognition
                </GlassButton>
            </div>
        </div>
    );
};

export default KioskMode;
