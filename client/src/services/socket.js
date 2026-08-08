import { io } from 'socket.io-client';

let rawSocketUrl = (import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000').trim().replace(/\/+$/, '');
if (rawSocketUrl.endsWith('/api')) {
  rawSocketUrl = rawSocketUrl.substring(0, rawSocketUrl.length - 4);
}

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(rawSocketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });
  } else if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
