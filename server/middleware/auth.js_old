const jwt = require('jsonwebtoken');
const config = require('../config');

function auth(req, res, next) {
  const token = req.header('x-auth-token');

  // Verificar token
  if (!token) {
    return res.status(401).json({ msg: 'No token, autorización denegada' });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, config.JWT_SECRET || 'el_virus_jwt_secret_key');
    // Añadir usuario desde payload
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ msg: 'El token no es válido' });
  }
}

module.exports = auth;
