import express from 'express';
import Experience from '../models/Experience.js';
import { verifyToken } from './auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get all experiences for the authenticated user
router.get('/', verifyToken, async (req, res) => {
  try {
    logger.info('Fetching experiences for user:', { userId: req.user._id });
    
    const experiences = await Experience.find({ user: req.user._id });
    
    logger.debug(`Found ${experiences.length} experiences for user:`, { userId: req.user._id });
    
    res.status(200).json(experiences);
  } catch (error) {
    logger.error('Error fetching experiences:', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user._id 
    });
    res.status(500).json({ message: 'Error fetching experiences' });
  }
});

// Get a single experience
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const experience = await Experience.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!experience) {
      logger.warn('Experience not found:', { 
        experienceId: req.params.id,
        userId: req.user._id 
      });
      return res.status(404).json({ message: 'Experience not found' });
    }
    
    res.json(experience);
  } catch (error) {
    logger.error('Error fetching experience:', {
      error: error.message,
      stack: error.stack,
      experienceId: req.params.id,
      userId: req.user._id
    });
    res.status(500).json({ message: error.message });
  }
});

// Create a new experience
router.post('/', verifyToken, async (req, res) => {
  try {
    logger.info('Creating new experience for user:', { 
      userId: req.user._id,
      experienceTitle: req.body.title 
    });
    
    const { title, company, location, startDate, endDate, current, description } = req.body;
    
    // Validate required fields
    if (!title || !company || !startDate) {
      logger.warn('Experience creation failed: Missing required fields', { 
        userId: req.user._id,
        providedFields: { title, company, startDate } 
      });
      return res.status(400).json({ message: 'Title, company, and start date are required' });
    }
    
    const newExperience = new Experience({
      title,
      company,
      location,
      startDate,
      endDate,
      current: current || false,
      description,
      user: req.user._id
    });
    
    await newExperience.save();
    
    logger.info('Experience created successfully:', { 
      userId: req.user._id,
      experienceId: newExperience._id,
      title: newExperience.title 
    });
    
    res.status(201).json(newExperience);
  } catch (error) {
    logger.error('Error creating experience:', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user._id 
    });
    res.status(500).json({ message: 'Error creating experience' });
  }
});

// Update an experience
router.put('/:id', verifyToken, async (req, res) => {
  try {
    logger.info('Updating experience:', { 
      userId: req.user._id,
      experienceId: req.params.id 
    });
    
    const experience = await Experience.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!experience) {
      logger.warn('Experience update failed: Experience not found', { 
        userId: req.user._id,
        experienceId: req.params.id 
      });
      return res.status(404).json({ message: 'Experience not found' });
    }
    
    // Update fields
    const { title, company, location, startDate, endDate, current, description } = req.body;
    
    if (title) experience.title = title;
    if (company) experience.company = company;
    if (location) experience.location = location;
    if (startDate) experience.startDate = startDate;
    if (endDate !== undefined) experience.endDate = endDate;
    if (current !== undefined) experience.current = current;
    if (description) experience.description = description;
    
    await experience.save();
    
    logger.info('Experience updated successfully:', { 
      userId: req.user._id,
      experienceId: experience._id,
      title: experience.title 
    });
    
    res.status(200).json(experience);
  } catch (error) {
    logger.error('Error updating experience:', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user._id,
      experienceId: req.params.id 
    });
    res.status(500).json({ message: 'Error updating experience' });
  }
});

// Delete an experience
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    logger.info('Deleting experience:', { 
      userId: req.user._id,
      experienceId: req.params.id 
    });
    
    const experience = await Experience.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!experience) {
      logger.warn('Experience deletion failed: Experience not found', { 
        userId: req.user._id,
        experienceId: req.params.id 
      });
      return res.status(404).json({ message: 'Experience not found' });
    }
    
    await Experience.findByIdAndDelete(req.params.id);
    
    logger.info('Experience deleted successfully:', { 
      userId: req.user._id,
      experienceId: req.params.id 
    });
    
    res.status(200).json({ message: 'Experience deleted successfully' });
  } catch (error) {
    logger.error('Error deleting experience:', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user._id,
      experienceId: req.params.id 
    });
    res.status(500).json({ message: 'Error deleting experience' });
  }
});

export const experienceRouter = router; 