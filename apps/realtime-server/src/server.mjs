import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';

const PORT = Number(process.env.REALTIME_PORT || 8090);
const WS_PATH = '/ws';

const server = createServer((req, res) => {
  if (!req.url) {
    res.statusCode = 400;
    res.end('Bad Request');
    return;
  }

  if (req.url === '/health') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: true, service: 'realtime-server' }));
    return;
  }

  res.statusCode = 404;
  res.end('Not Found');
});

const wss = new WebSocketServer({ server, path: WS_PATH });

function broadcast(raw, from) {
  for (const client of wss.clients) {
    if (client !== from && client.readyState === client.OPEN) {
      client.send(raw);
    }
  }
}

wss.on('connection', (socket) => {
  socket.on('message', (raw) => {
    let message;
    try {
      message = JSON.parse(String(raw));
    } catch {
      return;
    }

    if (!message || typeof message !== 'object' || typeof message.topic !== 'string') {
      return;
    }

    if (message.topic === 'ping') {
      const pongEnvelope = {
        messageId: `pong-${Date.now()}`,
        topic: 'pong',
        sourceId: 'realtime-server',
        timestamp: Date.now(),
        payload: {
          serverTime: Date.now(),
          echoMessageId: message.messageId || undefined,
        },
      };
      socket.send(JSON.stringify(pongEnvelope));
      return;
    }

    if (
      message.topic === 'agv.created' ||
      message.topic === 'alert.assigned' ||
      message.topic === 'alert.updated' ||
      message.topic === 'alert.closed'
    ) {
      broadcast(JSON.stringify(message), socket);
    }
  });
});

server.listen(PORT, () => {
  console.log(`[realtime-server] listening on http://127.0.0.1:${PORT}`);
  console.log(`[realtime-server] ws endpoint ws://127.0.0.1:${PORT}${WS_PATH}`);
});

server.on('error', (error) => {
  if (error && error.code === 'EADDRINUSE') {
    console.error(`[realtime-server] port ${PORT} already in use`);
    process.exit(1);
  }
  console.error('[realtime-server] server error', error);
  process.exit(1);
});
