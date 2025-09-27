// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const farmerRoutes = require("./routes/farmerRoutes");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize express app
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "https://farmercart.vercel.app"], // add more allowed origins if needed
  credentials: true // if you are using cookies
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/farmer", farmerRoutes);
app.use("/api/user", userRoutes);

// Socket.IO setup
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Join user-specific room
  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Make io accessible in controllers
app.set("io", io);

// Start server
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
