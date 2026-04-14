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

router.patch('/', requireDb, requireAuth, async (req, res) => {
  const { name, nurseEmail } = req.body || {};
  
  const updates = {};
  
  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    updates.name = name.trim();
  }
  
  if (nurseEmail !== undefined) {
    const email = nurseEmail ? nurseEmail.trim().toLowerCase() : null;
    updates.nurseEmail = email;
    
    // Link the nurse by assignedNurseId
    if (email) {
      const nurse = await User.findOne({ email, role: 'nurse' });
      if (nurse) {
        updates.assignedNurseId = nurse._id;
      }
    } else {
      updates.assignedNurseId = null;
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const user = await User.findByIdAndUpdate(
    req.user.sub,
    { $set: updates },
    { new: true }
  ).select('-passwordHash');

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
