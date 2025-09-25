const {getFarmerProducts,getFarmers,getProductDetails, addToCart, getCart, removeFromCart,updateCartQuantity,
  clearCart,getProfile,updateProfile,placeOrder,getUserOrders,addReview,uploadProfilePicture,
  cancelOrderItem}=require("../controllers/userController")
const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/farmers", getFarmers);
router.get("/farmers/:farmerId/products", getFarmerProducts);
router.get("/products/:productId", getProductDetails);
router.post("/add", addToCart);
router.get("/:userId", getCart);
router.delete("/:userId/:productId", removeFromCart);
router.put("/cart/:userId/:productId",updateCartQuantity);
router.delete("/cart/:userId/clear",clearCart)
router.get("/profile/:userId",authMiddleware, getProfile);
router.put("/profile/:userId/update",authMiddleware, updateProfile);
router.post("/profile/:userId/upload", uploadProfilePicture); // Add this
router.post("/order/cod",placeOrder);
router.get("/orders/:userId",getUserOrders);
router.post("/products/:productId/reviews", addReview);
router.put("/orders/:orderId/items/:itemId/cancel",cancelOrderItem);


module.exports = router;
