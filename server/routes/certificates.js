import express from 'express';
import Certificate from '../models/Certificate.js';
import { verifyToken } from '../routes/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get all certificates for the authenticated user
router.get('/', verifyToken, async (req, res) => {
  try {
    logger.info('Fetching certificates for user:', { userId: req.user._id });
    
    const certificates = await Certificate.find({ user: req.user._id });
    
    logger.debug(`Found ${certificates.length} certificates for user:`, { userId: req.user._id });
    
    res.status(200).json(certificates);
  } catch (error) {
    logger.error('Error fetching certificates:', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user._id 
    });
    res.status(500).json({ message: 'Error fetching certificates' });
  }
});

// Get a single certificate
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!certificate) {
      logger.warn('Certificate not found:', { 
        certificateId: req.params.id,
        userId: req.user._id 
      });
      return res.status(404).json({ message: 'Certificate not found' });
    }
    
    res.json(certificate);
  } catch (error) {
    logger.error('Error fetching certificate:', {
      error: error.message,
      stack: error.stack,
      certificateId: req.params.id,
      userId: req.user._id
    });
    res.status(500).json({ message: error.message });
  }
});

// Create a new certificate
router.post('/', verifyToken, async (req, res) => {
  try {
    logger.info('Creating new certificate for user:', { 
      userId: req.user._id,
      certificateTitle: req.body.title 
    });
    
    const { title, issuer, issueDate, expiryDate, credentialId, credentialUrl, imageUrl } = req.body;
    
    // Validate required fields
    if (!title || !issuer || !issueDate || !imageUrl) {
      logger.warn('Certificate creation failed: Missing required fields', { 
        userId: req.user._id,
        providedFields: { title, issuer, issueDate, imageUrl } 
      });
      return res.status(400).json({ message: 'Title, issuer, issue date, and image URL are required' });
    }
    
    const newCertificate = new Certificate({
      title,
      issuer,
      issueDate,
      expiryDate,
      credentialId,
      credentialUrl,
      imageUrl,
      user: req.user._id
    });
    
    await newCertificate.save();
    
    logger.info('Certificate created successfully:', { 
      userId: req.user._id,
      certificateId: newCertificate._id,
      title: newCertificate.title 
    });
    
    res.status(201).json(newCertificate);
  } catch (error) {
    logger.error('Error creating certificate:', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user._id 
    });
    res.status(500).json({ message: 'Error creating certificate' });
  }
});

// Update a certificate
router.put('/:id', verifyToken, async (req, res) => {
  try {
    logger.info('Updating certificate:', { 
      userId: req.user._id,
      certificateId: req.params.id 
    });
    
    const certificate = await Certificate.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!certificate) {
      logger.warn('Certificate update failed: Certificate not found', { 
        userId: req.user._id,
        certificateId: req.params.id 
      });
      return res.status(404).json({ message: 'Certificate not found' });
    }
    
    // Update fields
    const { title, issuer, issueDate, expiryDate, credentialId, credentialUrl, imageUrl } = req.body;
    
    if (title) certificate.title = title;
    if (issuer) certificate.issuer = issuer;
    if (issueDate) certificate.issueDate = issueDate;
    if (expiryDate !== undefined) certificate.expiryDate = expiryDate;
    if (credentialId) certificate.credentialId = credentialId;
    if (credentialUrl) certificate.credentialUrl = credentialUrl;
    if (imageUrl) certificate.imageUrl = imageUrl;
    
    await certificate.save();
    
    logger.info('Certificate updated successfully:', { 
      userId: req.user._id,
      certificateId: certificate._id,
      title: certificate.title 
    });
    
    res.status(200).json(certificate);
  } catch (error) {
    logger.error('Error updating certificate:', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user._id,
      certificateId: req.params.id 
    });
    res.status(500).json({ message: 'Error updating certificate' });
  }
});

// Delete a certificate
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    logger.info('Deleting certificate:', { 
      userId: req.user._id,
      certificateId: req.params.id 
    });
    
    const certificate = await Certificate.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!certificate) {
      logger.warn('Certificate deletion failed: Certificate not found', { 
        userId: req.user._id,
        certificateId: req.params.id 
      });
      return res.status(404).json({ message: 'Certificate not found' });
    }
    
    await Certificate.findByIdAndDelete(req.params.id);
    
    logger.info('Certificate deleted successfully:', { 
      userId: req.user._id,
      certificateId: req.params.id 
    });
    
    res.status(200).json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    logger.error('Error deleting certificate:', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user._id,
      certificateId: req.params.id 
    });
    res.status(500).json({ message: 'Error deleting certificate' });
  }
});

export const certificateRouter = router; 