#!/usr/bin/env node

/**
 * Simple HTTP server for PMTwin POC
 * Handles SPA routing by serving index.html for all routes
 * 
 * Usage: node server.js [port]
 * Default port: 5500
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.argv[2] || 5500;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const mimeType = getMimeType(filePath);
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Remove leading slash for path resolution
  if (pathname.startsWith('/')) {
    pathname = pathname.substring(1);
  }

  // If no pathname or root, serve index.html
  if (!pathname || pathname === '') {
    pathname = 'index.html';
  }

  const filePath = path.join(ROOT_DIR, pathname);

  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File doesn't exist - serve index.html for SPA routing
      const indexPath = path.join(ROOT_DIR, 'index.html');
      serveFile(indexPath, res);
    } else {
      // Check if it's a directory
      fs.stat(filePath, (err, stats) => {
        if (err) {
          const indexPath = path.join(ROOT_DIR, 'index.html');
          serveFile(indexPath, res);
        } else if (stats.isDirectory()) {
          // Try index.html in directory
          const indexPath = path.join(filePath, 'index.html');
          serveFile(indexPath, res);
        } else {
          // Serve the file
          serveFile(filePath, res);
        }
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`PMTwin POC server running at http://127.0.0.1:${PORT}/`);
  console.log(`Access login at: http://127.0.0.1:${PORT}/login`);
});
