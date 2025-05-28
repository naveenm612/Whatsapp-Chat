import { VercelRequest, VercelResponse } from '@vercel/node';
import Message from '../models/Message';
import User from '../models/User';
import dbConnect from '../utils/dbConnect';

export default async (req: VercelRequest, res: VercelResponse) => {
  await dbConnect();

  if (req.method === 'POST' && req.url?.includes('/message')) {
    const { sender, recipient, content } = req.body;

    try {
      const newMessage = new Message({ sender, recipient, content });
      const savedMessage = await newMessage.save();

      res.status(201).json(savedMessage);
    } catch (error) {
      res.status(500).json({ message: 'Error saving message', error: error.message });
    }
  } else if (req.method === 'GET' && req.url?.includes('/history')) {
    const { userId, recipientId } = req.query;

    try {
      const messages = await Message.find({
        $or: [
          { sender: userId, recipient: recipientId },
          { sender: recipientId, recipient: userId },
        ],
      }).sort({ createdAt: 1 });

      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching chat history', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
