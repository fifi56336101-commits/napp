const mongoose = require('mongoose');

async function connectMongoIfConfigured() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.warn('[backend] MONGO_URI not set; DB-backed endpoints will return 503');
    return { connected: false };
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri);
  console.log('[backend] connected to MongoDB');
  return { connected: true };
}

module.exports = { connectMongoIfConfigured };
