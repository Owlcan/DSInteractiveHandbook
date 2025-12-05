const http = require('http');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');

const PORT = process.env.PORT || 4242;
const PUBLIC_DIR = __dirname; // serves from current folder

// Simple static file server
const server = http.createServer((req, res) => {
  let urlPath = req.url === '/' ? '/Arenabol.html' : req.url;
  const filePath = path.join(PUBLIC_DIR, decodeURIComponent(urlPath.split('?')[0]));

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    let contentType = 'text/plain';
    if (filePath.endsWith('.html')) contentType = 'text/html';
    else if (filePath.endsWith('.js')) contentType = 'application/javascript';
    else if (filePath.endsWith('.css')) contentType = 'text/css';
    else if (filePath.endsWith('.json')) contentType = 'application/json';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

// WebSocket server
const wss = new WebSocket.Server({ server });

let hostSocket = null;
let guestSocket = null;
let currentToken = null;

function generateToken() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function safeSend(ws, obj) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(obj));
    } catch (e) {}
  }
}

wss.on('connection', (ws, req) => {
  const url = req.url || '';
  if (url.startsWith('/host')) {
    if (hostSocket && hostSocket !== ws) {
      try { hostSocket.close(); } catch (e) {}
    }
    hostSocket = ws;

    ws.on('message', (data) => {
      let msg;
      try { msg = JSON.parse(data); } catch (e) { return; }

      switch (msg.type) {
        case 'request_token': {
          currentToken = generateToken();
          safeSend(ws, { type: 'token', token: currentToken });
          break;
        }
        case 'host_state': {
          safeSend(guestSocket, { type: 'host_state', payload: msg.payload });
          break;
        }
        case 'host_chat': {
          safeSend(guestSocket, { type: 'host_chat', text: msg.text });
          break;
        }
      }
    });

    ws.on('close', () => {
      hostSocket = null;
      currentToken = null;
      safeSend(guestSocket, { type: 'host_left' });
      if (guestSocket) {
        try { guestSocket.close(); } catch (e) {}
        guestSocket = null;
      }
    });

    safeSend(ws, { type: 'host_connected' });

  } else if (url.startsWith('/guest')) {
    if (guestSocket && guestSocket !== ws) {
      try { guestSocket.close(); } catch (e) {}
    }
    guestSocket = ws;

    ws.on('message', (data) => {
      let msg;
      try { msg = JSON.parse(data); } catch (e) { return; }

      switch (msg.type) {
        case 'join_with_token': {
          const token = (msg.token || '').toUpperCase();
          if (!currentToken || token !== currentToken || !hostSocket) {
            safeSend(ws, { type: 'join_failed', reason: 'invalid_or_expired_token' });
            return;
          }
          currentToken = null;
          safeSend(ws, { type: 'join_ok' });
          safeSend(hostSocket, { type: 'guest_joined' });
          break;
        }
        case 'guest_input': {
          safeSend(hostSocket, { type: 'guest_input', payload: msg.payload });
          break;
        }
        case 'guest_chat': {
          safeSend(hostSocket, { type: 'guest_chat', text: msg.text });
          break;
        }
      }
    });

    ws.on('close', () => {
      guestSocket = null;
      safeSend(hostSocket, { type: 'guest_left' });
    });

    safeSend(ws, { type: 'guest_connected' });

  } else {
    ws.close();
  }
});

server.listen(PORT, () => {
  console.log(`Arenabol server running at http://localhost:${PORT}/`);
});
