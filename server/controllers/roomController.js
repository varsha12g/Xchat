const Room = require('../models/Room');
const Message = require('../models/Message');

// Helper to generate a random 6-character room ID (uppercase letters & numbers)
const generateRoomId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// @desc    Create a new room with a unique Room ID
// @route   POST /api/rooms/create
// @access  Private
const createRoom = async (req, res) => {
  try {
    let roomId;
    let isUnique = false;
    let attempts = 0;

    // Guarantee unique Room ID
    while (!isUnique && attempts < 10) {
      roomId = generateRoomId();
      const existingRoom = await Room.findOne({ roomId });
      if (!existingRoom) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ message: 'Failed to generate unique Room ID. Please try again.' });
    }

    const room = await Room.create({ roomId });

    return res.status(201).json({
      roomId: room.roomId,
      createdAt: room.createdAt
    });
  } catch (error) {
    console.error('Create Room Error:', error);
    return res.status(500).json({ message: 'Server error creating room' });
  }
};

// @desc    Get room details / check existence
// @route   GET /api/rooms/:roomId
// @access  Private
const getRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId.toUpperCase().trim();
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room does not exist' });
    }

    return res.json({
      roomId: room.roomId,
      createdAt: room.createdAt
    });
  } catch (error) {
    console.error('Get Room Error:', error);
    return res.status(500).json({ message: 'Server error checking room' });
  }
};

// @desc    Delete room and associated messages
// @route   DELETE /api/rooms/:roomId
// @access  Private
const deleteRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId.toUpperCase().trim();

    await Room.deleteOne({ roomId });
    await Message.deleteMany({ roomId });

    return res.json({ message: `Room ${roomId} and associated messages deleted successfully` });
  } catch (error) {
    console.error('Delete Room Error:', error);
    return res.status(500).json({ message: 'Server error deleting room' });
  }
};

module.exports = {
  createRoom,
  getRoom,
  deleteRoom
};
