const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['patient', 'nurse'], required: true },

    assignedNurseId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    expoPushToken: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
