const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dataDir, 'virus_game.sqlite');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true
  }
});

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('SQLite database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the SQLite database:', error);
  }
}

testConnection();

module.exports = sequelize;