const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    password: {
      type: String
    },
    profilePic: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: '',
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
