const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const { connectMongoIfConfigured } = require('./db');
const { routes } = require('./routes');

async function createApp() {
  dotenv.config();

  const app = express();

  app.use(
    cors({
      origin: (origin, cb) => {
        const allowed = (process.env.CORS_ORIGINS || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        if (allowed.length === 0) return cb(null, true);
        if (!origin) return cb(null, true);
        if (allowed.includes(origin)) return cb(null, true);
        return cb(new Error('CORS blocked'), false);
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '1mb' }));

  const dbState = await connectMongoIfConfigured();
  app.locals.db = dbState;

  app.get('/health', (req, res) => {
    res.json({
      ok: true,
      db: dbState.connected ? 'connected' : 'disabled',
      time: new Date().toISOString(),
    });
  });

  app.use('/api', routes());

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
