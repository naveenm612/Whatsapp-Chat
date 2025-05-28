import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import User from '../models/User';
import dbConnect from '../utils/dbConnect';

export default async (req: VercelRequest, res: VercelResponse) => {
  await dbConnect();

  if (req.method === 'POST' && req.url?.includes('/signup')) {
    const { name, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name, email, password: hashedPassword });
      const savedUser = await newUser.save();

      res.status(201).json({ message: 'User created', user: { name, email, _id: savedUser._id } });
    } catch (error) {
      res.status(500).json({ message: 'Error creating user', error: error.message });
    }
  } else if (req.method === 'POST' && req.url?.includes('/login')) {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      res.status(200).json({ message: 'Login successful', user: { name: user.name, email: user.email, _id: user._id } });
    } catch (error) {
      res.status(500).json({ message: 'Error during login', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
