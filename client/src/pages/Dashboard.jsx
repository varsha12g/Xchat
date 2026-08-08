import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, LogIn, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import UserList from '../components/UserList';

const Dashboard = ({ user }) => {
  const [roomIdInput, setRoomIdInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = getSocket();

    // Re-emit user online status if needed
    if (user) {
      socket.emit('user-online', {
        userId: user.id,
        name: user.name
      });
    }

    // Listen for online users real-time updates
    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    socket.on('online-users', handleOnlineUsers);

    return () => {
      socket.off('online-users', handleOnlineUsers);
    };
  }, [user]);

  const handleCreateRoom = async () => {
    setError('');
    setCreating(true);

    try {
      const response = await api.post('/rooms/create');
      const { roomId } = response.data;
      navigate(`/chat/${roomId}`);
    } catch (err) {
      console.error('Create room error:', err);
      setError(err.response?.data?.message || 'Failed to create a room. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setError('');

    const formattedId = roomIdInput.toUpperCase().trim();
    if (!formattedId) {
      setError('Please enter a valid Room ID');
      return;
    }

    setJoining(true);

    try {
      // Check if room exists
      await api.get(`/rooms/${formattedId}`);
      // Room exists, navigate to room
      navigate(`/chat/${formattedId}`);
    } catch (err) {
      console.error('Join room error:', err);
      if (err.response && err.response.status === 404) {
        setError('Room does not exist or has been deleted');
      } else {
        setError(err.response?.data?.message || 'Error joining room. Please check the Room ID.');
      }
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="dashboard-container fade-in">
      <div className="dashboard-main">
        <div className="welcome-banner">
          <h1 className="welcome-title">Welcome, {user?.name || 'User'} 👋</h1>
          <p className="welcome-desc">
            Create a new anonymous room or enter a Room ID to join an existing session in real time.
          </p>
        </div>

        {error && (
          <div className="alert-error fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="room-actions">
          {/* Create Room Card */}
          <div className="action-card">
            <div>
              <h3>
                <PlusCircle size={20} color="#6366F1" />
                <span>Create a Room</span>
              </h3>
              <p>Start a brand new chat room with a unique short code and invite others.</p>
            </div>
            <button
              className="btn-primary"
              onClick={handleCreateRoom}
              disabled={creating}
            >
              {creating ? 'Creating Room...' : 'Create Room'}
            </button>
          </div>

          {/* Join Room Card */}
          <div className="action-card">
            <div>
              <h3>
                <LogIn size={20} color="#8B5CF6" />
                <span>Join a Room</span>
              </h3>
              <p>Already have a Room ID? Enter it below to join the live conversation.</p>
            </div>

            <form onSubmit={handleJoinRoom} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. X7K92A"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                maxLength={10}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)' }}
                disabled={joining}
              >
                {joining ? 'Joining...' : 'Join Room'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Online Users List */}
      <div className="dashboard-sidebar">
        <UserList users={onlineUsers} title="Online Users" />
      </div>
    </div>
  );
};

export default Dashboard;
