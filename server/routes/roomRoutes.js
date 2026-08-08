const express = require('express');
const router = express.Router();
const { createRoom, getRoom, deleteRoom } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createRoom);
router.get('/:roomId', protect, getRoom);
router.delete('/:roomId', protect, deleteRoom);

module.exports = router;
