// Database connection module
const { sequelize, testConnection } = require('./database');
const { syncDatabase } = require('../models/sqliteModels/index');

const connectDB = async () => {
  try {
    // Test SQLite connection
    const connected = await testConnection();
    
    if (!connected) {
      throw new Error('Failed to connect to SQLite database');
    }
    
    // Sync models with database
    await syncDatabase();
    
    return sequelize;
  } catch (err) {
    console.error(`Error connecting to SQLite database: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;