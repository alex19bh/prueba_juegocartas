module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'el_virus_jwt_secret_key',
  DB_PATH: process.env.DB_PATH || './db/game.db',
  PORT: process.env.PORT || 8000
};
