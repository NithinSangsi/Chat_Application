const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUser, receiver: userId },
        { sender: userId, receiver: currentUser }
      ]
    })
      .sort('createdAt')
      .populate('sender', 'name profilePic')
      .populate('receiver', 'name profilePic');

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error while loading messages.' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver is required.' });
    }

    if (!text && !req.file) {
      return res.status(400).json({ message: 'Message text or file is required.' });
    }

    const fileData = req.file ? `/uploads/${req.file.filename}` : null;
    const fileName = req.file ? req.file.originalname : null;
    const fileType = req.file ? req.file.mimetype : null;

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      text: text || '',
      file: fileData,
      fileName,
      fileType
    });

    const populatedMessage = await message
      .populate('sender', 'name profilePic')
      .populate('receiver', 'name profilePic');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error while sending message.' });
  }
};

exports.deleteMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user.id;

    await Message.deleteMany({
      $or: [
        { sender: currentUser, receiver: userId },
        { sender: userId, receiver: currentUser }
      ]
    });

    res.json({ message: 'Chat cleared successfully.' });
  } catch (error) {
    console.error('Delete messages error:', error);
    res.status(500).json({ message: 'Server error while clearing chat.' });
  }
};
