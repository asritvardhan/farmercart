const express = require("express");
const router = express.Router();
const {
  getUsers,
  getFarmers,
  updateFarmerStatus,
} = require("../controllers/adminController");

const { authMiddleware, verifyAdmin } = require("../middleware/authMiddleware");

// ✅ Protect all admin routes with both middlewares
router.get("/users", authMiddleware, verifyAdmin, getUsers);
router.get("/farmers", authMiddleware, verifyAdmin, getFarmers);
router.put("/farmers/:farmerId/status", authMiddleware, verifyAdmin, updateFarmerStatus);

module.exports = router;
