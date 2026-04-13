const express = require('express');

const { requireDb } = require('../middleware/requireDb');
const { requireAuth, requireRole } = require('../middleware/auth');
const DailyReport = require('../models/DailyReport');

const router = express.Router();

router.post('/', requireDb, requireAuth, requireRole('patient'), async (req, res) => {
  const { fatigue, pain, walkingDifficulty, vision, comment } = req.body || {};

  const report = await DailyReport.create({
    patientId: req.user.sub,
    fatigue: Number(fatigue),
    pain: Number(pain),
    walkingDifficulty: Number(walkingDifficulty),
    vision: Number(vision),
    comment: comment ? String(comment) : '',
  });

  return res.status(201).json({ report });
});

router.get('/me', requireDb, requireAuth, requireRole('patient'), async (req, res) => {
  const reports = await DailyReport.find({ patientId: req.user.sub }).sort({ createdAt: -1 }).limit(60);
  return res.json({ reports });
});

module.exports = router;
