import express from 'express';
import { Certificate } from '../models/Certificate.js';

const router = express.Router();

// Get all certificates
router.get('/', async (req, res) => {
  try {
    const certificates = await Certificate.find();
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single certificate
router.get('/:id', async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new certificate
router.post('/', async (req, res) => {
  const certificate = new Certificate(req.body);
  try {
    const newCertificate = await certificate.save();
    res.status(201).json(newCertificate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a certificate
router.patch('/:id', async (req, res) => {
  try {
    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    res.json(certificate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a certificate
router.delete('/:id', async (req, res) => {
  try {
    const certificate = await Certificate.findByIdAndDelete(req.params.id);
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    res.json({ message: 'Certificate deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const certificateRouter = router; 