function requireDb(req, res, next) {
  const db = req.app.locals.db;
  if (!db || !db.connected) {
    return res.status(503).json({ error: 'Database not configured. Set MONGO_URI in .env.' });
  }
  return next();
}

module.exports = { requireDb };
