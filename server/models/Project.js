import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  technologies: [{
    type: String,
    required: true
  }],
  demoLink: {
    type: String,
    required: true
  },
  githubLink: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export const Project = mongoose.model('Project', projectSchema);