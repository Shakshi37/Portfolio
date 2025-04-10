import bcrypt from 'bcrypt';

// Generate hashed password
const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds)
  .then(hash => {
    console.log('Hashed password:', hash);
  })
  .catch(err => {
    console.error('Error generating hash:', err);
  }); 