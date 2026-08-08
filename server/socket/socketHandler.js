const Room = require('../models/Room');
const Message = require('../models/Message');

// In-memory data structures
// onlineUsers: Map<userId, { name: string, sockets: Set<socketId> }>
const onlineUsers = new Map();

// activeRooms: Map<roomId, Map<socketId, { userId: string, name: string }>>
const activeRooms = new Map();

// Helper to format unique online users list
const getOnlineUsersList = () => {
  const usersList = [];
  onlineUsers.forEach((data, userId) => {
    usersList.push({
      userId,
      name: data.name
    });
  });
  return usersList;
};

// Helper to format room active users
const getRoomUsersList = (roomId) => {
  const roomSockets = activeRooms.get(roomId);
  if (!roomSockets) return [];

  const uniqueUsers = new Map();
  roomSockets.forEach((user) => {
    uniqueUsers.set(user.userId, { userId: user.userId, name: user.name });
  });

  return Array.from(uniqueUsers.values());
};

// Helper function to handle room leaving logic
const handleLeaveRoom = async (io, socket, roomId) => {
  if (!roomId) return;

  const roomMap = activeRooms.get(roomId);
  if (!roomMap) return;

  const userInfo = roomMap.get(socket.id);
  const userName = userInfo ? userInfo.name : (socket.userName || 'A user');

  // Remove socket from room map
  roomMap.delete(socket.id);
  socket.leave(roomId);
  socket.currentRoomId = null;

  // Broadcast user left system message to remaining sockets in room
  io.to(roomId).emit('receive-message', {
    _id: `sys-${Date.now()}-${Math.random()}`,
    isSystem: true,
    text: `${userName} left the room`,
    createdAt: new Date()
  });

  const remainingUsers = getRoomUsersList(roomId);
  io.to(roomId).emit('room-users-updated', {
    roomId,
    users: remainingUsers,
    count: remainingUsers.length
  });

  // Check if room has 0 active sockets/users left
  if (roomMap.size === 0) {
    activeRooms.delete(roomId);

    // Delete Room and Messages from MongoDB
    try {
      await Room.deleteOne({ roomId });
      await Message.deleteMany({ roomId });
      console.log(`[Socket] Room ${roomId} was automatically deleted from MongoDB (0 active users).`);
      io.to(roomId).emit('room-deleted', { roomId });
    } catch (err) {
      console.error(`[Socket Error] Deleting room ${roomId} from DB:`, err);
    }
  }
};

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket Connected] ID: ${socket.id}`);

    // User comes online
    socket.on('user-online', (data) => {
      const { userId, name } = data;
      if (!userId || !name) return;

      socket.userId = userId;
      socket.userName = name;

      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, {
          name,
          sockets: new Set([socket.id])
        });
      } else {
        const userData = onlineUsers.get(userId);
        userData.name = name; // update name if changed
        userData.sockets.add(socket.id);
      }

      // Broadcast updated online users list
      io.emit('online-users', getOnlineUsersList());
    });

    // Join room
    socket.on('join-room', async (data) => {
      const { roomId: rawRoomId, userId, name } = data;
      if (!rawRoomId || !userId || !name) {
        return socket.emit('room-error', { message: 'Invalid room join details' });
      }

      const roomId = rawRoomId.toUpperCase().trim();

      try {
        // Verify room exists in MongoDB
        const roomExists = await Room.findOne({ roomId });
        if (!roomExists) {
          return socket.emit('room-error', { message: 'Room does not exist or has been deleted' });
        }

        // If user was previously in another room on this socket, leave it first
        if (socket.currentRoomId && socket.currentRoomId !== roomId) {
          await handleLeaveRoom(io, socket, socket.currentRoomId);
        }

        // Join socket room
        socket.join(roomId);
        socket.currentRoomId = roomId;
        socket.userId = userId;
        socket.userName = name;

        // Add to activeRooms tracking map
        if (!activeRooms.has(roomId)) {
          activeRooms.set(roomId, new Map());
        }
        activeRooms.get(roomId).set(socket.id, { userId, name });

        // Fetch recent messages for room
        const messages = await Message.find({ roomId })
          .sort({ createdAt: 1 })
          .limit(100);

        // Send chat history to the joining user
        socket.emit('room-history', {
          roomId,
          messages
        });

        // Broadcast join system message to room
        io.to(roomId).emit('receive-message', {
          _id: `sys-${Date.now()}-${Math.random()}`,
          isSystem: true,
          text: `${name} joined the room`,
          createdAt: new Date()
        });

        // Broadcast updated room users list
        const roomUsers = getRoomUsersList(roomId);
        io.to(roomId).emit('room-users-updated', {
          roomId,
          users: roomUsers,
          count: roomUsers.length
        });

      } catch (error) {
        console.error('[Socket Join Room Error]:', error);
        socket.emit('room-error', { message: 'Failed to join room' });
      }
    });

    // Send Message
    socket.on('send-message', async (data) => {
      const { roomId: rawRoomId, senderId, senderName, text } = data;
      if (!rawRoomId || !senderId || !senderName || !text) return;

      const roomId = rawRoomId.toUpperCase().trim();
      const trimmedText = text.trim();

      if (!trimmedText) return;
      if (trimmedText.length > 2000) {
        return socket.emit('message-error', { message: 'Message is too long (max 2000 characters)' });
      }

      try {
        // Save to DB
        const newMessage = await Message.create({
          roomId,
          senderId,
          senderName,
          text: trimmedText
        });

        const formattedMsg = {
          _id: newMessage._id,
          roomId,
          senderId,
          senderName,
          text: newMessage.text,
          createdAt: newMessage.createdAt
        };

        // Broadcast to everyone in the room
        io.to(roomId).emit('receive-message', formattedMsg);
      } catch (error) {
        console.error('[Socket Send Message Error]:', error);
        socket.emit('message-error', { message: 'Failed to send message' });
      }
    });

    // Explicit leave room
    socket.on('leave-room', async (data) => {
      const { roomId: rawRoomId } = data || {};
      const roomId = rawRoomId ? rawRoomId.toUpperCase().trim() : socket.currentRoomId;
      if (roomId) {
        await handleLeaveRoom(io, socket, roomId);
      }
    });

    // Disconnect event
    socket.on('disconnect', async () => {
      console.log(`[Socket Disconnected] ID: ${socket.id}`);

      // Handle room cleanup if in a room
      if (socket.currentRoomId) {
        await handleLeaveRoom(io, socket, socket.currentRoomId);
      }

      // Handle online status cleanup
      if (socket.userId && onlineUsers.has(socket.userId)) {
        const userData = onlineUsers.get(socket.userId);
        userData.sockets.delete(socket.id);

        if (userData.sockets.size === 0) {
          onlineUsers.delete(socket.userId);
        }

        // Broadcast updated online users
        io.emit('online-users', getOnlineUsersList());
      }
    });
  });
};

module.exports = setupSocket;
