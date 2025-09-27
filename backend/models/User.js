const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { 
      type: String, 
      required: function() {
        // Password not required for social logins
        return !this.socialId;
      },
      select: false 
    },
    phone: { type: String, trim: true },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String, // Changed to String to match frontend
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
    // Add social login fields
    socialId: { type: String }, // For Google/Facebook login
    authProvider: { type: String, enum: ['local', 'google', 'facebook'] }
  },
  { timestamps: true }
);

// Add a pre-save hook to handle password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});
module.exports = mongoose.model('User', userSchema);