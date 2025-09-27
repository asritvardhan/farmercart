const Farmer = require("../models/Farmer");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Order = require("../models/Order");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { sendEmail } = require("../utils/emailService"); // ADD THIS LINE
// ✅ Get all approved farmers
const getFarmers = async (req, res) => {
  try {
    const farmers = await Farmer.find({ status: "approved" }).sort({ updatedAt: -1 });
    res.json(farmers);
  } catch (err) {
    console.error("Error fetching farmers:", err);
    res.status(500).json({ error: "Failed to fetch farmers" });
  }
};

// ✅ Get all products of a farmer
const getFarmerProducts = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const products = await Product.find({ farmer: farmerId });
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found for this farmer" });
    }
    res.json(products);
  } catch (err) {
    console.error("Error in getFarmerProducts:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get product details
const getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).populate("farmer", "name location");
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch product details" });
  }
};

// ✅ Add to cart
const addToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity || 1;
    } else {
      cart.items.push({ product: productId, quantity: quantity || 1 });
    }

    await cart.save();
    await cart.populate({
      path: "items.product",
      populate: {
        path: "farmer",
        select: "name email"
      }
    });
    res.json(cart);
  } catch (err) {
    console.error("Error in addToCart:", err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
};

// ✅ Get user cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId })
      .populate({
        path: "items.product",
        populate: {
          path: "farmer",
          select: "name email"
        }
      });
    res.json(cart || { user: req.params.userId, items: [] });
  } catch (err) {
    console.error("Error in getCart:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

// ✅ Remove one product from cart
const removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    let cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = cart.items.filter(item => item.product.toString() !== productId);
      await cart.save();
      await cart.populate({
        path: "items.product",
        populate: {
          path: "farmer",
          select: "name email"
        }
      });
      res.json(cart);
    } else {
      res.status(404).json({ error: "Cart not found" });
    }
  } catch (err) {
    console.error("Error in removeFromCart:", err);
    res.status(500).json({ error: "Failed to remove item from cart" });
  }
};

// ✅ Update quantity
const updateCartQuantity = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = cart.items.find(i => i.product.toString() === productId);
    if (!item) return res.status(404).json({ error: "Item not found in cart" });

    item.quantity = quantity > 0 ? quantity : 1;
    await cart.save();
    await cart.populate({
      path: "items.product",
      populate: {
        path: "farmer",
        select: "name email"
      }
    });
    res.json(cart);
  } catch (err) {
    console.error("Error in updateCartQuantity:", err);
    res.status(500).json({ error: "Failed to update quantity" });
  }
};

