const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Farmer = require("../models/Farmer");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to find user in both collections
    let account = await User.findById(decoded.id).select("-password");
    if (!account) {
      account = await Farmer.findById(decoded.id).select("-password");
    }

    if (!account) {
      return res.status(401).json({ error: "Account not found" });
    }

    req.user = account; // attach full user/farmer doc
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
};

const verifyFarmer = (req, res, next) => {
  if (!req.user || req.user.role !== "farmer") {
    return res.status(403).json({ error: "Access denied. Farmers only." });
  }
  next();
};

module.exports = { authMiddleware, verifyAdmin, verifyFarmer };
