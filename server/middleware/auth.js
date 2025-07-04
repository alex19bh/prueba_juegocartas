const jwt = require('jsonwebtoken');
const config = require('../config');

function auth(req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token, autorización denegada' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET || 'el_virus_jwt_secret_key');
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ msg: 'El token no es válido' });
  }
}

module.exports = auth;
