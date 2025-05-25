// Socket manager for handling socket events
const jwt = require('jsonwebtoken');
const config = require('../config/default');
const roomHandler = require('./roomHandler');
const gameHandler = require('./gameHandler');
const User = require('../models/sqliteModels/User');

// Store active socket connections
const activeUsers = new Map();

// Initialize Socket.IO manager
exports.initSocketManager = (io) => {
  // Socket middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      
      try {
        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret);
        
        // Attach user data to socket
        socket.user = decoded;
        
        // Update user's last activity
        await User.findByIdAndUpdate(decoded.userId, { lastActivity: Date.now() });
        
        next();
      } catch (err) {
        return next(new Error('Authentication error: Invalid token'));
      }
    } catch (err) {
      console.error('Socket authentication error:', err);
      next(new Error('Authentication error'));
    }
  });

  // Connection handling
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user.username})`);
    
    // Store user's socket connection
    activeUsers.set(socket.user.userId.toString(), socket.id);
    
    // Set up room handlers
    roomHandler.setupRoomHandlers(io, socket, activeUsers);
    
    // Set up game handlers
    gameHandler.setupGameHandlers(io, socket, activeUsers);
    
    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id} (User: ${socket.user.username})`);
      
      // Remove user from active users
      activeUsers.delete(socket.user.userId.toString());
      
      // Handle room disconnection
      await roomHandler.handleDisconnect(io, socket);
      
      // Handle game disconnection
      await gameHandler.handleDisconnect(io, socket);
    });
    
    // Handle errors
    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
  });
};

// Helper to get a socket by user ID
exports.getSocketByUserId = (userId, activeUsers) => {
  const socketId = activeUsers.get(userId.toString());
  return socketId ? io.sockets.sockets.get(socketId) : null;
};