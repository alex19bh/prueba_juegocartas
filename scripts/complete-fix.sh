#!/bin/bash
echo "=== Script de Corrección Completa para El Virus Game ===" 
echo "Este script corregirá todos los problemas de importación conocidos en la aplicación."

# Detener el servidor si está ejecutándose
pm2 stop el-virus 2>/dev/null || true

# Crear directorios necesarios
mkdir -p /webs/juego/server/middleware
mkdir -p /webs/juego/server/config
mkdir -p /webs/juego/server/models
mkdir -p /webs/juego/server/routes
mkdir -p /webs/juego/server/controllers
mkdir -p /webs/juego/server/utils

# Crear archivo middleware de autenticación
cat > /webs/juego/server/middleware/auth.js << 'EOLAUTH'
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
EOLAUTH

# Crear/actualizar archivo de configuración
cat > /webs/juego/server/config/index.js << 'EOLCONFIG'
module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'el_virus_jwt_secret_key',
  DB_PATH: process.env.DB_PATH || './db/game.db',
  PORT: process.env.PORT || 8000
};
EOLCONFIG

# Crear enlaces simbólicos para los archivos de modelo
cd /webs/juego/server/models
if [ -d ./sqliteModels ]; then
  ln -sf ./sqliteModels/Room.js Room.js
  ln -sf ./sqliteModels/User.js User.js
  ln -sf ./sqliteModels/Game.js Game.js
  echo "¡Enlaces de modelos creados exitosamente!"
else
  echo "Advertencia: directorio sqliteModels no encontrado, saltando enlaces de modelos."
fi

# Verificar dependencias de paquetes faltantes
cd /webs/juego
echo "Verificando paquetes npm requeridos..."
npm list jsonwebtoken || npm install --save jsonwebtoken
npm list bcryptjs || npm install --save bcryptjs
npm list express || npm install --save express
npm list socket.io || npm install --save socket.io
npm list sqlite3 || npm install --save sqlite3

# Crear directorio db si no existe
mkdir -p /webs/juego/server/db

echo "Iniciando el servidor nuevamente..."
cd /webs/juego
pm2 start server/server.js --name=el-virus

echo "=== Corrección Completa Finalizada ==="
echo "Tu servidor debería iniciar ahora sin errores de importación."
echo "Accede a la aplicación en: http://localhost:8000"
