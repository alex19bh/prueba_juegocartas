// static-server.js
const express = require('express');
const path = require('path');
const http = require('http');

// Create Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Basic middleware
app.use(express.json());

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, '../dist')));

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Static server is running' });
});

// Catch-all handler to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Simple static server running on port ${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, '../dist')}`);
  console.log(`Health check available at: http://localhost:${PORT}/api/health`);
});
