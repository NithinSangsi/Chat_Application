const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getMessages,
  sendMessage,
  deleteMessages
} = require('../controllers/messageController');

router.get('/:userId', authMiddleware, getMessages);
router.post('/', authMiddleware, upload.single('file'), sendMessage);
router.delete('/clear/:userId', authMiddleware, deleteMessages);

module.exports = router;
