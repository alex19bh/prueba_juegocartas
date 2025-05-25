// Room controller for managing game rooms
const { Room, User, Game } = require('../models/sqliteModels');
const { Op } = require('sequelize');
const crypto = require('crypto');

// Get all public rooms
exports.getPublicRooms = async (req, res) => {
  try {
    // Find all public rooms that haven't started a game
    const rooms = await Room.findAll({
      where: { 
        isPrivate: false, 
        gameStarted: false 
      },
      attributes: ['id', 'name', 'maxPlayers', 'createdAt'],
      include: [
        {
          model: User,
          as: 'players',
          attributes: ['id'],
          through: { attributes: [] } // Don't include join table attributes
        }
      ]
    });

    // Format response
    const formattedRooms = rooms.map(room => ({
      roomId: room.id,
      name: room.name,
      players: room.players.length,
      maxPlayers: room.maxPlayers,
      createdAt: room.createdAt
    }));

    res.status(200).json(formattedRooms);
  } catch (err) {
    console.error('Error getting public rooms:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create a new room
exports.createRoom = async (req, res) => {
  try {
    const { name, isPrivate = true, maxPlayers = 6 } = req.body;
    
    // Validate room name
    if (!name) {
      return res.status(400).json({ message: 'Room name is required' });
    }

    // Validate maxPlayers
    if (maxPlayers < 2 || maxPlayers > 10) {
      return res.status(400).json({ message: 'Player limit must be between 2 and 10' });
    }

    // Get user from database
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate invite code
    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    // Create new room
    const room = await Room.create({
      name,
      inviteCode,
      isPrivate,
      maxPlayers,
      gameStarted: false,
      messages: JSON.stringify([])
    });

    // Add creator as host (create relationship in join table)
    await room.addPlayer(user, { 
      through: { 
        isHost: true, 
        isReady: false 
      }
    });

    // Get the room with players included
    const roomWithPlayers = await Room.findByPk(room.id, {
      include: [{
        model: User,
        as: 'players',
        through: { attributes: ['isHost', 'isReady'] }
      }]
    });

    // Return room details
    res.status(201).json({
      roomId: room.id,
      name: room.name,
      inviteCode: room.inviteCode,
      isPrivate: room.isPrivate,
      maxPlayers: room.maxPlayers,
      players: roomWithPlayers.players.map(player => ({
        id: player.id,
        username: player.username,
        avatarUrl: player.avatarUrl,
        isHost: player.RoomPlayer.isHost,
        isReady: player.RoomPlayer.isReady
      }))
    });
  } catch (err) {
    console.error('Error creating room:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Join a room by invite code
exports.joinRoom = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    
    if (!inviteCode) {
      return res.status(400).json({ message: 'Invite code is required' });
    }

    // Find room by invite code
    const room = await Room.findOne({ 
      where: { inviteCode },
      include: [{
        model: User,
        as: 'players',
        attributes: ['id']
      }]
    });
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if game already started
    if (room.gameStarted) {
      return res.status(400).json({ message: 'Game already in progress' });
    }

    // Check if room is full
    if (room.players.length >= room.maxPlayers) {
      return res.status(400).json({ message: 'Room is full' });
    }

    // Get user from database
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already in the room
    const isAlreadyInRoom = room.players.some(player => player.id === user.id);
    if (!isAlreadyInRoom) {
      // Add player to room
      await room.addPlayer(user, {
        through: { 
          isHost: false, 
          isReady: false 
        }
      });
    }

    // Get updated room with all player details
    const updatedRoom = await Room.findByPk(room.id, {
      include: [{
        model: User,
        as: 'players',
        attributes: ['id', 'username', 'avatarUrl'],
        through: { attributes: ['isHost', 'isReady'] }
      }]
    });
    
    // Return room details
    res.status(200).json({
      roomId: updatedRoom.id,
      name: updatedRoom.name,
      inviteCode: updatedRoom.inviteCode,
      isPrivate: updatedRoom.isPrivate,
      maxPlayers: updatedRoom.maxPlayers,
      players: updatedRoom.players.map(player => ({
        id: player.id,
        username: player.username,
        avatarUrl: player.avatarUrl,
        isHost: player.RoomPlayer.isHost,
        isReady: player.RoomPlayer.isReady
      }))
    });
  } catch (err) {
    console.error('Error joining room:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get room details
exports.getRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Find room with players included
    const room = await Room.findByPk(roomId, {
      include: [{
        model: User,
        as: 'players',
        attributes: ['id', 'username', 'avatarUrl'],
        through: { attributes: ['isHost', 'isReady'] }
      }]
    });
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Return room details
    res.status(200).json({
      roomId: room.id,
      name: room.name,
      inviteCode: room.inviteCode,
      isPrivate: room.isPrivate,
      maxPlayers: room.maxPlayers,
      players: room.players.map(player => ({
        id: player.id,
        username: player.username,
        avatarUrl: player.avatarUrl,
        isHost: player.RoomPlayer.isHost,
        isReady: player.RoomPlayer.isReady
      })),
      gameStarted: room.gameStarted,
      gameId: room.gameId
    });
  } catch (err) {
    console.error('Error getting room details:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Set ready status
exports.setReadyStatus = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { ready } = req.body;
    
    if (ready === undefined) {
      return res.status(400).json({ message: 'Ready status is required' });
    }

    // Find room with players
    const room = await Room.findByPk(roomId, {
      include: [{
        model: User,
        as: 'players',
        attributes: ['id', 'username'],
        through: { attributes: ['isHost', 'isReady'] }
      }]
    });
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if player is in room
    const playerIndex = room.players.findIndex(player => player.id === req.user.userId);
    if (playerIndex === -1) {
      return res.status(403).json({ message: 'You are not in this room' });
    }

    // Update the ready status in the join table
    await room.setPlayers([req.user.userId], { 
      through: { 
        isReady: ready,
        isHost: room.players[playerIndex].RoomPlayer.isHost // Keep host status the same
      }
    });

    // Reload room to get updated players
    await room.reload({ 
      include: [{
        model: User,
        as: 'players',
        attributes: ['id', 'username'],
        through: { attributes: ['isHost', 'isReady'] }
      }]
    });
    
    // Check if all players are ready
    const allPlayersReady = room.players.every(player => player.RoomPlayer.isReady);

    // Return updated player list
    res.status(200).json({
      roomId: room.id,
      allPlayersReady,
      players: room.players.map(player => ({
        id: player.id,
        username: player.username,
        isHost: player.RoomPlayer.isHost,
        isReady: player.RoomPlayer.isReady
      }))
    });
  } catch (err) {
    console.error('Error setting ready status:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Leave room
exports.leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Find room with players
    const room = await Room.findByPk(roomId, {
      include: [{
        model: User,
        as: 'players',
        attributes: ['id'],
        through: { attributes: ['isHost', 'isReady'] }
      }]
    });
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if player is in room
    const playerIndex = room.players.findIndex(player => player.id === req.user.userId);
    if (playerIndex === -1) {
      return res.status(403).json({ message: 'You are not in this room' });
    }

    // Check if player is host
    const isHost = room.players[playerIndex].RoomPlayer.isHost;
    
    // Remove player from room
    await room.removePlayer(req.user.userId);
    
    let newHostId = null;
    
    // If player was host and there are other players, assign new host
    if (isHost && room.players.length > 1) {
      // Get remaining players (excluding the one who just left)
      const remainingPlayers = room.players.filter(player => player.id !== req.user.userId);
      
      if (remainingPlayers.length > 0) {
        // Assign first remaining player as host
        const newHostUser = remainingPlayers[0];
        newHostId = newHostUser.id;
        
        // Update the host status
        await room.setPlayers([newHostId], {
          through: {
            isHost: true,
            isReady: newHostUser.RoomPlayer.isReady
          }
        });
      }
    }
    
    // Reload room to check if empty
    await room.reload({
      include: [{
        model: User,
        as: 'players'
      }]
    });

    // If room is now empty, delete it
    if (room.players.length === 0) {
      await room.destroy();
    }

    // Return success message with new host ID if applicable
    res.status(200).json({
      message: 'Successfully left room',
      newHostId
    });
  } catch (err) {
    console.error('Error leaving room:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Send chat message
exports.sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Find room
    const room = await Room.findByPk(roomId, {
      include: [{
        model: User,
        as: 'players',
        attributes: ['id']
      }]
    });
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if player is in room
    const isPlayerInRoom = room.players.some(player => player.id === req.user.userId);
    if (!isPlayerInRoom) {
      return res.status(403).json({ message: 'You are not in this room' });
    }

    // Get user from database
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Parse existing messages
    let messages = [];
    try {
      messages = JSON.parse(room.messages || '[]');
    } catch (e) {
      console.error('Error parsing messages:', e);
    }
    
    // Add new message
    const timestamp = new Date();
    messages.push({
      userId: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      content: message,
      timestamp
    });
    
    // Update room with new messages
    room.messages = JSON.stringify(messages);
    await room.save();

    // Return success message with timestamp
    res.status(200).json({
      message: 'Message sent',
      timestamp
    });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Start game
exports.startGame = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Find room with players
    const room = await Room.findByPk(roomId, {
      include: [{
        model: User,
        as: 'players',
        attributes: ['id'],
        through: { attributes: ['isHost', 'isReady'] }
      }]
    });
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if player is host
    const player = room.players.find(player => player.id === req.user.userId);
    if (!player || !player.RoomPlayer.isHost) {
      return res.status(403).json({ message: 'Only the host can start the game' });
    }

    // Check if game already started
    if (room.gameStarted) {
      return res.status(400).json({ message: 'Game already started' });
    }

    // Check if there are at least 2 players
    if (room.players.length < 2) {
      return res.status(400).json({ message: 'At least 2 players required to start a game' });
    }

    // Check if all players are ready
    const allPlayersReady = room.players.every(player => player.RoomPlayer.isReady);
    if (!allPlayersReady) {
      return res.status(400).json({ message: 'All players must be ready to start' });
    }

    // Start game logic will be handled by socket.io

    // Return success message (actual game creation will happen in socket handler)
    res.status(200).json({
      message: 'Game started successfully'
    });
  } catch (err) {
    console.error('Error starting game:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};