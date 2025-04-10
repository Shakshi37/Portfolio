import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the server root directory
// dotenv.config({ path: path.join(__dirname, '..', '.env') }); // Removed this line

// console.log('Email credentials:', { // Removed top-level console.log
//   user: process.env.EMAIL_USER,
//   pass: process.env.EMAIL_PASSWORD ? 'Password is set' : 'Password is missing'
// });

const router = express.Router();

// Create a transporter using Gmail SMTP
// Moved transporter creation logic inside the route handler
// let transporter;
// try {
//   if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
//     console.warn('Email credentials are missing. Email functionality will not work.');
//   } else {
//     transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASSWORD
//       }
//     });
//     console.log('Email transporter created successfully');
//   }
// } catch (error) {
//   console.error('Error creating email transporter:', error);
// }

// Contact form submission route
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  // Moved transporter creation inside the handler
  let transporter;
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email credentials are missing. Cannot create transporter.');
    } else {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      // Optional: Log successful creation inside handler if needed
      // console.log('Email transporter created for request');
    }
  } catch (error) {
    console.error('Error creating email transporter:', error);
    // Ensure transporter remains undefined or null if creation fails
    transporter = null;
  }

  // Check if email functionality is available
  if (!transporter) {
    console.error('Email service is unavailable. Transporter failed to initialize.');
    // Log the env vars here for debugging
    console.log('Checked ENV Vars:', { user: process.env.EMAIL_USER, pass_present: !!process.env.EMAIL_PASSWORD });
    return res.status(503).json({ 
      message: 'Email service is not available due to configuration issue. Please contact support.' 
      // Avoid exposing direct contact info if service is broken
    });
  }

  try {
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Your Gmail address
      subject: `New Contact Form Submission from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

export const contactRouter = router; 