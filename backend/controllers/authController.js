const User = require("../models/User");
const Farmer = require("../models/Farmer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// const { sendEmail } = require("../utils/email"); // Uncomment if you implement sendEmail

// =============================
// 🔑 Generate JWT Token
// =============================
const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not defined");
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// =============================
// 👤 Register User/Farmer
// =============================
const registerUser = async (req, res) => {
  try {
    let { name, email, password, pincode, location, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "Please provide all required fields" });

    email = email.trim().toLowerCase();

    const Model = role === "farmer" ? Farmer : User;
    const existingUser = await Model.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: `${role} with this email already exists` });

    // Create new user (password will be hashed by schema pre-save)
    const newUser =
      role === "farmer"
        ? new Farmer({ name, email, password, location, role })
        : new User({ name, email, password, pincode, role });

    await newUser.save();

    // Send welcome email (optional)
    try {
      // if (role !== "admin") await sendEmail("welcomeUser", [name, email]);
    } catch (emailError) {
      console.error("Welcome email failed:", emailError);
    }

    return res.status(201).json({
      token: generateToken(newUser._id, newUser.role),
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        pincode: newUser.address?.pincode || null,
        location: newUser.address?.city || newUser.location || null,
      },
    });
  } catch (error) {
    console.error("❌ Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =============================
// 🔐 Login User/Farmer
// =============================
const loginUser = async (req, res) => {
  try {
    let email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password)
      return res.status(400).json({ message: "Please provide email and password" });

    // Search User collection
    let user = await User.findOne({ email }).select("+password").exec();
    if (!user) user = await Farmer.findOne({ email }).select("+password").exec();

    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    if (!user.password)
      return res.status(400).json({
        message: "This email is registered with social login. Please use social login.",
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    return res.status(200).json({
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        pincode: user.address?.pincode || null,
        location: user.address?.city || user.location || null,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerUser, loginUser };
