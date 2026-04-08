const http = require('http');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');

const PORT = process.env.PORT || 4242;
const PUBLIC_DIR = __dirname; // serves from current folder

const WORLDMAP_ZONES_PATH = path.join(PUBLIC_DIR, 'src', 'data', 'worldmap-zones.json');
const WORLDMAP_FOREST_EVENT_HEXES_PATH = path.join(PUBLIC_DIR, 'src', 'data', 'worldmap-forest-event-hexes.json');

function sendJson(res, statusCode, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function getDefaultWorldmapZonesPayload() {
  return {
    version: 1,
    origin: { q: 378, r: 363 },
    tokens: [],
    zones: [],
    quickZones: {
      version: 1,
      elevationClimbCheck: '',
      resources: [],
      terrain: [],
      info: [],
      resourceMeta: [],
    },
  };
}

function getDefaultForestEventHexesPayload() {
  return {
    version: 1,
    records: [],
  };
}

function readWorldmapZonesFile() {
  try {
    const base = getDefaultWorldmapZonesPayload();
    if (!fs.existsSync(WORLDMAP_ZONES_PATH)) return base;

    const raw = fs.readFileSync(WORLDMAP_ZONES_PATH, 'utf8');
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== 'object') return base;

    // Normalize/merge so partially-edited files don't break clients.
    if (Number.isFinite(obj.version)) base.version = obj.version;
    if (obj.origin && typeof obj.origin === 'object') {
      const q = Number(obj.origin.q);
      const r = Number(obj.origin.r);
      if (Number.isFinite(q) && Number.isFinite(r)) base.origin = { q, r };
    }

    if (Array.isArray(obj.zones)) base.zones = obj.zones;

    if (Array.isArray(obj.tokens)) base.tokens = obj.tokens;

    if (obj.quickZones && typeof obj.quickZones === 'object') {
      base.quickZones = obj.quickZones;
      // Ensure required quickZones keys exist.
      if (!Number.isFinite(base.quickZones.version)) base.quickZones.version = 1;
      if (typeof base.quickZones.elevationClimbCheck !== 'string') base.quickZones.elevationClimbCheck = '';
      if (!Array.isArray(base.quickZones.resources)) base.quickZones.resources = [];
      if (!Array.isArray(base.quickZones.terrain)) base.quickZones.terrain = [];
      if (!Array.isArray(base.quickZones.info)) base.quickZones.info = [];
      if (!Array.isArray(base.quickZones.resourceMeta)) base.quickZones.resourceMeta = [];
    }

    return base;
  } catch (e) {
    return getDefaultWorldmapZonesPayload();
  }
}

function validateWorldmapZonesPayload(payload) {
  if (!payload || typeof payload !== 'object') return { ok: false, error: 'payload_not_object' };
  if (!Array.isArray(payload.zones)) return { ok: false, error: 'zones_missing_or_not_array' };
  if (payload.tokens != null && !Array.isArray(payload.tokens)) return { ok: false, error: 'tokens_not_array' };
  // quickZones is optional but should be an object if present.
  if (payload.quickZones != null && typeof payload.quickZones !== 'object') return { ok: false, error: 'quickZones_not_object' };
  return { ok: true };
}

function readForestEventHexesFile() {
  try {
    const base = getDefaultForestEventHexesPayload();
    if (!fs.existsSync(WORLDMAP_FOREST_EVENT_HEXES_PATH)) return base;

    const raw = fs.readFileSync(WORLDMAP_FOREST_EVENT_HEXES_PATH, 'utf8');
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== 'object') return base;
    if (Number.isFinite(obj.version)) base.version = obj.version;
    if (Array.isArray(obj.records)) base.records = obj.records;
    return base;
  } catch (e) {
    return getDefaultForestEventHexesPayload();
  }
}

function validateForestEventHexesPayload(payload) {
  if (!payload || typeof payload !== 'object') return { ok: false, error: 'payload_not_object' };
  if (!Array.isArray(payload.records)) return { ok: false, error: 'records_missing_or_not_array' };
  return { ok: true };
}

function handleWorldmapZonesApi(req, res) {
  if (req.method === 'GET') {
    const payload = readWorldmapZonesFile();
    sendJson(res, 200, payload);
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    const MAX = 5 * 1024 * 1024; // 5MB safety limit

    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > MAX) {
        res.writeHead(413, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Payload too large');
        try { req.destroy(); } catch (e) {}
      }
    });

    req.on('end', () => {
      let obj;
      try {
        obj = JSON.parse(body || '{}');
      } catch (e) {
        sendJson(res, 400, { ok: false, error: 'invalid_json' });
        return;
      }

      const v = validateWorldmapZonesPayload(obj);
      if (!v.ok) {
        sendJson(res, 400, { ok: false, error: v.error });
        return;
      }

      try {
        fs.mkdirSync(path.dirname(WORLDMAP_ZONES_PATH), { recursive: true });
        fs.writeFileSync(WORLDMAP_ZONES_PATH, JSON.stringify(obj, null, 2), 'utf8');
        sendJson(res, 200, { ok: true });
      } catch (e) {
        sendJson(res, 500, { ok: false, error: 'write_failed' });
      }
    });
    return;
  }

  res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Method not allowed');
}

function handleWorldmapForestEventHexesApi(req, res) {
  if (req.method === 'GET') {
    sendJson(res, 200, readForestEventHexesFile());
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    const MAX = 2 * 1024 * 1024;

    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > MAX) {
        res.writeHead(413, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Payload too large');
        try { req.destroy(); } catch (e) {}
      }
    });

    req.on('end', () => {
      let obj;
      try {
        obj = JSON.parse(body || '{}');
      } catch (e) {
        sendJson(res, 400, { ok: false, error: 'invalid_json' });
        return;
      }

      const v = validateForestEventHexesPayload(obj);
      if (!v.ok) {
        sendJson(res, 400, { ok: false, error: v.error });
        return;
      }

      try {
        fs.mkdirSync(path.dirname(WORLDMAP_FOREST_EVENT_HEXES_PATH), { recursive: true });
        fs.writeFileSync(WORLDMAP_FOREST_EVENT_HEXES_PATH, JSON.stringify(obj, null, 2), 'utf8');
        sendJson(res, 200, { ok: true });
      } catch (e) {
        sendJson(res, 500, { ok: false, error: 'write_failed' });
      }
    });
    return;
  }

  res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Method not allowed');
}

// Simple static file server
const server = http.createServer((req, res) => {
  if (req.url && req.url.split('?')[0] === '/api/worldmap/zones') {
    handleWorldmapZonesApi(req, res);
    return;
  }
  if (req.url && req.url.split('?')[0] === '/api/worldmap/forest-event-hexes') {
    handleWorldmapForestEventHexesApi(req, res);
    return;
  }

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
    else if (filePath.endsWith('.png')) contentType = 'image/png';
    else if (filePath.endsWith('.webp')) contentType = 'image/webp';
    else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (filePath.endsWith('.gif')) contentType = 'image/gif';
    else if (filePath.endsWith('.svg')) contentType = 'image/svg+xml';
    else if (filePath.endsWith('.ico')) contentType = 'image/x-icon';
    else if (filePath.endsWith('.mp3')) contentType = 'audio/mpeg';

    // Avoid stale-cache issues during local development/play.
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
    });
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
