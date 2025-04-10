import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

// Initialize router
const router = express.Router();

// Create a middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  try {
    // Get token from secure cookie first, then try Authorization header
    const token = req.cookies?.accessToken || 
                 req.headers.authorization?.split(' ')[1] || 
                 req.query.token;
    
    if (!token) {
      logger.debug('Access denied: No token provided');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check token expiration
    if (decoded.exp < Date.now() / 1000) {
      logger.debug('Token expired:', { userId: decoded.id, username: decoded.username });
      return res.status(401).json({ message: 'Token expired.' });
    }
    
    req.user = decoded;
    logger.debug('Token verified successfully:', { userId: decoded.id, username: decoded.username });
    next();
  } catch (error) {
    logger.error('Token verification error:', { error: error.message });
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Generate tokens
const generateTokens = (user) => {
  // Access token - short lived (15 minutes)
  const accessToken = jwt.sign(
    { id: user._id, username: user.username, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // 15 minutes
  );
  
  // Refresh token - longer lived (7 days)
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' } // 7 days
  );
  
  return { accessToken, refreshToken };
};

// Set secure cookies
const setTokenCookies = (res, accessToken, refreshToken) => {
  // Set HttpOnly cookies for security - these can't be accessed by JavaScript
  // Set Secure flag only in production environments
  const secureCookie = process.env.NODE_ENV === 'production';
  
  // Common cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: secureCookie,
    sameSite: 'lax', // Use 'lax' for cross-origin compatibility
    maxAge: 15 * 60 * 1000 // 15 minutes in milliseconds
  };
  
  // Access token cookie - short lived
  res.cookie('accessToken', accessToken, cookieOptions);
  
  // Refresh token cookie - longer lived
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    path: '/', // Set path to root to ensure it's sent with all requests
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });
  
  // For debugging
  logger.debug('Cookies set:', {
    accessToken: 'set',
    refreshToken: 'set'
  });
};

