import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Username from command line or default to 'admin'
const username = process.argv[2] || 'admin';
const ADMIN_SECRET = process.env.ADMIN_SECRET;

if (!ADMIN_SECRET) {
  console.error('ADMIN_SECRET not found in .env file');
  process.exit(1);
}

async function unlockAccountViaAPI() {
  try {
    console.log(`Attempting to unlock account "${username}"...`);
    
    const response = await axios.post('http://localhost:5000/api/auth/unlock-account', {
      username,
      adminSecret: ADMIN_SECRET
    });
    
    console.log('Success:', response.data.message);
    console.log(`Account "${response.data.username}" has been unlocked`);
  } catch (error) {
    console.error('Error unlocking account:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data.message}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server. Is the server running?');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
  }
}

unlockAccountViaAPI(); 