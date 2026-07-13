// THROWAWAY UI PROTOTYPE server. Run: node prototype-server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const prototype = path.join(__dirname, 'prototype-ui.html');
http.createServer((request, response) => {
  if (request.url === '/' || request.url.startsWith('/?')) {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(prototype).pipe(response);
    return;
  }
  response.writeHead(404);
  response.end('Not found');
}).listen(4173, () => console.log('UI prototype: http://localhost:4173/?variant=A'));
