import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { projectRouter } from './routes/projects.js';
import { skillRouter } from './routes/skills.js';
import { certificateRouter } from './routes/certificates.js';
import { experienceRouter } from './routes/experiences.js';
import { contactRouter } from './routes/contact.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/projects', projectRouter);
app.use('/api/skills', skillRouter);
app.use('/api/certificates', certificateRouter);
app.use('/api/experiences', experienceRouter);
app.use('/api/contact', contactRouter);

// CV download route
app.get('/api/download-cv', (req, res) => {
  const cvPath = path.join(__dirname, 'public', 'Shakshi_Thakur.pdf');
  res.download(cvPath, 'john-doe-cv.pdf');
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Check if MongoDB URI is available
    if (!process.env.MONGO_URI) {
      console.error('MongoDB URI is not defined in environment variables');
      console.log('Starting server without MongoDB connection');
      
      // Start server without MongoDB
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} (without MongoDB)`);
      });
      return;
    }
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    // Start server even if MongoDB connection fails
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} (without MongoDB)`);
    });
  }
};

startServer();