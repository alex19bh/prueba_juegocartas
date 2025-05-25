// Simple Express server to serve the React frontend
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Define the path to the built React app
const distPath = path.join(__dirname, 'dist');

// Serve static files from the React build folder
app.use(express.static(distPath));

// Set up proxy middleware for API requests
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true
}));

// Set up proxy middleware for Socket.IO
app.use('/socket.io', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  ws: true
}));

// All other GET requests not handled before will return the React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server is running on port ${PORT}`);
  console.log(`Proxying API requests to http://localhost:5000`);
});