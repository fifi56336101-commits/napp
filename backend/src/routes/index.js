const express = require('express');

const authRoutes = require('./auth');
const meRoutes = require('./me');
const reportRoutes = require('./reports');
const alertRoutes = require('./alerts');
const nurseRoutes = require('./nurse');

function routes() {
  const router = express.Router();

  router.use('/auth', authRoutes);
  router.use('/me', meRoutes);
  router.use('/reports', reportRoutes);
  router.use('/alerts', alertRoutes);
  router.use('/nurse', nurseRoutes);

  return router;
}

module.exports = { routes };
