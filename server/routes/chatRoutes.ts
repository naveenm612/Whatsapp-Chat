import express, { Request, Response } from "express";
import User from "../models/User";
import Message from "../models/Message";
import mongoose from "mongoose";

const router = express.Router();

// Fetch all users
router.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("_id name email");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Get chat history between two users
router.get("/history/:userId/:recipientId", async (req: Request, res: Response): Promise<void> => {
  const { userId, recipientId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(recipientId)) {
      res.status(400).json({ message: "Invalid user ID format" });
      return;
    }

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId },
      ],
    })
      .populate("sender", "name")
      .populate("recipient", "name")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Error fetching chat history" });
  }
});

// Save a new message
router.post("/message", async (req: Request, res: Response): Promise<void> => {
  const { sender, recipient, content } = req.body;

  try {
    if (!sender || !recipient || !content) {
      res.status(400).json({ message: "Sender, recipient, and content are required" });
      return;
    }

    const newMessage = new Message({
      sender,
      recipient,
      content,
    });

    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ message: "Error saving message" });
  }
});

export default router;
