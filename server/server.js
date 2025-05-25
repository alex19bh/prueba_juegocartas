// Main server file
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIO = require('socket.io');
const socketManager = require('./socketHandlers/socketManager');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const sequelize = require('./config/database');
const initDB = require('./scripts/initDatabase');

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Basic route for API health check
app.get('/api', (req, res) => {
  res.send('El Virus Game API is running');
});

// Serve static files from the React app
const path = require('path');
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Serve index.html for client-side routing
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.IO
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize socket manager
socketManager.initSocketManager(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Connect to database and initialize
(async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('SQLite database connection established successfully');
    
    // Initialize database
    await initDB();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't crash the server on unhandled promise rejection
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});