// Room handler for socket events
const Room = require('../models/sqliteModels/Room');
const User = require('../models/sqliteModels/User');
const gameHandler = require('./gameHandler');

// Setup room handlers
exports.setupRoomHandlers = (io, socket, activeUsers) => {
  // Join a room
  socket.on('joinRoom', async (data) => {
    try {
      const { roomId } = data;
      
      // Find room
      const room = await Room.findById(roomId);
      
      if (!room) {
        return socket.emit('error', { message: 'Room not found' });
      }
      
      // Join socket room
      socket.join(roomId);
      
      // Get user
      const user = await User.findById(socket.user.userId);
      
      if (!user) {
        return socket.emit('error', { message: 'User not found' });
      }
      
      // Check if user is in room or add them
      if (!room.isPlayerInRoom(user._id)) {
        // Check if room is full
        if (room.isFull()) {
          return socket.emit('error', { message: 'Room is full' });
        }
        
        // Add player to room
        await room.addPlayer(user);
      } else {
        // Update player connection status
        const playerIndex = room.players.findIndex(player => 
          player.userId.toString() === user._id.toString()
        );
        
        if (playerIndex !== -1) {
          room.players[playerIndex].connected = true;
          await room.save();
        }
      }
      
      // Emit room joined confirmation
      socket.emit('roomJoined', {
        roomId: room._id,
        name: room.name,
        inviteCode: room.inviteCode,
        isPrivate: room.isPrivate,
        maxPlayers: room.maxPlayers,
        players: room.players.map(player => ({
          id: player.userId,
          username: player.username,
          avatarUrl: player.avatarUrl,
          isHost: player.isHost,
          isReady: player.isReady
        })),
        messages: room.messages.slice(-50).map(msg => ({
          userId: msg.userId,
          username: msg.username,
          message: msg.message,
          timestamp: msg.timestamp
        })),
        gameStarted: room.gameStarted,
        gameId: room.gameId
      });
      
      // Notify other players
      socket.to(roomId).emit('playerJoined', {
        id: user._id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        isHost: false,
        isReady: false
      });
      
      console.log(`User ${user.username} joined room ${room.name}`);
    } catch (err) {
      console.error('Error joining room:', err);
      socket.emit('error', { message: 'Error joining room', error: err.message });
    }
  });
  
  // Leave a room
  socket.on('leaveRoom', async (data) => {
    try {
      const { roomId } = data;
      
      // Find room
      const room = await Room.findById(roomId);
      
      if (!room) {
        return socket.emit('error', { message: 'Room not found' });
      }
      
      // Remove player from room
      const { removed, newHostId } = room.removePlayer(socket.user.userId);
      
      if (!removed) {
        return socket.emit('error', { message: 'You are not in this room' });
      }
      
      // Save changes
      await room.save();
      
      // Leave socket room
      socket.leave(roomId);
      
      // Emit room left confirmation
      socket.emit('roomLeft', { roomId });
      
      // If room is now empty, delete it
      if (room.players.length === 0) {
        await Room.findByIdAndDelete(roomId);
      } else {
        // Notify other players
        io.to(roomId).emit('playerLeft', {
          id: socket.user.userId,
          newHostId
        });
      }
      
      console.log(`User ${socket.user.username} left room ${room.name}`);
    } catch (err) {
      console.error('Error leaving room:', err);
      socket.emit('error', { message: 'Error leaving room', error: err.message });
    }
  });
  
  // Set ready status
  socket.on('playerReady', async (data) => {
    try {
      const { roomId, ready } = data;
      
      // Find room
      const room = await Room.findById(roomId);
      
      if (!room) {
        return socket.emit('error', { message: 'Room not found' });
      }
      
      // Check if player is in room
      if (!room.isPlayerInRoom(socket.user.userId)) {
        return socket.emit('error', { message: 'You are not in this room' });
      }
      
      // Set player ready status
      await room.setPlayerReady(socket.user.userId, ready);
      
      // Check if all players are ready
      const allPlayersReady = room.areAllPlayersReady();
      
      // Notify all players in room
      io.to(roomId).emit('playerStatusChanged', {
        id: socket.user.userId,
        isReady: ready,
        allPlayersReady
      });
      
      // If all players are ready and there are at least 2 players
      if (allPlayersReady && room.players.length >= 2) {
        io.to(roomId).emit('allPlayersReady');
      }
      
      console.log(`User ${socket.user.username} set ready status to ${ready}`);
    } catch (err) {
      console.error('Error setting ready status:', err);
      socket.emit('error', { message: 'Error setting ready status', error: err.message });
    }
  });
  
  // Start game
  socket.on('startGame', async (data) => {
    try {
      const { roomId } = data;
      
      // Find room
      const room = await Room.findById(roomId);
      
      if (!room) {
        return socket.emit('error', { message: 'Room not found' });
      }
      
      // Check if player is host
      const player = room.getPlayerById(socket.user.userId);
      if (!player || !player.isHost) {
        return socket.emit('error', { message: 'Only the host can start the game' });
      }
      
      // Check if game already started
      if (room.gameStarted) {
        return socket.emit('error', { message: 'Game already started' });
      }
      
      // Check if there are at least 2 players
      if (room.players.length < 2) {
        return socket.emit('error', { message: 'At least 2 players required to start a game' });
      }
      
      // Check if all players are ready
      if (!room.areAllPlayersReady()) {
        return socket.emit('error', { message: 'All players must be ready to start' });
      }
      
      // Initialize game
      await gameHandler.initializeGame(io, roomId);
      
      console.log(`Game started in room ${room.name}`);
    } catch (err) {
      console.error('Error starting game:', err);
      socket.emit('error', { message: 'Error starting game', error: err.message });
    }
  });
  
  // Send chat message
  socket.on('chatMessage', async (data) => {
    try {
      const { roomId, message } = data;
      
      if (!message || message.trim() === '') {
        return socket.emit('error', { message: 'Message cannot be empty' });
      }
      
      // Find room
      const room = await Room.findById(roomId);
      
      if (!room) {
        return socket.emit('error', { message: 'Room not found' });
      }
      
      // Check if player is in room
      if (!room.isPlayerInRoom(socket.user.userId)) {
        return socket.emit('error', { message: 'You are not in this room' });
      }
      
      // Get user
      const user = await User.findById(socket.user.userId);
      
      if (!user) {
        return socket.emit('error', { message: 'User not found' });
      }
      
      // Add message to room
      await room.addMessage(user, message);
      
      // Send message to all players in room
      io.to(roomId).emit('chatMessage', {
        userId: user._id,
        username: user.username,
        message,
        timestamp: new Date()
      });
      
      console.log(`User ${user.username} sent message in room ${room.name}`);
    } catch (err) {
      console.error('Error sending chat message:', err);
      socket.emit('error', { message: 'Error sending message', error: err.message });
    }
  });
};

// Handle player disconnect
exports.handleDisconnect = async (io, socket) => {
  try {
    // Find rooms user is in
    const rooms = await Room.find({ 'players.userId': socket.user.userId });
    
    for (const room of rooms) {
      // Mark player as disconnected
      const playerIndex = room.players.findIndex(
        player => player.userId.toString() === socket.user.userId.toString()
      );
      
      if (playerIndex !== -1) {
        room.players[playerIndex].connected = false;
        await room.save();
        
        // Notify other players
        io.to(room._id.toString()).emit('playerDisconnected', {
          id: socket.user.userId,
          username: socket.user.username
        });
        
        console.log(`User ${socket.user.username} disconnected from room ${room.name}`);
      }
    }
  } catch (err) {
    console.error('Error handling disconnect:', err);
  }
};