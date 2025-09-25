const express = require("express");
const {
  createProduct,
  getFarmerProducts,
  deleteProduct,
  updateProduct,
  getFarmerOrders,
  updateOrderStatus,
  replyToReview, 
} = require("../controllers/farmerController");
const { authMiddleware, verifyFarmer } = require("../middleware/authMiddleware");

const router = express.Router();

/* ✅ PRODUCT ROUTES */
router.post("/products", authMiddleware, verifyFarmer, createProduct);
router.get("/products", authMiddleware, verifyFarmer, getFarmerProducts);
router.put("/products/:id", authMiddleware, verifyFarmer, updateProduct);
router.delete("/products/:id", authMiddleware, verifyFarmer, deleteProduct);

/* ✅ ORDER ROUTES */
router.get("/orders", authMiddleware, verifyFarmer, getFarmerOrders);
router.put("/orders/:orderId/status", authMiddleware, verifyFarmer, updateOrderStatus);

/* ✅ REVIEW ROUTE (Farmer Reply) */
router.put(
  "/products/:productId/reviews/:reviewId/reply",
  authMiddleware,
  verifyFarmer,
  replyToReview
); 

module.exports = router;
