const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../models'); // Import sequelize instance
const crypto = require('crypto');
const { sendResetPasswordEmail } = require('../emailService');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');

const router = express.Router();

// Move the authenticateToken function to the top of the file
const authenticateToken = (req, res, next) => {
  logger.debug('Authenticating request:', {
    path: req.path,
    method: req.method,
    hasAuthHeader: !!req.headers.authorization
  });

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('Authentication failed - no token provided:', {
      path: req.path,
      headers: req.headers
    });
    return res.status(401).json({ message: 'No authentication token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Enhanced validation of the decoded token
    if (!decoded || typeof decoded !== 'object') {
      logger.error('Token verification failed - invalid token structure');
      return res.status(403).json({ message: 'Invalid token structure' });
    }

    // Ensure the ID is a valid number
    const userId = parseInt(decoded.id, 10);
    if (isNaN(userId)) {
      logger.error('Token verification failed - invalid user ID format:', decoded.id);
      return res.status(403).json({ message: 'Invalid user ID in token' });
    }

    // Create a clean user object
    req.user = { id: userId };
    
    logger.debug('Token verified successfully:', {
      userId,
      path: req.path,
      method: req.method
    });

    next();
  } catch (error) {
    logger.error('Token verification failed:', {
      error: error.message,
      path: req.path,
      token: token ? token.substring(0, 10) + '...' : 'none'
    });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token' });
    }

    return res.status(403).json({ message: 'Token verification failed' });
  }
};

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await sequelize.models.User.create({ email, password: hashedPassword });
    
    logger.info({ email }, 'User registered successfully');
    return res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      logger.warn({ email: req.body.email }, 'Registration failed - email already exists');
      return res.status(400).json({ message: 'An account is already registered under that email address.' });
    }
    logger.error({ err: error, email: req.body.email }, 'Error creating user');
    return res.status(500).json({ message: 'Error creating user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.debug('Login attempt details:', {
      email,
      hasPassword: !!password,
      headers: req.headers
    });
    
    const user = await sequelize.models.User.findOne({ where: { email } });
    if (!user) {
      logger.warn('Login failed - user not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    logger.debug('User found:', {
      id: user.id,
      email: user.email,
      hasPassword: !!user.password
    });
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn('Login failed - invalid password for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Ensure user.id is a number and create a clean payload
    const userId = parseInt(user.id, 10);
    if (isNaN(userId)) {
      logger.error('Invalid user ID format:', user.id);
      return res.status(500).json({ message: 'Server error - invalid user ID format' });
    }
    
    const tokenPayload = { id: userId };
    logger.debug('Creating token with payload:', tokenPayload);
    
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { 
      expiresIn: '24h',  // Increased from 1h for better testing
      algorithm: 'HS256'
    });
    
    // Verify the token immediately to ensure it was created correctly
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      logger.debug('Token verified after creation:', {
        decodedId: decoded.id,
        originalId: userId,
        tokenValid: decoded.id === userId
      });
    } catch (verifyError) {
      logger.error('Token verification failed immediately after creation:', verifyError);
      return res.status(500).json({ message: 'Error creating secure token' });
    }
    
    logger.info('Login successful for user:', {
      userId,
      tokenCreated: !!token
    });
    
    res.json({ 
      token,
      userId,
      message: 'Login successful'
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Password reset request
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await sequelize.models.User.findOne({ where: { email } });
    if (!user) {
      logger.info({ email }, 'Password reset requested for non-existent user');
      return res.json({ message: 'If a user with that email exists, a password reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpiry
    });

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    
    await sendResetPasswordEmail(email, resetUrl);
    logger.info({ userId: user.id }, 'Password reset email sent');

    res.json({ message: 'If a user with that email exists, a password reset link has been sent.' });
  } catch (error) {
    logger.error({ err: error }, 'Error in password reset process');
    res.status(500).json({ message: 'An error occurred during the password reset process' });
  }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await sequelize.models.User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      logger.warn({ token }, 'Invalid or expired reset token used');
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    logger.info({ userId: user.id }, 'Password reset successfully');
    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Error resetting password');
    res.status(500).json({ message: 'An error occurred while resetting the password' });
  }
});

// Update this route
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await sequelize.models.User.findByPk(req.user.id, {
      attributes: ['id', 'email'] // Only send non-sensitive information
    });
    if (!user) {
      logger.warn({ userId: req.user.id }, 'User not found for /me endpoint');
      return res.status(404).json({ message: 'User not found' });
    }
    logger.info({ userId: user.id }, 'User data retrieved successfully');
    res.json(user);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching user data');
    res.status(500).json({ message: 'Error fetching user' });
  }
});

module.exports = { router, authenticateToken };