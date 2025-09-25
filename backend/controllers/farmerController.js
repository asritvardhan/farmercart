const Product = require("../models/Product");
const Order = require("../models/Order");

// ✅ Create new product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, farmName, location, images } =
      req.body;

    if (
      !name ||
      !description ||
      !price ||
      !quantity ||
      !farmName ||
      !location ||
      !images ||
      images.length === 0
    ) {
      return res.status(400).json({
        error: "All fields are required, including at least one image",
      });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      quantity,
      farmName,
      location,
      images,
      farmer: req.user._id,
    });

    await newProduct.save();
    res.status(201).json({
      message: "✅ Product created successfully",
      product: newProduct,
    });
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Get all products of the logged-in farmer
const getFarmerProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(products);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Delete a product by ID
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      farmer: req.user._id,
    });

    if (!product) {
      return res
        .status(404)
        .json({ error: "Product not found or not authorized" });
    }

    res.json({ message: "🗑️ Product deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Update a product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    // Ensure farmer owns this product
    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update fields (only if provided)
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.quantity = req.body.quantity || product.quantity;
    product.farmName = req.body.farmName || product.farmName;
    product.location = req.body.location || product.location;
    product.images = req.body.images || product.images;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}; 

// ✅ Get all orders containing the logged-in farmer's products - FIXED VERSION
// ✅ Get all orders containing the logged-in farmer's products - PROPERLY FIXED
const getFarmerOrders = async (req, res) => {
  try {
    const farmerId = req.user._id; // logged-in farmer

    console.log("Fetching orders for farmer:", farmerId); // Debug log

    // Find orders that have at least one item belonging to this farmer
    const orders = await Order.find({ "items.farmer": farmerId })
      .populate("user", "name email address phone") // customer info
      .populate("items.product", "name price images") // product info
      .populate("items.farmer", "name email phone") // farmer info
      .sort({ createdAt: -1 });

    console.log("Raw orders found:", orders.length); // Debug log

    // Filter each order to show ONLY this farmer's items
    const filteredOrders = orders.map(order => {
      // Create a copy of the order
      const orderObj = order.toObject();
      
      // Filter items to show only items from this farmer
      orderObj.items = orderObj.items.filter(item => {
        const itemFarmerId = item.farmer?._id?.toString() || item.farmer?.toString();
        return itemFarmerId === farmerId.toString();
      });

      return orderObj;
    }).filter(order => order.items.length > 0); // Remove orders with no items from this farmer

    console.log("Filtered orders:", filteredOrders.length); // Debug log

    res.json(filteredOrders);
  } catch (err) {
    console.error("❌ Error fetching farmer orders:", err);
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
};

// ✅ Update order status - SECURITY FIXED
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { itemId, status } = req.body;
    const farmerId = req.user._id;

    console.log("Update request from farmer:", farmerId, "for order:", orderId, "item:", itemId); // Debug

    const validStatuses = ["Pending", "Accepted", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    console.log("Order found, items count:", order.items.length); // Debug

    // Find the specific item that belongs to this farmer
    const itemIndex = order.items.findIndex(item => 
      item._id.toString() === itemId && 
      item.farmer.toString() === farmerId.toString()
    );

    if (itemIndex === -1) {
      console.log("Item not found or not authorized"); // Debug
      return res.status(403).json({ message: "Not authorized to update this item or item not found" });
    }

    // Update the item status
    order.items[itemIndex].status = status;
    if (status === "Cancelled") {
      order.items[itemIndex].cancelledAt = new Date();
    }

    // Update overall order status based on all items
    const allItemsStatus = order.items.map(item => item.status);
    if (allItemsStatus.every(s => s === "Cancelled")) {
      order.status = "Cancelled";
    } else if (allItemsStatus.every(s => s === "Delivered")) {
      order.status = "Delivered";
    } else if (allItemsStatus.some(s => s === "Shipped")) {
      order.status = "Shipped";
    } else if (allItemsStatus.some(s => s === "Accepted")) {
      order.status = "Accepted";
    } else {
      order.status = "Pending";
    }

    await order.save();
try {
      const user = await User.findById(order.user);
      if (user && user.email) {
        await sendEmail('orderStatusUpdate', [
          user.name,
          user.email,
          {
            orderId: order._id,
            status: status,
            // Add any other order details you want to include
          }
        ]);
      }
    } catch (emailError) {
      console.error('Status update email failed:', emailError);
    }
    // Populate the order for response
    const populatedOrder = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("items.product", "name price")
      .populate("items.farmer", "name email");

    // Socket notification to user
    const io = req.app.get("io");
    if (io) {
      io.to(order.user.toString()).emit("orderUpdated", populatedOrder);
    }

    console.log("Status updated successfully"); // Debug
    res.json(populatedOrder);

  } catch (err) {
    console.error("❌ Error updating order status:", err);
    res.status(500).json({ message: "Failed to update order status", error: err.message });
  }
};
// ✅ Farmer Reply to Review (with ownership check + timestamp)
const replyToReview = async (req, res) => {
  try {
    const { reply } = req.body;
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // ✅ Ensure the logged-in farmer owns this product
    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to reply to reviews on this product" });
    }

    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ error: "Review not found" });

    review.farmerReply = reply;
    review.farmerReplyDate = new Date();

    await product.save();
    res.json({ message: "Reply added successfully", review });
  } catch (err) {
    console.error("❌ Error replying to review:", err);
    res.status(500).json({ error: "Failed to reply" });
  }
}; 
module.exports = {
  createProduct,
  getFarmerProducts,
  deleteProduct,
  updateProduct,
  getFarmerOrders,
  updateOrderStatus,
  replyToReview, 
};
