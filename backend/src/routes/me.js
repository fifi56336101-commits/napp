const express = require('express');

const { requireDb } = require('../middleware/requireDb');
const { requireAuth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.get('/', requireDb, requireAuth, async (req, res) => {
  const user = await User.findById(req.user.sub).select('-passwordHash');
  if (!user) return res.status(404).json({ error: 'Not found' });
  return res.json({ user });
});

router.post('/push-token', requireDb, requireAuth, async (req, res) => {
  const { expoPushToken } = req.body || {};
  if (!expoPushToken) return res.status(400).json({ error: 'Missing expoPushToken' });

  await User.updateOne({ _id: req.user.sub }, { $set: { expoPushToken: String(expoPushToken) } });
  return res.json({ ok: true });
});

module.exports = router;
