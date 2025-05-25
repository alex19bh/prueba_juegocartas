// simple-http-server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Define the directory containing the static files
const DIST_DIR = path.join(__dirname, '../dist');
const PORT = 8080; // Changed port from 5000 to 8080

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Create HTTP server
const server = http.createServer((req, res) => {
  // Parse URL to get pathname
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // If path is '/', default to index.html
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // API health check endpoint
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'Simple HTTP server is running' }));
    return;
  }

  // Resolve the file path from the requested URL
  const filePath = path.join(DIST_DIR, pathname);
  
  // Get file extension
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File doesn't exist - serve index.html for client-side routing
      const indexPath = path.join(DIST_DIR, 'index.html');
      fs.readFile(indexPath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end(`Error loading index.html: ${err.code}`);
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        }
      });
      return;
    }
    
    // File exists, serve it
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Simple HTTP server running on port ${PORT}`);
  console.log(`Serving static files from: ${DIST_DIR}`);
  console.log(`Health check available at: http://localhost:${PORT}/api/health`);
});