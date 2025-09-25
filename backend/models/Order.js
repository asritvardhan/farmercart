// models/Order.js
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true }, // ✅ Change from "User" to "Farmer"
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true },
        status: { type: String, default: "Pending" },
        cancelledAt: { type: Date }
      }
    ],
    totalPrice: { type: Number, required: true },
    paymentMethod: { type: String, default: "COD" },
    status: { type: String, default: "Pending" },
    address: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);