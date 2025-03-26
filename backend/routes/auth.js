const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../models'); // Import sequelize instance
const crypto = require('crypto');
const { sendResetPasswordEmail } = require('../emailService');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');

const router = express.Router();
const authLimiter = require('../middleware/authRateLimiter');
const validatePassword = require('../middleware/passwordValidator');

// Token refresh function
const attemptTokenRefresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    logger.debug('Attempting to refresh token with refresh token');
    
    let user;
    
    try {
      // Find user by refresh token
      user = await sequelize.models.User.findOne({
        where: {
          refreshToken,
          refreshTokenExpires: { [Op.gt]: new Date() } // Ensure token is not expired
        }
      });
    } catch (findError) {
      // If this fails due to missing columns, we need to handle this specially
      if (findError.name === 'SequelizeDatabaseError' && 
          findError.parent && 
          findError.parent.message && 
          findError.parent.message.includes('column')) {
        logger.warn('Error finding user with refresh token - migration not run:', findError.message);
        logger.warn('MIGRATION REQUIRED: Run "npx sequelize-cli db:migrate" to add refresh token columns');
        
        // Since we can't validate the refresh token without the column, we need to fail
        // Clear the invalid refresh token cookie
        res.clearCookie('refresh_token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        return res.status(401).json({ 
          message: 'Authentication expired',
          details: 'Database migration required for refresh tokens'
        });
      }
      // For other errors, just rethrow
      throw findError;
    }
    
    if (!user) {
      logger.warn('Token refresh failed - invalid or expired refresh token');
      
      // Clear the invalid refresh token cookie
      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      return res.status(401).json({ message: 'Authentication expired' });
    }
    
    // Ensure user.id is a number and create a clean payload
    const userId = parseInt(user.id, 10);
    if (isNaN(userId)) {
      logger.error('Invalid user ID format during token refresh:', user.id);
      return res.status(500).json({ message: 'Server error - invalid user ID format' });
    }
    
    const tokenPayload = { id: userId };
    
    // Create new access token using the same secret or fallback
    const jwtSecret = process.env.JWT_SECRET || 'my_super_secret_key_for_ars_saga_manager_123!@';
    const newAccessToken = jwt.sign(tokenPayload, jwtSecret, { 
      expiresIn: '15m',
      algorithm: 'HS256'
    });
    
    // Set new access token cookie
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    // Add user to request
    req.user = { id: userId };
    
    logger.info('Access token refreshed successfully', {
      userId,
      path: req.path,
      method: req.method
    });
    
    // Continue with the request
    next();
  } catch (error) {
    logger.error('Error refreshing token:', error);
    
    // Clear cookies
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

// Update the authenticateToken function to use HTTP-only cookie
const authenticateToken = async (req, res, next) => {
  logger.debug('Authenticating request:', {
    path: req.path,
    method: req.method,
    hasCookie: !!req.cookies.access_token
  });

  const token = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  // If no access token and no refresh token, authentication fails
  if (!token && !refreshToken) {
    logger.warn('Authentication failed - no tokens provided:', {
      path: req.path,
      cookies: Object.keys(req.cookies || {})
    });
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // If no access token but have refresh token, attempt token refresh
  if (!token && refreshToken) {
    return await attemptTokenRefresh(req, res, next);
  }

  try {
    // Use the same secret or fallback as when creating tokens
    const jwtSecret = process.env.JWT_SECRET || 'my_super_secret_key_for_ars_saga_manager_123!@';
    const decoded = jwt.verify(token, jwtSecret);
    
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
      path: req.path
    });

    // Clear the invalid cookie
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    if (error.name === 'TokenExpiredError' && refreshToken) {
      // Token expired but we have a refresh token
      return await attemptTokenRefresh(req, res, next);
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Authentication expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid authentication' });
    }

    return res.status(403).json({ message: 'Authentication failed' });
  }
};

