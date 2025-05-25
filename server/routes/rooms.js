// Room routes
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const auth = require('../middleware/auth');

// Get all public rooms
router.get('/public', auth, roomController.getPublicRooms);

// Create a new room
router.post('/', auth, roomController.createRoom);

// Join a room by invite code
router.post('/join', auth, roomController.joinRoom);

// Get room details
router.get('/:roomId', auth, roomController.getRoomDetails);

// Set ready status
router.post('/:roomId/ready', auth, roomController.setReadyStatus);

// Leave room
router.delete('/:roomId/leave', auth, roomController.leaveRoom);

// Send chat message
router.post('/:roomId/message', auth, roomController.sendMessage);

// Start game
router.post('/:roomId/start', auth, roomController.startGame);

module.exports = router;