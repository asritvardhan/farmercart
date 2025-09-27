const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: Number,
      landmark: String
    },
    profilePicture: { type: String, default: null },
    preferences: {
      notifications: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: false }
    },
    role: { type: String, enum: ['farmer', 'user', 'admin'], default: 'user' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: function () {
        return this.role === 'farmer' ? 'pending' : 'approved';
      },
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model('User', userSchema);
