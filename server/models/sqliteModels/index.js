const User = require('./User');
const Room = require('./Room');
const Game = require('./Game');

// Define associations
User.hasMany(Room, { foreignKey: 'hostId' });
Room.belongsTo(User, { foreignKey: 'hostId', as: 'host' });

Room.hasOne(Game, { foreignKey: 'roomId' });
Game.belongsTo(Room, { foreignKey: 'roomId' });

module.exports = {
  User,
  Room,
  Game
};