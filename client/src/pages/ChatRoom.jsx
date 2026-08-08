import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, LogOut, Copy, Check, Users, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import ChatMessage from '../components/ChatMessage';
import UserList from '../components/UserList';

const ChatRoom = ({ user }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [roomUsers, setRoomUsers] = useState([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!roomId || !user) return;

    const socket = getSocket();
    const formattedRoomId = roomId.toUpperCase().trim();

    // Verify room via API first
    api.get(`/rooms/${formattedRoomId}`)
      .then(() => {
        setLoading(false);
        // Emit join room
        socket.emit('join-room', {
          roomId: formattedRoomId,
          userId: user.id,
          name: user.name
        });
      })
      .catch((err) => {
        console.error('Room verification error:', err);
        setLoading(false);
        setError('Room does not exist or has been deleted');
      });

    // Socket Event Listeners
    const handleRoomHistory = (data) => {
      if (data.messages) {
        setMessages(data.messages);
      }
    };

    const handleReceiveMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleRoomUsersUpdated = (data) => {
      if (data.users) {
        setRoomUsers(data.users);
      }
    };

    const handleRoomError = (data) => {
      setError(data.message || 'Room error occurred');
    };

    const handleRoomDeleted = () => {
      setError('This room has been deleted because all users left.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2500);
    };

    socket.on('room-history', handleRoomHistory);
    socket.on('receive-message', handleReceiveMessage);
    socket.on('room-users-updated', handleRoomUsersUpdated);
    socket.on('room-error', handleRoomError);
    socket.on('room-deleted', handleRoomDeleted);

    return () => {
      // Cleanup: leave room on unmount
      socket.emit('leave-room', { roomId: formattedRoomId });
      socket.off('room-history', handleRoomHistory);
      socket.off('receive-message', handleReceiveMessage);
      socket.off('room-users-updated', handleRoomUsersUpdated);
      socket.off('room-error', handleRoomError);
      socket.off('room-deleted', handleRoomDeleted);
    };
  }, [roomId, user, navigate]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !user) return;

    const socket = getSocket();
    socket.emit('send-message', {
      roomId: roomId.toUpperCase().trim(),
      senderId: user.id,
      senderName: user.name,
      text
    });

    setInputText('');
  };

  const handleLeaveRoom = () => {
    const socket = getSocket();
    socket.emit('leave-room', { roomId: roomId.toUpperCase().trim() });
    navigate('/dashboard');
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Connecting to room {roomId}...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card fade-in" style={{ textAlign: 'center' }}>
          <AlertCircle size={48} color="#EF4444" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Room Unavailable</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container fade-in">
      {/* Sidebar (Desktop & Tablet) */}
      <aside className="chat-sidebar">
        <div className="room-badge-card">
          <div className="room-badge-label">ROOM ID</div>
          <div className="room-id-code">
            <span>{roomId.toUpperCase()}</span>
            <button className="btn-copy" onClick={copyRoomId} title="Copy Room ID">
              {copied ? <Check size={18} color="#22C55E" /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <div className="room-sidebar-section">
          <UserList users={roomUsers} title="In This Room" />
        </div>

        <button className="btn-leave-room" onClick={handleLeaveRoom}>
          <LogOut size={18} />
          <span>Leave Room</span>
        </button>
      </aside>

      {/* Main Chat Content */}
      <main className="chat-main">
        {/* Chat Header */}
        <header className="chat-header">
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Room: <span style={{ color: 'var(--primary)' }}>{roomId.toUpperCase()}</span>
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={14} color="#22C55E" />
              <span>{roomUsers.length} user{roomUsers.length === 1 ? '' : 's'} online in room</span>
            </div>
          </div>

          <button
            className="btn-leave-room"
            onClick={handleLeaveRoom}
            style={{ width: 'auto', marginTop: 0, padding: '0.5rem 0.85rem' }}
          >
            <LogOut size={16} />
            <span>Leave</span>
          </button>
        </header>

        {/* Messages List */}
        <div className="chat-messages-area">
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto', fontStyle: 'italic' }}>
              No messages yet. Say hello to start the conversation! 👋
            </div>
          ) : (
            messages.map((msg, index) => (
              <ChatMessage
                key={msg._id || index}
                message={msg}
                currentUserId={user?.id}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form className="chat-input-bar" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="input-field"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            maxLength={2000}
          />
          <button type="submit" className="btn-send" disabled={!inputText.trim()} title="Send Message">
            <Send size={18} />
          </button>
        </form>
      </main>
    </div>
  );
};

export default ChatRoom;
