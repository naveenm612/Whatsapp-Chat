import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import http from "http";
import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import Message from "./models/Message";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
// app.use(cors());
app.use(cors({
  origin: "https://whatsapp-chat-two.vercel.app",
  methods: ["GET", "POST"],
}));
app.use(bodyParser.json());

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/chatApp";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Failed to connect to MongoDB:", error));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Socket.IO setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your frontend URL
    methods: ["GET", "POST"],
  },
});

// Store online users
interface OnlineUser {
  _id: string;
  name: string;
  email: string;
  socketId: string;
}

const onlineUsers: OnlineUser[] = [];

// Add user to online users
const addUser = (userData: OnlineUser): void => {
  // Remove user if already exists (to update socket ID)
  const existingUserIndex = onlineUsers.findIndex(user => user._id === userData._id);
  if (existingUserIndex !== -1) {
    onlineUsers.splice(existingUserIndex, 1);
  }
  onlineUsers.push(userData);
};

// Remove user from online users
const removeUser = (socketId: string): void => {
  const index = onlineUsers.findIndex(user => user.socketId === socketId);
  if (index !== -1) {
    onlineUsers.splice(index, 1);
  }
};

// Get user by socketId
const getUserBySocketId = (socketId: string) => {
  return onlineUsers.find(user => user.socketId === socketId);
};

// Get user by userId
const getUserById = (userId: string) => {
  return onlineUsers.find(user => user._id === userId);
};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle user connected event
  socket.on("user_connected", (userData) => {
    console.log("User connected:", userData.name);
    
    const userWithSocket = {
      ...userData,
      socketId: socket.id
    };
    
    addUser(userWithSocket);
    
    // Emit updated list of online users to all clients
    io.emit("active_users", onlineUsers);
  });

  // Handle get chat history
  socket.on("get_chat_history", async ({ userId, recipientId }) => {
    try {
      // Find messages where the two users are either sender or recipient
      const messages = await Message.find({
        $or: [
          { sender: userId, recipient: recipientId },
          { sender: recipientId, recipient: userId },
        ],
      }).sort({ createdAt: 1 });

      // Map messages to include sender info
      const formattedMessages = messages.map(msg => ({
        sender: msg.sender.toString() === userId ? "You" : getUserById(msg.sender.toString())?.name || "User",
        senderId: msg.sender,
        content: msg.content,
        timestamp: msg.createdAt
      }));

      // Send chat history only to the requesting user
      socket.emit("receive_message_history", formattedMessages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  });

  // Handle send message
  socket.on("send_message", async ({ message, recipient }) => {
    try {
      // Save message to database
      const newMessage = new Message({
        sender: message.senderId,
        recipient: recipient,
        content: message.content
      });
      
      await newMessage.save();
      
      // Find recipient's socket
      const recipientUser = getUserById(recipient);
      
      if (recipientUser) {
        // Send message to recipient
        io.to(recipientUser.socketId).emit("receive_message", {
          sender: message.sender,
          senderId: message.senderId,
          content: message.content,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    removeUser(socket.id);
    io.emit("active_users", onlineUsers);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});