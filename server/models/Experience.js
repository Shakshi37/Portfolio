import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  current: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    required: true
  },
  responsibilities: [{
    type: String
  }],
  technologies: [{
    type: String
  }],
  companyLogo: {
    type: String
  },
  achievements: [{
    type: String
  }]
}, {
  timestamps: true
});

export const Experience = mongoose.model('Experience', experienceSchema); 