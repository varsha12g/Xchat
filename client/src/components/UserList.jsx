import React from 'react';
import { Users } from 'lucide-react';

const UserList = ({ users = [], title = "Online Users" }) => {
  return (
    <div className="online-sidebar">
      <div className="sidebar-header">
        <h3 className="sidebar-title">
          <Users size={18} />
          <span>{title}</span>
        </h3>
        <span className="online-count-pill">
          {users.length}
        </span>
      </div>

      <div className="user-list">
        {users.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
            No users online
          </p>
        ) : (
          users.map((u, index) => {
            const userName = typeof u === 'string' ? u : u.name;
            const keyId = typeof u === 'object' && u.userId ? u.userId : index;
            const firstInitial = userName ? userName.charAt(0) : '?';

            return (
              <div key={keyId} className="user-item fade-in">
                <div className="avatar-circle">
                  {firstInitial}
                </div>
                <span className="user-name-text">{userName}</span>
                <span className="online-dot" title="Online"></span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserList;
