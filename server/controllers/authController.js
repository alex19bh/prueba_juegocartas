// Authentication controller for user registration, login, and profile management
const { User } = require('../models/sqliteModels');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, avatarUrl } = req.body;

    // Validate inputs
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if username is taken
    user = await User.findOne({ where: { username } });
    if (user) {
      return res.status(400).json({ message: 'This username is already taken' });
    }

    // Create new user
    user = await User.create({
      username,
      email,
      password,
      avatar: avatarUrl || '/assets/images/avatars/default.png'
    });

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      config.server.jwtSecret,
      { expiresIn: config.server.jwtExpiresIn }
    );

    // Return user information with token
    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar
      }
    });
  } catch (err) {
    console.error('Error in user registration:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user for verification (password is included by default in Sequelize)
    const user = await User.findOne({ where: { email } });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last activity - check if lastActivity field exists in the model
    if ('lastActivity' in user) {
      user.lastActivity = new Date();
      await user.save();
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      config.server.jwtSecret,
      { expiresIn: config.server.jwtExpiresIn }
    );

    // Return user information with token
    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar
      }
    });
  } catch (err) {
    console.error('Error in user login:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get current logged in user
exports.getMe = async (req, res) => {
  try {
    // Get user from database using id from auth middleware
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update last activity if the field exists in the model
    if ('lastActivity' in user) {
      user.lastActivity = new Date();
      await user.save();
    }

    // Return user information
    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar,
        gamesPlayed: user.gamesPlayed,
        gamesWon: user.gamesWon,
        winRate: user.winRate,
        organCollected: user.organCollected,
        virusSpread: user.virusSpread
      }
    });
  } catch (err) {
    console.error('Error getting current user:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get user stats
exports.getUserStats = async (req, res) => {
  try {
    // Get user from database
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user stats
    res.status(200).json({
      stats: {
        gamesPlayed: user.gamesPlayed,
        gamesWon: user.gamesWon,
        winRate: user.winRate,
        organCollected: user.organCollected,
        virusSpread: user.virusSpread
      }
    });
  } catch (err) {
    console.error('Error getting user stats:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, avatarUrl } = req.body;

    // Find user
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if new username is already taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: 'This username is already taken' });
      }
      user.username = username;
    }

    // Check if new email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      user.email = email;
    }

    // Update avatar if provided
    if (avatarUrl) {
      user.avatar = avatarUrl;
    }

    // Update last activity if field exists
    if ('lastActivity' in user) {
      user.lastActivity = new Date();
    }

    // Save changes
    await user.save();

    // Return updated user info
    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar,
        gamesPlayed: user.gamesPlayed,
        gamesWon: user.gamesWon,
        winRate: user.winRate,
        organCollected: user.organCollected,
        virusSpread: user.virusSpread
      }
    });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new passwords' });
    }

    // Find user for verification
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current password matches
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    
    // Update last activity if field exists
    if ('lastActivity' in user) {
      user.lastActivity = new Date();
    }
    
    // Save changes
    await user.save();

    // Return success message
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    // Find user for verification
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password is incorrect' });
    }

    // Delete user
    await user.destroy();

    // Return success message
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};