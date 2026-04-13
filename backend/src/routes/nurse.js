const express = require('express');

const { requireDb } = require('../middleware/requireDb');
const { requireAuth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const DailyReport = require('../models/DailyReport');
const Alert = require('../models/Alert');

const router = express.Router();

router.get('/patients', requireDb, requireAuth, requireRole('nurse'), async (req, res) => {
  const patients = await User.find({ role: 'patient', assignedNurseId: req.user.sub })
    .select('name email createdAt')
    .sort({ createdAt: -1 });

  if (patients.length === 0) {
    return res.json({ patients: [] });
  }

  const patientIds = patients.map((p) => p._id);

  const reportStats = await DailyReport.aggregate([
    { $match: { patientId: { $in: patientIds } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$patientId',
        count: { $sum: 1 },
        lastDate: { $first: '$createdAt' },
      },
    },
  ]);

  const statsByPatientId = new Map(reportStats.map((s) => [String(s._id), s]));

  const patientsWithStats = patients.map((p) => {
    const stats = statsByPatientId.get(String(p._id));
    return {
      ...p.toObject(),
      reportCount: stats?.count || 0,
      lastReportAt: stats?.lastDate || null,
    };
  });

  return res.json({ patients: patientsWithStats });
});

router.get('/patients/:patientId/history', requireDb, requireAuth, requireRole('nurse'), async (req, res) => {
  const { patientId } = req.params;

  const patient = await User.findOne({ _id: patientId, role: 'patient', assignedNurseId: req.user.sub }).select(
    'name email createdAt'
  );
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const reports = await DailyReport.find({ patientId: patient._id }).sort({ createdAt: -1 }).limit(120);
  const alerts = await Alert.find({ patientId: patient._id, nurseId: req.user.sub }).sort({ createdAt: -1 }).limit(120);

  return res.json({ patient, reports, alerts });
});

router.get('/alerts', requireDb, requireAuth, requireRole('nurse'), async (req, res) => {
  const alerts = await Alert.find({ nurseId: req.user.sub }).sort({ createdAt: -1 }).limit(120);
  return res.json({ alerts });
});

router.post('/alerts/:alertId/resolve', requireDb, requireAuth, requireRole('nurse'), async (req, res) => {
  const { alertId } = req.params;
  const alert = await Alert.findOneAndUpdate(
    { _id: alertId, nurseId: req.user.sub },
    { $set: { resolved: true } },
    { new: true }
  );
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  return res.json({ alert });
});

module.exports = router;
