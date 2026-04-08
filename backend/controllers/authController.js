const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const otpStore = new Map();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email, phone: user.phone },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, description } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profilePic = req.file ? `/uploads/${req.file.filename}` : null;
    const user = await User.create({ name, email, password: hashedPassword, profilePic, description: description || '' });
    const token = generateToken(user);

    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, profilePic: user.profilePic, description: user.description }, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error while registering.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error while logging in.' });
  }
};

exports.otpRequest = async (req, res) => {
  try {
    const { phone, name } = req.body;
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(phone, otp);
    setTimeout(() => otpStore.delete(phone), 5 * 60 * 1000);

    res.json({ message: 'OTP sent (simulated). Use the code shown here for login.', otp, phone, name });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ message: 'Server error while requesting OTP.' });
  }
};

exports.otpVerify = async (req, res) => {
  try {
    const { phone, otp, name, description } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required.' });
    }

    const storedOtp = otpStore.get(phone);
    if (storedOtp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP.' });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      if (!name) {
        return res.status(400).json({ message: 'Name is required for new phone login.' });
      }
      const profilePic = req.file ? `/uploads/${req.file.filename}` : null;
      user = await User.create({ name, phone, profilePic, description: description || '' });
    }

    const token = generateToken(user);
    otpStore.delete(phone);
    res.json({ user: { id: user._id, name: user.name, phone: user.phone, profilePic: user.profilePic, description: user.description }, token });
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ message: 'Server error while verifying OTP.' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select('-password -__v');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users.' });
  }
};
