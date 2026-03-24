import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import KioskMode from './views/KioskMode';
import Login from './views/Login';
import Dashboard from './views/Dashboard';

function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/" element={<Navigate to="/kiosk" />} />
                    <Route path="/kiosk" element={<KioskMode />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard/*" element={<Dashboard />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
