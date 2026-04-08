const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
  register,
  login,
  otpRequest,
  otpVerify,
  getUsers
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', upload.single('profilePic'), register);
router.post('/login', login);
router.post('/otp-request', otpRequest);
router.post('/otp-verify', upload.single('profilePic'), otpVerify);
router.get('/users', authMiddleware, getUsers);

module.exports = router;
