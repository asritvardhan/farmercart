// controllers/adminController.js
const User = require("../models/User");
const Farmer = require("../models/Farmer");
const { sendEmail } = require("../utils/emailService"); 
// ✅ GET all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// ✅ GET all farmers
const getFarmers = async (req, res) => {
  try {
    const farmers = await Farmer.find().sort({ updatedAt: -1 });
    res.json(farmers);
  } catch (err) {
    console.error("Error fetching farmers:", err);
    res.status(500).json({ error: "Failed to fetch farmers" });
  }
};

// ✅ Update farmer status (approve / reject)
const updateFarmerStatus = async (req, res) => {
  const { farmerId } = req.params;
  const { status, reason } = req.body;

  try {
    const farmer = await Farmer.findById(farmerId);
    if (!farmer) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    farmer.status = status;
    await farmer.save();

    // ADD THIS EMAIL CODE BLOCK:
    try {
      if (status === 'approved') {
        await sendEmail('farmerApproved', [farmer.name, farmer.email]);
      } else if (status === 'rejected') {
        await sendEmail('farmerRejected', [farmer.name, farmer.email, reason]);
      }
    } catch (emailError) {
      console.error('Email sending failed, but farmer status updated:', emailError);
    }

    res.json({ message: `Farmer ${status} successfully`, farmer });
  } catch (err) {
    console.error("Error updating farmer status:", err);
    res.status(500).json({ error: "Failed to update farmer status" });
  }
};

module.exports = {
  getUsers,
  getFarmers,
  updateFarmerStatus,
};
