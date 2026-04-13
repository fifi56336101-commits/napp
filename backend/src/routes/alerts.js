const express = require('express');

const { requireDb } = require('../middleware/requireDb');
const { requireAuth, requireRole } = require('../middleware/auth');
const Alert = require('../models/Alert');
const User = require('../models/User');
const { sendPush } = require('../push');

const router = express.Router();

router.post('/', requireDb, requireAuth, requireRole('patient'), async (req, res) => {
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'Missing message' });

  const patient = await User.findById(req.user.sub);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  if (!patient.assignedNurseId) {
    return res.status(400).json({ error: 'No nurse assigned to this patient' });
  }

  const nurse = await User.findById(patient.assignedNurseId);
  if (!nurse) return res.status(400).json({ error: 'Assigned nurse not found' });

  const alert = await Alert.create({
    patientId: patient._id,
    nurseId: nurse._id,
    message: String(message),
  });

  const pushResult = await sendPush(
    nurse.expoPushToken,
    'Changement important',
    `${patient.name}: ${String(message).slice(0, 120)}`,
    { alertId: String(alert._id), patientId: String(patient._id) }
  );

  return res.status(201).json({ alert, push: pushResult });
});

module.exports = router;
