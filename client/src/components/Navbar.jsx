import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, MessageSquare } from 'lucide-react';
import { disconnectSocket } from '../services/socket';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    disconnectSocket();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (setUser) setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to={user ? "/dashboard" : "/login"} className="nav-brand">
        <span className="brand-logo">
          <MessageSquare size={26} style={{ verticalAlign: 'middle', color: '#6366F1' }} />
          X-Chat
        </span>
      </Link>

      {user && (
        <div className="nav-user">
          <div className="user-badge">
            <span className="online-dot"></span>
            <span>{user.name}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
