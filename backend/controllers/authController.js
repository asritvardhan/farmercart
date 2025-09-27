const User = require("../models/User");
const Farmer = require("../models/Farmer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT
const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not defined");
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register User/Farmer
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

    let newUser;
    if (role === "farmer") {
      newUser = new Farmer({ name, email, password, address: { city: location }, role });
    } else {
      newUser = new User({ name, email, password, address: { pincode }, role });
    }

    await newUser.save();

    return res.status(201).json({
      token: generateToken(newUser._id, newUser.role),
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        pincode: newUser.address?.pincode || null,
        location: newUser.address?.city || null,
      },
    });
  } catch (error) {
    console.error("❌ Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Login User/Farmer
const loginUser = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password)
      return res.status(400).json({ message: "Please provide email and password" });

    let user = await User.findOne({ email }).select("+password");
    if (!user) user = await Farmer.findOne({ email }).select("+password");

    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    if (!user.password)
      return res.status(400).json({
        message: "This email is registered with social login. Please use social login.",
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    return res.status(200).json({
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        pincode: user.address?.pincode || null,
        location: user.address?.city || null,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerUser, loginUser };
