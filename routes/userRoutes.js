import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, Student, Instructor } from "../models/User.js"; // Import all three models
import { auth } from "../middelware/auth.js";

const router = express.Router();

// Register route
router.post("/register", async (req, res) => {
  const { name, email, password, userRole } = req.body;
  try {
    // Determine which Mongoose model to use based on the user's selected role.
    const UserModel = userRole === "instructor" ? Instructor : Student;

    // Check if a user with this email already exists, regardless of their role.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user document using the appropriate discriminator model.
    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      // The 'role' field is automatically set by Mongoose when you use discriminators.
    });

    res.status(201).json({
      message: "User created successfully",
      userId: newUser._id,
      role: newUser.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/myprofile", auth, async (req, res) => {
  try {
    // The `auth` middleware has already attached the user's ID to `req.user`
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get enrolled courses for logged-in user
router.get("/mycourses", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("enrolledCourses"); // must match schema

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.enrolledCourses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    res.json({ token, userId: user._id, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
