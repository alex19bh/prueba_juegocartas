const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const config = require('../../config/config');

const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  roomId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Rooms',
      key: 'id'
    }
  },
  gameStatus: {
    type: DataTypes.STRING,
    defaultValue: 'waiting',
    validate: {
      isIn: [['waiting', 'in-progress', 'completed', 'abandoned']]
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
    }
  },
  // Store deck as JSON string
  deck: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('deck');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('deck', JSON.stringify(value));
    }
  },
  // Store discard pile as JSON string
  discardPile: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('discardPile');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('discardPile', JSON.stringify(value));
    }
  },
  currentPlayerId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  turnStartTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  turnTimeLimit: {
    type: DataTypes.INTEGER,
    defaultValue: config.gameConfig.turnTimeLimit
  },
  // Store winner as JSON string
  winner: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('winner');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('winner', value ? JSON.stringify(value) : null);
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
  tableName: 'Games',
  timestamps: true
});

module.exports = Game;