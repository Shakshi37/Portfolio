import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv to look for .env file in the root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { projectRouter } from './routes/projects.js';
import { skillRouter } from './routes/skills.js';
import { certificateRouter } from './routes/certificates.js';
import { experienceRouter } from './routes/experiences.js';
import { contactRouter } from './routes/contact.js';
import { authRouter, verifyToken } from './routes/auth.js';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import logger, { logRoute } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cookieParser()); // For parsing cookies - move this BEFORE CORS

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Include all frontend origins
  credentials: true, // Allow credentials (cookies)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// HTTP request logging with Morgan
app.use(morgan('combined', { stream: logger.stream }));

// Route logging middleware
app.use(logRoute);

// Serve static files from the public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Public routes
app.use('/api/auth', authRouter);

// Protected routes - require authentication
app.use('/api/projects', verifyToken, projectRouter);
app.use('/api/skills', verifyToken, skillRouter);
app.use('/api/certificates', verifyToken, certificateRouter);
app.use('/api/experiences', verifyToken, experienceRouter);
app.use('/api/contact', verifyToken, contactRouter);

// Protected CV download route
app.get('/api/download-cv', verifyToken, (req, res) => {
  const cvPath = path.join(__dirname, 'public', 'Shakshi_Thakur.pdf');
  res.download(cvPath, 'Shakshi_Thakur.pdf');
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

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});