// server/server.js

const app = require('./app');
const http = require('http');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 QR Box v2.1 server running on http://localhost:${PORT}`);
});
