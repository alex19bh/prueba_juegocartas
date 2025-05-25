/**
 * Database initialization script for SQLite
 * This script will create the tables required for the application
 */
const sequelize = require('../config/database');
const { User, Room, Game } = require('../models/sqliteModels');
const config = require('../config/config');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function initDB() {
  try {
    console.log('Starting database initialization...');

    // Force sync to drop existing tables and recreate them
    // Set force: false in production to prevent data loss
    const force = process.env.NODE_ENV === 'development' && process.env.DB_FORCE_SYNC === 'true';
    
    console.log(`Syncing database with force: ${force}`);
    
    // Sync all models with database
    await sequelize.sync({ force });
    
    console.log('Database synchronized successfully');

    // If we're forcing a sync, create a default admin user in development
    if (force && process.env.NODE_ENV === 'development') {
      console.log('Creating default admin user...');
      
      // Create admin user
      await User.create({
        id: uuidv4(),
        username: 'admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      });
      
      console.log('Admin user created successfully');

      // Create some test users
      const testUsers = [];
      for (let i = 1; i <= 5; i++) {
        testUsers.push({
          id: uuidv4(),
          username: `user${i}`,
          email: `user${i}@example.com`,
          password: await bcrypt.hash('password123', 10),
          role: 'user'
        });
      }
      
      await User.bulkCreate(testUsers);
      console.log('Test users created successfully');
      
      // Create a test room
      const roomId = uuidv4();
      const hostId = (await User.findOne({ where: { username: 'user1' } })).id;
      
      await Room.create({
        id: roomId,
        name: 'Test Room',
        description: 'A test room for development',
        accessCode: 'ABC123',
        isPrivate: false,
        maxPlayers: 4,
        hostId: hostId,
        players: JSON.stringify([
          {
            userId: hostId,
            username: 'user1',
            isHost: true,
            isReady: false
          }
        ]),
        status: 'waiting'
      });
      
      console.log('Test room created successfully');
    }

    console.log('Database initialization completed successfully');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  initDB().then(() => {
    console.log('Initialization script completed');
    process.exit(0);
  });
}

module.exports = initDB;