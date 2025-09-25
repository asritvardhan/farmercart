const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: { type: String, required: true }, // e.g., Hyderabad, Telangana
    imageUrl: { type: String }, // profile image for card
    role: { type: String, default: "farmer" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
  },
  { timestamps: true } // ✅ adds createdAt and updatedAt
);

module.exports = mongoose.model("Farmer", farmerSchema);
