import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI not found in .env file');
  process.exit(1);
}

// Get username from command line arguments
const username = process.argv[2];

if (!username) {
  console.error('Please provide a username to unlock');
  console.error('Usage: node unlockAccount.js <username>');
  process.exit(1);
}

async function unlockAccount() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ username });
    
    if (!user) {
      console.error(`User "${username}" not found`);
      await mongoose.connection.close();
      process.exit(1);
    }

    // Check if account is actually locked
    if (!user.locked) {
      console.log(`Account "${username}" is not locked`);
      await mongoose.connection.close();
      return;
    }

    // Reset account lock
    user.locked = false;
    user.loginAttempts = 0;
    user.lockUntil = null;
    
    await user.save();
    
    console.log(`Account "${username}" has been successfully unlocked`);

    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error unlocking account:', error);
    process.exit(1);
  }
}

unlockAccount(); 