// Register route (for admin use only - you may want to secure this further)
router.post('/register', async (req, res) => {
  try {
    logger.info('Registration attempt:', { username: req.body.username });
    const { username, password, adminSecret } = req.body;
    
    // Check if admin secret is correct (for adding the first admin or other users)
    if (adminSecret !== process.env.ADMIN_SECRET) {
      logger.warn('Registration failed: Invalid admin secret');
      return res.status(403).json({ message: 'Not authorized to create users' });
    }
    
    // Check if user already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      logger.warn('Registration failed: User already exists', { username });
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user (isAdmin determined by the route or additional parameters)
    const newUser = new User({
      username,
      password,
      isAdmin: true // Make first user admin or control this via request
    });
    
    await newUser.save();
    
    logger.info('User registered successfully:', { username, isAdmin: true });
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    logger.error('Registration error:', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    logger.info('Login attempt:', { username: req.body.username });
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      logger.warn('Login failed: User not found', { username });
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    
    // Check if account is locked
    if (user.locked) {
      // If lock time has passed, unlock the account
      if (user.lockUntil && user.lockUntil < new Date()) {
        user.locked = false;
        user.loginAttempts = 0;
        user.lockUntil = null;
        await user.save();
        logger.info('Account unlocked automatically:', { username });
      } else {
        // Calculate time remaining in minutes
        const minutesRemaining = Math.ceil((user.lockUntil - new Date()) / (60 * 1000));
        logger.warn('Login failed: Account locked', { username, minutesRemaining });
        return res.status(403).json({ 
          message: `Account is temporarily locked. Please try again in ${minutesRemaining} minutes.` 
        });
      }
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Record failed attempt
      await user.recordLoginAttempt(false);
      
      // Check if account is now locked
      if (user.locked) {
        logger.warn('Login failed: Too many attempts, account locked', { username });
        return res.status(403).json({ 
          message: 'Too many failed login attempts. Account is locked for 30 minutes.' 
        });
      }
      
      logger.warn('Login failed: Invalid password', { username });
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    
    // Record successful login
    await user.recordLoginAttempt(true);
    
    // Generate tokens
    const tokens = generateTokens(user);
    const accessToken = tokens.accessToken;
    const refreshToken = tokens.refreshToken;
    
    // Store refresh token in database
    user.refreshToken = refreshToken;
    await user.save();
    
    logger.info('Login successful:', { username, userId: user._id });
    
    // Set cookies
    setTokenCookies(res, accessToken, refreshToken);
    
    // Add authorization header as well
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    
    // Send tokens in response (for clients that can't use cookies)
    res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    logger.error('Login error:', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Refresh token route
router.post('/refresh', async (req, res) => {
  try {
    logger.info('Refresh token request');
    logger.debug('Request cookies:', req.cookies);
    logger.debug('Headers:', req.headers);
    
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      logger.warn('Refresh token not found in cookies');
      // Return a more helpful error message
      return res.status(401).json({ 
        message: 'Refresh token not found',
        cookies: req.cookies,
        tip: 'Make sure cookies are enabled in your browser and that the refreshToken cookie is being sent'
      });
    }
    
    logger.debug('Attempting to verify refresh token');
    
    // Verify the refresh token
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
    
    logger.debug('Refresh token verified, finding user:', { userId: decoded.id });
    
    // Find the user with this id and matching refresh token
    const user = await User.findById(decoded.id);
    
    if (!user) {
      logger.warn('User not found for refresh token:', { userId: decoded.id });
      return res.status(403).json({ message: 'Invalid refresh token - user not found' });
    }
    
    // User found, now check refresh token
    if (user.refreshToken !== refreshToken) {
      logger.warn('Stored token does not match provided token', {
        userId: user._id,
        username: user.username
      });
      return res.status(403).json({ message: 'Invalid refresh token - token mismatch' });
    }
    
    logger.info('Generating new tokens for user:', { userId: user._id, username: user.username });
    
    // Generate new tokens
    const tokens = generateTokens(user);
    const accessToken = tokens.accessToken;
    const newRefreshToken = tokens.refreshToken;
    
    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();
    
    logger.debug('Setting new cookies');
    
    // Set new cookies
    setTokenCookies(res, accessToken, newRefreshToken);
    
    res.status(200).json({
      message: 'Token refreshed successfully',
      accessToken
    });
  } catch (error) {
    logger.error('Refresh token error:', { error: error.message, stack: error.stack });
    return res.status(403).json({ 
      message: 'Invalid refresh token - validation failed',
      details: error.message 
    });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  try {
    logger.info('Logout request');
    
    // Get the current user if logged in
    const token = req.cookies?.accessToken || 
                 req.headers.authorization?.split(' ')[1];
    
    if (token) {
      try {
        // Try to decode the token to get the user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (user) {
          // Clear the refresh token in the database
          user.refreshToken = null;
          await user.save();
          logger.info('User logged out:', { userId: user._id, username: user.username });
        }
      } catch (error) {
        // Token might be invalid, just continue with logout
        logger.warn('Error during logout cleanup:', { error: error.message });
      }
    }
    
    // Common cookie options - match the ones used when setting cookies
    const secureCookie = process.env.NODE_ENV === 'production';
    
    const cookieOptions = {
      httpOnly: true,
      secure: secureCookie,
      sameSite: 'lax'
    };
    
    // Clear the auth cookies with matching options
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', { 
      ...cookieOptions,
      path: '/' 
    });
    
    logger.debug('Cookies cleared');
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error during logout' });
  }
});

// Verify token route (to check if user is authenticated)
router.get('/verify', verifyToken, (req, res) => {
  logger.info('Token verification successful:', { userId: req.user.id, username: req.user.username });
  res.status(200).json({ 
    authenticated: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      isAdmin: req.user.isAdmin
    }
  });
});

// Unlock account route (admin only)
router.post('/unlock-account', async (req, res) => {
  try {
    logger.info('Account unlock attempt:', { username: req.body.username });
    const { username, adminSecret } = req.body;
    
    // Verify admin privileges using the admin secret
    if (adminSecret !== process.env.ADMIN_SECRET) {
      logger.warn('Account unlock failed: Invalid admin secret');
      return res.status(403).json({ message: 'Not authorized to unlock accounts' });
    }
    
    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
      logger.warn('Account unlock failed: User not found', { username });
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Reset account lock
    user.locked = false;
    user.loginAttempts = 0;
    user.lockUntil = null;
    
    await user.save();
    
    logger.info('Account unlocked successfully:', { username });
    
    res.status(200).json({ 
      message: 'Account unlocked successfully',
      username: user.username
    });
  } catch (error) {
    logger.error('Error unlocking account:', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error unlocking account' });
  }
});

// Add a diagnostic endpoint for checking auth status
router.get('/status', (req, res) => {
  logger.info('Auth Status Check');
  
  // Check cookies
  logger.debug('Cookies received:', req.cookies);
  logger.debug('Request headers:', req.headers);
  
  // Check if we have a token
  const token = req.cookies?.accessToken || 
               req.headers.authorization?.split(' ')[1] ||
               req.query.token;
  
  let tokenStatus = 'No token found';
  let decodedToken = null;
  
  if (token) {
    try {
      // Try to decode without verifying signature
      decodedToken = jwt.decode(token);
      tokenStatus = 'Token found and decoded';
      
      // Try to verify the token
      jwt.verify(token, process.env.JWT_SECRET);
      tokenStatus = 'Token is valid';
      logger.debug('Token verification successful:', { userId: decodedToken.id });
    } catch (error) {
      tokenStatus = `Token verification failed: ${error.message}`;
      logger.warn('Token verification failed:', { error: error.message });
    }
  }
  
  res.json({
    authStatus: {
      cookies: {
        hasAccessToken: !!req.cookies?.accessToken,
        hasRefreshToken: !!req.cookies?.refreshToken,
      },
      headers: {
        hasAuthHeader: !!req.headers.authorization,
      },
      token: {
        status: tokenStatus,
        decoded: decodedToken
      }
    }
  });
});

export const authRouter = router; 