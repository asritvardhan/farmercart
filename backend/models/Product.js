const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
    farmerReply: { type: String, default: "" },
    farmerReplyDate: { type: Date }, // Add this field
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    farmName: { type: String, required: true },
    location: { type: String, required: true },
    images: [{ type: String, required: true }], // Array of URLs
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
    reviews: [reviewSchema],  
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
