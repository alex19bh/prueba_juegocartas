// Configuration settings
require('dotenv').config();

// General configuration values
module.exports = {
  // Server configuration
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  
  // Client URL for CORS
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // MongoDB connection string
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/el-virus-game',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'el-virus-secret-key',
  jwtExpire: '24h', // Token expiration time
  
  // Game configuration
  gameConfig: {
    maxPlayers: parseInt(process.env.MAX_PLAYERS) || 6,
    initialHandSize: 3,
    turnTimeLimit: parseInt(process.env.TURN_TIME_LIMIT) || 60, // seconds
    requiredOrgansToWin: 4,
    
    // Card distribution in the deck
    cardDistribution: {
      organ: 20,      // 5 cards of each color
      virus: 16,      // 4 cards of each color
      medicine: 12,   // 3 cards of each color
      treatment: 8    // 2 cards of each color
    }
  },
  
  // Card colors
  cardColors: ['red', 'blue', 'green', 'yellow']
};