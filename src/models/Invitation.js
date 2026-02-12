const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['learner', 'mentor', 'admin'], required: true },
  token: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt: { type: Date, default: () => new Date(+new Date() + 7*24*60*60*1000) }
}, { timestamps: true });

module.exports = mongoose.model('Invitation', invitationSchema);
