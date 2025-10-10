const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ status: false, message: 'Please provide username and password', data: null });
    }
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ status: false, message: 'Username already exists', data: null });
    }
    const user = await User.create({ username, password });
    return res.status(201).json({ status: true, message: 'User registered', data: { user, token: generateToken(user._id) } });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message, data: null });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ status: false, message: 'Invalid credentials user', data: null });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: false, message: 'Invalid credentials isMatch', data: null });
    }
    return res.status(200).json({ status: true, message: 'Login successful', data: { user: user.toJSON(), token: generateToken(user._id) } });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message, data: null });
  }
};

exports.getMe = async (req, res) => {
  try {
    return res.status(200).json({ status: true, message: 'User details', data: req.user });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message, data: null });
  }
};
