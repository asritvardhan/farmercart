// controllers/authController.js
const User = require("../models/User");
const Farmer = require("../models/Farmer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// =============================
// 🔑 Generate JWT Token
// =============================
const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// =============================
// 👤 Register (User or Farmer)
// =============================
const registerUser = async (req, res) => {
  try {
    const { name, email, password, pincode, location, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    let Model = role === "farmer" ? Farmer : User;
    const existingUser = await Model.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: `${role} with this email already exists` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;
    if (role === "farmer") {
      newUser = new Farmer({
        name,
        email,
        password: hashedPassword,
        location,
        role,
      });
    } else {
      newUser = new User({
        name,
        email,
        password: hashedPassword,
        pincode,
        role,
      });
    }

    await newUser.save();
    try {
      if (role !== 'admin') { // Don't send welcome email to admins
        await sendEmail('welcomeUser', [name, email]);
      }
    } catch (emailError) {
      console.error('Welcome email failed to send:', emailError);
    }
    return res.status(201).json({
      token: generateToken(newUser._id, newUser.role),
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        pincode: newUser.pincode || null,
        location: newUser.location || null,
      },
    });
  } catch (error) {
    console.error("❌ Error in registerUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// 🔐 Login (User or Farmer)
// =============================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // check both collections
    let user = await User.findOne({ email }).select("+password");
    if (!user) {
      user = await Farmer.findOne({ email }).select("+password");
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        pincode: user.pincode || null,
        location: user.location || null,
      },
    });
  } catch (error) {
    console.error("❌ Error in loginUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerUser, loginUser };
