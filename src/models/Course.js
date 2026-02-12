const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  learners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  modules: [{
    title: String,
    content: String,
    resources: [String],
    order: Number
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
