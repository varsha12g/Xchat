import React from 'react';

const ChatMessage = ({ message, currentUserId }) => {
  if (message.isSystem) {
    return (
      <div className="system-message fade-in">
        <span>{message.text}</span>
      </div>
    );
  }

  const isSelf = message.senderId === currentUserId;

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-msg ${isSelf ? 'msg-self' : 'msg-other'} fade-in`}>
      {!isSelf && <span className="msg-sender">{message.senderName}</span>}
      <div className="msg-bubble">
        <div className="msg-text">{message.text}</div>
        <div className="msg-timestamp">{formatTime(message.createdAt)}</div>
      </div>
    </div>
  );
};

export default ChatMessage;
