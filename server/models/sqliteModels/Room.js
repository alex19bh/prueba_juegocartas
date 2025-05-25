const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const crypto = require('crypto');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 50]
    }
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  accessCode: {
    type: DataTypes.STRING,
    defaultValue: () => {
      // Generate a 6-character alphanumeric code
      return crypto.randomBytes(3).toString('hex').toUpperCase();
    }
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  maxPlayers: {
    type: DataTypes.INTEGER,
    defaultValue: 4,
    validate: {
      min: 2,
      max: 6
    }
  },
  hostId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  gameId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Games',
      key: 'id'
    }
  },
  // Store players as JSON string
  players: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('players');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('players', JSON.stringify(value));
    },
    defaultValue: '[]'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'waiting',
    validate: {
      isIn: [['waiting', 'in-progress', 'completed']]
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Rooms',
  timestamps: true
});

module.exports = Room;