import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, LogIn, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';

const Login = ({ user, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password: password.trim()
      });

      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);

      // Connect socket & emit online status
      const socket = getSocket();
      socket.emit('user-online', {
        userId: userData.id,
        name: userData.name
      });

      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Invalid login credentials or server unavailable';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <div className="brand-logo" style={{ justifyContent: 'center' }}>
            <MessageSquare size={32} color="#6366F1" />
            <span>X-Chat</span>
          </div>
          <p className="auth-subtitle">Welcome back 👋</p>
        </div>

        {error && (
          <div className="alert-error fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input-field"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            <LogIn size={18} />
            <span>{loading ? 'Logging in...' : 'Login'}</span>
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
