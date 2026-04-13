const http = require('http');

const { createApp } = require('./src/app');

async function start() {
  const app = await createApp();

  const port = Number(process.env.PORT || 3001);
  const server = http.createServer(app);

  server.listen(port, () => {
    console.log(`[backend] listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error('[backend] failed to start', err);
  process.exit(1);
});