router.post('/register', authLimiter, validatePassword, async (req, res) => {
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

// Add a dedicated token refresh endpoint
router.post('/refresh-token', async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }
    
    logger.debug('Token refresh endpoint called with refresh token');
    
    let user;
    
    try {
      // Find user by refresh token
      user = await sequelize.models.User.findOne({
        where: {
          refreshToken,
          refreshTokenExpires: { [Op.gt]: new Date() } // Ensure token is not expired
        }
      });
    } catch (findError) {
      // If this fails due to missing columns, we need to handle this specially
      if (findError.name === 'SequelizeDatabaseError' && 
          findError.parent && 
          findError.parent.message && 
          findError.parent.message.includes('column')) {
        logger.warn('Error finding user with refresh token - migration not run:', findError.message);
        logger.warn('MIGRATION REQUIRED: Run "npx sequelize-cli db:migrate" to add refresh token columns');
        
        // Clear the refresh token cookie since we can't validate it
        res.clearCookie('refresh_token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        return res.status(401).json({ 
          message: 'Invalid or expired refresh token',
          details: 'Database migration required for refresh tokens'
        });
      }
      // For other errors, just rethrow
      throw findError;
    }
    
    if (!user) {
      logger.warn('Token refresh endpoint - invalid or expired refresh token');
      
      // Clear the invalid refresh token cookie
      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
    
    // Create a new access token
    const userId = parseInt(user.id, 10);
    const tokenPayload = { id: userId };
    
    const newAccessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, { 
      expiresIn: '15m',
      algorithm: 'HS256'
    });
    
    // Set the new access token cookie
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    logger.info('Access token refreshed successfully via endpoint', { userId });
    
    res.json({ message: 'Token refreshed successfully' });
  } catch (error) {
    logger.error('Error in refresh token endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
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
      // Use the same error message for non-existent users to prevent user enumeration
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check if account is locked
    const now = new Date();
    if (user.accountLockedUntil && user.accountLockedUntil > now) {
      // Calculate remaining lockout time in minutes
      const remainingLockTime = Math.ceil((user.accountLockedUntil - now) / (1000 * 60));
      
      logger.warn('Login attempt on locked account:', {
        email: user.email,
        lockedUntil: user.accountLockedUntil,
        remainingMinutes: remainingLockTime
      });
      
      return res.status(403).json({ 
        message: `Account is temporarily locked. Please try again in ${remainingLockTime} minutes.` 
      });
    }
    
    logger.debug('User found:', {
      id: user.id,
      email: user.email,
      hasPassword: !!user.password,
      failedAttempts: user.failedLoginAttempts
    });
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      const failedAttempts = user.failedLoginAttempts + 1;
      const MAX_FAILED_ATTEMPTS = 5;
      
      // Lock account after MAX_FAILED_ATTEMPTS
      const updates = { failedLoginAttempts: failedAttempts };
      
      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        // Lock account for 15 minutes
        const lockUntil = new Date(now.getTime() + 15 * 60 * 1000);
        updates.accountLockedUntil = lockUntil;
        
        logger.warn('Account locked due to too many failed attempts:', {
          email: user.email,
          failedAttempts,
          lockedUntil: lockUntil
        });
      }
      
      await user.update(updates);
      
      logger.warn('Login failed - invalid password for user:', {
        email,
        failedAttempts
      });
      
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Reset failed login attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await user.update({ 
        failedLoginAttempts: 0,
        accountLockedUntil: null
      });
    }
    
    // Ensure user.id is a number and create a clean payload
    const userId = parseInt(user.id, 10);
    if (isNaN(userId)) {
      logger.error('Invalid user ID format:', user.id);
      return res.status(500).json({ message: 'Server error - invalid user ID format' });
    }
    
    const tokenPayload = { id: userId };
    logger.debug('Creating token with payload:', tokenPayload);
    
    // Create access token (short-lived)
    // Make sure we have a JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET || 'my_super_secret_key_for_ars_saga_manager_123!@';
    
    // Create token with fallback secret if needed
    const token = jwt.sign(tokenPayload, jwtSecret, { 
      expiresIn: '15m',  // Short-lived access token
      algorithm: 'HS256'
    });
    
    // Create refresh token (long-lived)
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    // Store refresh token in database with enhanced error logging
    try {
      logger.debug('About to update user with refresh token:', {
        userId: user.id,
        hasRefreshToken: !!refreshToken,
        expirySet: !!refreshTokenExpires
      });
      
      // Detailed logging of user object
      logger.debug('User object before update:', {
        id: user.id,
        model: user.constructor.name,
        hasRefreshTokenField: 'refreshToken' in user,
        hasRefreshTokenExpiresField: 'refreshTokenExpires' in user
      });
      
      // First, perform a direct SQL query to check if columns exist
      try {
        const [columns] = await sequelize.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'Users' AND column_name IN ('refresh_token', 'refresh_token_expires')
        `);
        logger.debug('Database columns check:', {
          columnsFound: columns.map(c => c.column_name),
          count: columns.length
        });
      } catch (sqlError) {
        logger.error('Error checking database columns:', sqlError);
      }
      
      await user.update({
        refreshToken,
        refreshTokenExpires
      });
      
      logger.debug('Refresh token update successful');
    } catch (updateError) {
      // Enhanced error logging
      logger.error('Failed to update user with refresh token:', {
        error: updateError.name,
        message: updateError.message,
        parentError: updateError.parent?.message,
        stack: updateError.stack
      });
      
      // Try a more direct approach as fallback
      try {
        logger.debug('Attempting direct SQL update as fallback');
        await sequelize.query(`
          UPDATE "Users" SET 
          refresh_token = :token,
          refresh_token_expires = :expires
          WHERE id = :id
        `, {
          replacements: {
            token: refreshToken,
            expires: refreshTokenExpires,
            id: user.id
          },
          type: sequelize.QueryTypes.UPDATE
        });
        logger.debug('Direct SQL update successful');
      } catch (sqlError) {
        logger.error('Direct SQL update also failed:', {
          error: sqlError.name,
          message: sqlError.message,
          parent: sqlError.parent?.message
        });
        // Continue without storing refresh token
        logger.warn('Could not update user with refresh token - migration may not be run:', updateError.message);
        logger.warn('MIGRATION REQUIRED: Run "npx sequelize-cli db:migrate" to add refresh token columns');
      }
    }
    
    logger.debug('Created refresh token:', {
      userId,
      refreshTokenCreated: !!refreshToken,
      refreshTokenExpires
    });
    
    // Verify the token immediately to ensure it was created correctly
    try {
      const decoded = jwt.verify(token, jwtSecret);
      logger.debug('Token verified after creation:', {
        decodedId: decoded.id,
        originalId: userId,
        tokenValid: decoded.id === userId
      });
    } catch (verifyError) {
      logger.error('Token verification failed immediately after creation:', verifyError);
      return res.status(500).json({ message: 'Error creating secure token' });
    }
    
    // Set HTTP-only cookie with the access token
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'strict', // Prevent CSRF
      maxAge: 15 * 60 * 1000 // 15 minutes (matching JWT expiry)
    });
    
    // Set HTTP-only cookie with the refresh token
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    logger.info('Login successful for user:', {
      userId,
      tokenCreated: !!token,
      cookieSet: true
    });
    
    res.json({ 
      userId,
      message: 'Login successful'
      // No longer sending token in response body
    });
  } catch (error) {
    logger.error('Login error:', error);
    logger.error('Error stack:', error.stack);
    
    // Check for specific database errors related to missing columns
    if (error.name === 'SequelizeDatabaseError') {
      logger.error('Database error details:', error.parent);
      // Check if it's a column missing error (common when migration has not been run)
      if (error.parent && error.parent.message && error.parent.message.includes("column")) {
        logger.error('This might be due to missing columns from migration - run migration first');
      }
    }
    
    res.status(500).json({ message: 'Error logging in', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});

// Password reset request
router.post('/reset-password', authLimiter, async (req, res) => {
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
router.post('/reset-password/:token', validatePassword, async (req, res) => {
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

// Add logout endpoint to clear cookies and invalidate refresh token
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    logger.info('User logging out, clearing auth cookies and invalidating refresh token');
    
    // Clear access token cookie
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    // Clear refresh token cookie
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    // Invalidate refresh token in database
    try {
      const user = await sequelize.models.User.findByPk(req.user.id);
      if (user) {
        await user.update({
          refreshToken: null,
          refreshTokenExpires: null
        });
        logger.info({ userId: user.id }, 'Refresh token invalidated');
      }
    } catch (updateError) {
      // If this fails due to missing columns, just log it
      if (updateError.name === 'SequelizeDatabaseError' && 
          updateError.parent && 
          updateError.parent.message && 
          updateError.parent.message.includes('column')) {
        logger.warn('Could not invalidate refresh token - migration not run:', updateError.message);
        logger.warn('MIGRATION REQUIRED: Run "npx sequelize-cli db:migrate" to add refresh token columns');
      } else {
        // For other errors, just log them but don't fail the logout
        logger.error('Error invalidating refresh token:', updateError);
      }
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Error during logout');
    res.status(500).json({ message: 'Error during logout' });
  }
});

module.exports = { router, authenticateToken };