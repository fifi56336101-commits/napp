const mongoose = require('mongoose');

const DailyReportSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    fatigue: { type: Number, min: 0, max: 10, required: true },
    pain: { type: Number, min: 0, max: 10, required: true },
    walkingDifficulty: { type: Number, min: 0, max: 10, required: true },
    vision: { type: Number, min: 0, max: 10, required: true },

    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

DailyReportSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model('DailyReport', DailyReportSchema);
