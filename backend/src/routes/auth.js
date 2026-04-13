const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { requireDb } = require('../middleware/requireDb');
const User = require('../models/User');

const router = express.Router();

function signToken(user) {
  const secret = process.env.JWT_SECRET || 'change-me';
  return jwt.sign({ sub: String(user._id), role: user.role }, secret, { expiresIn: '30d' });
}

router.post('/register', requireDb, async (req, res) => {
  const { name, email, password, role, nurseEmail } = req.body || {};

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!['patient', 'nurse'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const existing = await User.findOne({ email: String(email).toLowerCase() });
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  let assignedNurseId = null;
  if (role === 'patient' && nurseEmail) {
    const nurse = await User.findOne({ email: String(nurseEmail).toLowerCase(), role: 'nurse' });
    if (!nurse) return res.status(400).json({ error: 'Nurse not found' });
    assignedNurseId = nurse._id;
  }

  const passwordHash = await bcrypt.hash(String(password), 10);

  const user = await User.create({
    name: String(name).trim(),
    email: String(email).toLowerCase().trim(),
    passwordHash,
    role,
    assignedNurseId,
  });

  const token = signToken(user);
  return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.post('/login', requireDb, async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing email/password' });

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken(user);
  return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

module.exports = router;
