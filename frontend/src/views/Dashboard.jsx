import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link } from 'react-router-dom';
import { GlassCard, GlassButton, GlassInput, Notification } from '../components/common';
import {
    BarChart3,
    Users,
    History,
    Settings,
    LogOut,
    Download,
    Search,
    Calendar,
    Plus,
    Camera,
    Upload
} from 'lucide-react';

const Sidebar = ({ active }) => {
    const navigate = useNavigate();
    const menuItems = [
        { icon: <BarChart3 size={20} />, label: 'Overview', path: '/dashboard' },
        { icon: <History size={20} />, label: 'Attendance Logs', path: '/dashboard/logs' },
        { icon: <Users size={20} />, label: 'User Registry', path: '/dashboard/users' },
        { icon: <Settings size={20} />, label: 'Settings', path: '/dashboard/settings' },
    ];

    return (
        <GlassCard style={{ width: '280px', height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', padding: '24px' }}>
            <div style={{ marginBottom: '40px', padding: '0 12px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>SmartAttend</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin Panel v1.0</p>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {menuItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.path}
                        style={{
                            textDecoration: 'none',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            color: active === item.path ? 'white' : 'var(--text-muted)',
                            background: active === item.path ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                            border: active === item.path ? '1px solid var(--primary)' : '1px solid transparent',
                            transition: 'all 0.2s ease',
                            fontWeight: 500
                        }}
                    >
                        {item.icon}
                        {item.label}
                    </Link>
                ))}
            </nav>

            <GlassButton
                variant="secondary"
                onClick={() => { localStorage.removeItem('token'); navigate('/kiosk'); }}
                style={{ width: '100%', gap: '12px', justifyContent: 'flex-start' }}
            >
                <LogOut size={18} />
                Exit Dashboard
            </GlassButton>
        </GlassCard>
    );
};

const Overview = () => {
    const [stats, setStats] = useState([
        { label: 'Total Attendance', value: '0', trend: '...', color: 'var(--primary)' },
        { label: 'Registered Users', value: '0', trend: '...', color: 'var(--secondary)' },
        { label: 'Liveness Success', value: '100%', trend: 'Stable', color: 'var(--success)' },
        { label: 'System Uptime', value: 'Live', trend: 'Stable', color: 'var(--accent)' }
    ]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [logsRes, usersRes] = await Promise.all([
                    fetch('http://localhost:8001/api/attendance'),
                    fetch('http://localhost:8001/api/users')
                ]);
                const logs = await logsRes.json();
                const users = await usersRes.json();

                setStats(prev => [
                    { ...prev[0], value: logs.length.toString() },
                    { ...prev[1], value: users.length.toString() },
                    prev[2],
                    prev[3]
                ]);
            } catch (e) {
                console.error("Failed to fetch stats", e);
            }
        };
        fetchStats();
    }, []);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {stats.map((stat) => (
                <GlassCard key={stat.label} style={{ padding: '24px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>{stat.label}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>{stat.value}</h2>
                        <span style={{ color: stat.color, fontSize: '0.8rem', fontWeight: 600 }}>{stat.trend}</span>
                    </div>
                </GlassCard>
            ))}
        </div>
    );
};

const AttendanceLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8001/api/attendance')
            .then(res => res.json())
            .then(data => {
                setLogs(data);
                setLoading(false);
            });
    }, []);

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + ["ID,Name,Department,Timestamp,Status,Liveness"].concat(
                logs.map(l => `${l.id},${l.user.full_name},${l.user.department},${l.timestamp},${l.status},${l.liveness_score}`)
            ).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "attendance_logs.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <GlassCard style={{ padding: '32px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontWeight: 700 }}>Attendance Records</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <GlassButton variant="secondary" onClick={handleExport} style={{ height: '40px', padding: '0 16px' }}>
                        <Download size={18} /> Export CSV
                    </GlassButton>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            {['User', 'Dept', 'Timestamp', 'Status', 'Liveness'].map(h => (
                                <th key={h} style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '16px', fontWeight: 600 }}>{log.user?.full_name || 'Unknown'}</td>
                                <td style={{ padding: '16px' }}>{log.user?.department || 'N/A'}</td>
                                <td style={{ padding: '16px' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontSize: '0.8rem' }}>{log.status}</span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
                                        {log.liveness_score}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [newUser, setNewUser] = useState({ full_name: '', department: '' });
    const [videoActive, setVideoActive] = useState(false);
    const [inputMode, setInputMode] = useState('camera'); // 'camera' or 'upload'
    const [previewImage, setPreviewImage] = useState(null);
    const [uploadedBase64, setUploadedBase64] = useState(null);
    const [statusMsg, setStatusMsg] = useState('');
    const videoRef = React.useRef(null);
    const fileInputRef = React.useRef(null);

    const deleteUser = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        const res = await fetch(`http://localhost:8001/api/users/${id}`, { method: 'DELETE' });
        if (res.ok) setUsers(users.filter(u => u.id !== id));
    };

    useEffect(() => {
        fetch('http://localhost:8001/api/users').then(res => res.json()).then(setUsers);
    }, []);

    const startCamera = async () => {
        setVideoActive(true);
        setPreviewImage(null);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        }
        setVideoActive(false);
    };

    const captureFromCamera = () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
        const imageBase64 = canvas.toDataURL('image/jpeg');
        setPreviewImage(imageBase64);
        setUploadedBase64(imageBase64);
        stopCamera();
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setPreviewImage(ev.target.result);
            setUploadedBase64(ev.target.result);
        };
        reader.readAsDataURL(file);
    };

    const saveUser = async () => {
        if (!newUser.full_name || !newUser.department) {
            setStatusMsg('Please fill in name and department.');
            return;
        }
        if (!uploadedBase64) {
            setStatusMsg('Please capture or upload a photo.');
            return;
        }
        setStatusMsg('Saving...');

        const formData = new FormData();
        formData.append('full_name', newUser.full_name);
        formData.append('department', newUser.department);
        formData.append('image_base64', uploadedBase64);

        const res = await fetch('http://localhost:8001/api/users', {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            const data = await res.json();
            setUsers([...users, data]);
            setShowAdd(false);
            setVideoActive(false);
            setPreviewImage(null);
            setUploadedBase64(null);
            setNewUser({ full_name: '', department: '' });
            setStatusMsg('');
        } else {
            const err = await res.json();
            setStatusMsg('Error: ' + (err.detail || 'Failed to save user'));
        }
    };

    const handleCancel = () => {
        stopCamera();
        setShowAdd(false);
        setPreviewImage(null);
        setUploadedBase64(null);
        setStatusMsg('');
    };

    return (
        <GlassCard style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2>User Registry</h2>
                <GlassButton onClick={() => setShowAdd(true)}><Plus size={18} /> Add User</GlassButton>
            </div>

            {showAdd && (
                <div style={{ marginBottom: '32px', padding: '24px', border: '1px solid var(--glass-border)', borderRadius: '16px' }}>
                    <h3 style={{ marginBottom: '16px' }}>Enroll New Face</h3>

                    {/* Input mode toggle */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                        <GlassButton
                            variant={inputMode === 'camera' ? 'primary' : 'secondary'}
                            onClick={() => { setInputMode('camera'); setPreviewImage(null); setUploadedBase64(null); stopCamera(); }}
                            style={{ height: '40px', padding: '0 16px' }}
                        >
                            <Camera size={16} /> Use Camera
                        </GlassButton>
                        <GlassButton
                            variant={inputMode === 'upload' ? 'primary' : 'secondary'}
                            onClick={() => { setInputMode('upload'); setPreviewImage(null); setUploadedBase64(null); stopCamera(); }}
                            style={{ height: '40px', padding: '0 16px' }}
                        >
                            <Upload size={16} /> Upload Photo
                        </GlassButton>
                    </div>

                    <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
                        {/* Form fields */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <GlassInput
                                placeholder="Full Name"
                                value={newUser.full_name}
                                onChange={e => setNewUser({ ...newUser, full_name: e.target.value })}
                            />
                            <GlassInput
                                placeholder="Department"
                                value={newUser.department}
                                onChange={e => setNewUser({ ...newUser, department: e.target.value })}
                            />

                            {inputMode === 'camera' && !videoActive && !previewImage && (
                                <GlassButton onClick={startCamera} variant="secondary">
                                    <Camera size={18} /> Start Camera
                                </GlassButton>
                            )}
                            {inputMode === 'camera' && videoActive && (
                                <GlassButton onClick={captureFromCamera}>
                                    <Camera size={18} /> Capture Photo
                                </GlassButton>
                            )}
                            {inputMode === 'upload' && (
                                <>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleFileUpload}
                                    />
                                    <GlassButton variant="secondary" onClick={() => fileInputRef.current.click()}>
                                        <Upload size={18} /> Choose Photo
                                    </GlassButton>
                                </>
                            )}

                            {previewImage && (
                                <GlassButton onClick={saveUser} style={{ background: 'rgba(16,185,129,0.2)', borderColor: 'var(--success)' }}>
                                    Save User
                                </GlassButton>
                            )}

                            {statusMsg && (
                                <p style={{ color: statusMsg.startsWith('Error') ? 'var(--error, red)' : 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    {statusMsg}
                                </p>
                            )}

                            <GlassButton variant="secondary" onClick={handleCancel}>
                                Cancel
                            </GlassButton>
                        </div>

                        {/* Preview area */}
                        <div style={{ width: '300px', height: '225px', background: '#000', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                            {previewImage ? (
                                <img src={previewImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <video ref={videoRef} autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover', display: videoActive ? 'block' : 'none' }} />
                            )}
                            {!previewImage && !videoActive && (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    {inputMode === 'camera' ? 'Camera preview' : 'Photo preview'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {users.map(u => (
                    <GlassCard key={u.id} style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={32} />
                        </div>
                        <h4 style={{ margin: 0 }}>{u.full_name}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>{u.department}</p>
                        <button
                            onClick={() => deleteUser(u.id)}
                            style={{ marginTop: '8px', padding: '4px 12px', background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                            Delete
                        </button>
                    </GlassCard>
                ))}
            </div>
        </GlassCard>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div style={{ display: 'flex', padding: '24px', gap: '24px', minHeight: '100vh' }}>
            <Sidebar active={window.location.pathname} />

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Administrative Overview</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Welcome back, System Admin</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <GlassCard style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Calendar size={18} color="var(--primary)" />
                            <span style={{ fontWeight: 500 }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </GlassCard>
                    </div>
                </header>

                <Routes>
                    <Route path="/" element={<Overview />} />
                    <Route path="/logs" element={<AttendanceLogs />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/settings" element={<div className="glass-card" style={{ padding: '40px' }}><h3>System Settings</h3><p style={{ color: 'var(--text-muted)' }}>Configure recognition thresholds and API endpoints.</p></div>} />
                </Routes>
            </main>
        </div>
    );
};

export default Dashboard;