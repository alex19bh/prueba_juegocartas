// Configuration settings for the server
const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3001,
    jwtSecret: process.env.JWT_SECRET || 'your-default-jwt-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    environment: process.env.NODE_ENV || 'development'
  },
  
  // Database configuration
  database: {
    // SQLite configuration
    sqlite: {
      dialect: 'sqlite',
      storage: './data/virus_game.sqlite',
      logging: process.env.NODE_ENV === 'development',
      define: {
        timestamps: true,
        underscored: false
      },
      sync: {
        force: process.env.DB_FORCE_SYNC === 'true' ? true : false,
        alter: process.env.DB_ALTER_SYNC === 'true' ? true : false
      }
    }
  },
  
  // Game configuration
  gameConfig: {
    maxPlayers: 6,
    minPlayers: 2,
    defaultPlayers: 4,
    initialHandSize: 3,
    maxHandSize: 7,
    requiredOrgansToWin: 4,
    turnTimeLimit: 60, // seconds
    organTypes: [
      'heart',
      'brain',
      'stomach',
      'lungs',
      'liver',
      'kidney'
    ],
    cardTypes: {
      ORGAN: 'organ',
      VIRUS: 'virus',
      MEDICINE: 'medicine',
      TREATMENT: 'treatment',
      TRANSPLANT: 'transplant'
    },
    // Distribution of card types in the deck
    cardDistribution: {
      organ: 5, // Per organ type
      virus: 4, // Per organ type
      medicine: 4, // Per organ type
      treatment: 4,
      transplant: 2
    }
  },
  
  // User configuration
  userConfig: {
    passwordMinLength: 6,
    usernameMinLength: 3,
    usernameMaxLength: 20,
    defaultUserRole: 'user'
  },
  
  // Socket.IO configuration
  socket: {
    pingTimeout: 60000, // 1 minute
    pingInterval: 25000, // 25 seconds
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Authorization'],
      credentials: true
    }
  }
};

module.exports = config;