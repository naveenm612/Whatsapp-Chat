import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";

const router = express.Router();

const handleAsyncError = (res: Response, statusCode: number, message: string, error?: unknown): Response => {
  console.error(message, error); // Log error for debugging
  return res.status(statusCode).json({ message, error: error instanceof Error ? error.message : undefined });
};

// Signup route
router.post("/signup", async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save the user in the database
    const savedUser = await newUser.save();

    // Create a user object for sending back (without password)
    const userForResponse = {
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
    };

    res.status(201).json({ 
      message: "User created successfully",
      user: userForResponse
    });
  } catch (error) {
    handleAsyncError(res, 500, "Error creating user", error);
  }
});

// Login route
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "Please sign up first." });
      return;
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    // Create a user object for sending back (without password)
    const userForResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    res.status(200).json({ 
      message: "Login successful",
      user: userForResponse
    });
  } catch (error) {
    handleAsyncError(res, 500, "Error during login", error);
  }
});

// Get all users
router.get("/users", async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude password field
    res.status(200).json(users);
  } catch (error) {
    handleAsyncError(res, 500, "Error fetching users", error);
  }
});

export default router;