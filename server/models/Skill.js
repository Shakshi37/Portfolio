import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  items: [{
    type: String,
    required: true
  }]
}, {
  timestamps: true
});

export const Skill = mongoose.model('Skill', skillSchema);