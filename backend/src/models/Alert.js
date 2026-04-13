const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    nurseId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AlertSchema.index({ nurseId: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', AlertSchema);
