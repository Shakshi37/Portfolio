import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  issuer: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date
  },
  credentialId: {
    type: String
  },
  credentialUrl: {
    type: String
  },
  imageUrl: {
    type: String,
    required: true
  },
  skills: [{
    type: String
  }],
  description: {
    type: String
  }
}, {
  timestamps: true
});

export const Certificate = mongoose.model('Certificate', certificateSchema); 