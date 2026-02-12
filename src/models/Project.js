const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  status: { type: String, enum: ['pending', 'in_progress', 'review', 'completed'], default: 'pending' },
  milestones: [{
    title: String,
    description: String,
    dueDate: Date,
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
  }],
  submissions: [{
    fileUrl: String,
    comment: String,
    submittedAt: { type: Date, default: Date.now }
  }],
  grade: { type: Number, min: 0, max: 100 }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
