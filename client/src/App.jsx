import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import api from './services/api';
import { getSocket } from './services/socket';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChatRoom from './pages/ChatRoom';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          const userData = res.data;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));

          // Connect socket & emit online status
          const socket = getSocket();
          socket.emit('user-online', {
            userId: userData.id,
            name: userData.name
          });
        } catch (err) {
          console.error('Auth verification error:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Loading X-Chat...
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/login" element={<Login user={user} setUser={setUser} />} />
        <Route path="/register" element={<Register user={user} setUser={setUser} />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:roomId"
          element={
            <ProtectedRoute>
              <ChatRoom user={user} />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </div>
  );
}

export default App;