// ✅ Clear cart
const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.json({ user: userId, items: [] });

    cart.items = [];
    await cart.save();
    res.json({ user: userId, items: [] });
  } catch (err) {
    console.error("Error in clearCart:", err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
};

// ✅ Enhanced Get User Profile with more details
// ✅ Fixed Get User Profile
const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log("Fetching profile for user:", userId); // Debug log
    
    // Verify the user is accessing their own profile
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied" });
    }

    // First, get the user without population to check if exists
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get orders with safe population
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('totalPrice status createdAt')
      .lean();

    // Calculate stats safely
    const totalOrders = await Order.countDocuments({ user: userId });
    
    const totalSpentResult = await Order.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(userId), 
          status: 'Delivered' 
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$totalPrice' } 
        } 
      }
    ]);

    const totalSpent = totalSpentResult[0]?.total || 0;

    // Build response object safely
    const profileWithStats = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || {
        street: "",
        city: "",
        state: "",
        pincode: "",
        landmark: ""
      },
      profilePicture: user.profilePicture || "",
      stats: {
        totalOrders,
        totalSpent,
        memberSince: user.createdAt
      },
      orders: orders
    };

    console.log("Profile data fetched successfully"); // Debug log
    res.json(profileWithStats);
    
  } catch (err) {
    console.error("Error in getProfile:", err);
    
    // More specific error handling
    if (err.name === 'CastError') {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    
    res.status(500).json({ 
      error: "Failed to fetch profile",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
// ✅ Fixed Update User Profile
const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, address, currentPassword, newPassword } = req.body;

    console.log("Update profile request:", { userId, body: req.body }); // Debug log

    // Verify user ownership
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get user WITH password for comparison
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update basic info
    const updates = {};
    if (name) updates.name = name;
    if (email && email !== user.email) {
      // Check if email already exists (for other users)
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }
      updates.email = email;
    }
    if (phone) updates.phone = phone;
    if (address) updates.address = address;

    // Password change with validation - ONLY if newPassword is provided
    if (newPassword) {
      console.log("Password change requested"); // Debug log
      
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password is required" });
      }

      // Check if user has a password (might be social login user)
      if (!user.password) {
        return res.status(400).json({ error: "Password change not available for this account type" });
      }

      // Validate currentPassword is not empty
      if (typeof currentPassword !== 'string' || currentPassword.trim() === '') {
        return res.status(400).json({ error: "Current password cannot be empty" });
      }

      console.log("Comparing passwords..."); // Debug log
      
      // Safe password comparison
      const isMatch = await bcrypt.compare(currentPassword.trim(), user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters" });
      }

      updates.password = await bcrypt.hash(newPassword, 10);
      console.log("Password updated successfully"); // Debug log
    }

    console.log("Final updates:", updates); // Debug log

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updates, 
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ 
      message: "Profile updated successfully", 
      user: updatedUser 
    });
    
  } catch (err) {
    console.error("Error in updateProfile:", err);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    res.status(500).json({ 
      error: "Failed to update profile",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ✅ Upload Profile Picture
const uploadProfilePicture = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: `/uploads/profiles/${req.file.filename}` },
      { new: true }
    ).select("-password");

    res.json({ message: "Profile picture updated", user });
  } catch (err) {
    console.error("Error uploading profile picture:", err);
    res.status(500).json({ error: "Failed to upload profile picture" });
  }
};
// ✅ Place order - Final Updated Version
const placeOrder = async (req, res) => {
  try {
    const { userId, address } = req.body;

    // Fetch cart with products populated
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const items = [];

    for (const item of cart.items) {
      const product = item.product;

      // Check if requested quantity is available
      if (item.quantity > product.quantity) {
        return res.status(400).json({
          error: `Not enough stock for product: ${product.name}. Available: ${product.quantity}`
        });
      }

      // Reduce product quantity
      product.quantity -= item.quantity;
      await product.save();

      items.push({
        product: product._id,
        farmer: product.farmer, // ✅ Farmer reference
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Calculate total price
    const totalPrice = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Create order
    const order = await Order.create({
      user: userId,
      items,
      totalPrice,
      paymentMethod: "COD",
      address,
      status: "Pending",
    });

    // Clear cart
    cart.items = [];
    await cart.save();
// ✅ Send email to user
try {
  const user = await User.findById(userId);
  if (user && user.email) {
    await sendEmail("orderConfirmation", [
      user.name,
      user.email,
      {
        orderId: order._id.toString(), // ✅ convert ObjectId to string
        totalPrice: order.totalPrice,
        address: order.address,
        paymentMethod: order.paymentMethod,
      },
    ]);
  }

  // ✅ Send email to each farmer for their products
  for (const item of items) {
    const farmer = await Farmer.findById(item.farmer);
    if (farmer && farmer.email) {
      const productDoc = await Product.findById(item.product);

      await sendEmail("farmerOrderNotification", [
        farmer.name,
        farmer.email,
        {
          orderId: order._id.toString(), // ✅ convert ObjectId to string
          productName: productDoc.name,
          quantity: item.quantity,
          price: item.price,
          buyerName: user.name,
          buyerEmail: user.email,
          deliveryAddress: order.address,
        },
      ]);
    }
  }
} catch (emailError) {
  console.error("Email sending failed:", emailError);
}

    res.status(201).json(order);
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ error: "Failed to place order" });
  }
};

// ✅ Get user orders - Updated version
const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ user: userId })
      .populate("items.product")
      .populate({
        path: "items.farmer",
        select: "name email phone", // ✅ Now correctly references Farmer model
      });

    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


// ✅ Add review
const addReview = async (req, res) => {
  try {
    const { rating, comment, userId } = req.body;
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    product.reviews.push({ user: userId, rating, comment });
    await product.save();

    res.json({ message: "Review added successfully", product });
  } catch (err) {
    console.error("Error adding review:", err);
    res.status(500).json({ error: "Failed to add review" });
  }
};

// ✅ Search products
const searchProducts = async (req, res) => {
  try {
    const { search, minPrice, maxPrice, location } = req.query;

    let filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (location) filter.location = { $regex: location, $options: "i" };

    const products = await Product.find(filter).populate("farmer", "name");
    res.json(products);
  } catch (err) {
    console.error("Error searching products:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Cancel order // ✅ Cancel order item - FIXED VERSION
const cancelOrderItem = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    const order = await Order.findById(orderId)
      .populate("items.product")
      .populate("items.farmer");
    
    if (!order) return res.status(404).json({ message: "Order not found" });

    const item = order.items.find(i => i._id.toString() === itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Check if item can be cancelled
    if (["Shipped", "Delivered", "Cancelled"].includes(item.status)) {
      return res.status(400).json({ message: `Cannot cancel item with status: ${item.status}` });
    }

    // Update item status
    item.status = "Cancelled";
    item.cancelledAt = new Date();

    // Check if all items are cancelled to update order status
    const allCancelled = order.items.every(i => i.status === "Cancelled");
    if (allCancelled) {
      order.status = "Cancelled";
    }

    await order.save();

    // Socket.IO notification
    const io = req.app.get("io");
    if (io) {
      io.to(order.user.toString()).emit("orderUpdated", order);
    }

    res.status(200).json({ message: "Item cancelled successfully", order });
  } catch (err) {
    console.error("Error cancelling item:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  getFarmers,
  getFarmerProducts,
  getProductDetails,
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  getProfile,
  updateProfile,
  placeOrder,
  getUserOrders,
  addReview,
  searchProducts,
  cancelOrderItem,
  uploadProfilePicture
};
