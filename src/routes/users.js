import { Router } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { authenticateToken } from "../middleware/auth.js";
import User from "../models/User.js";

dotenv.config();
const router = Router();

// 👉 Login to get token
router.post("/login", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: "Username required" });

  const token = jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token });
});

// 👉 Create user (Protected)
router.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 👉 Read all users (Protected)
router.get("/users", authenticateToken, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// 👉 Read single user (Protected)
router.get("/users/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch {
    res.status(400).json({ message: "Invalid ID" });
  }
});

// 👉 Update user (Protected)
router.put("/users/:id", authenticateToken, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json(updated);
  } catch {
    res.status(400).json({ message: "Invalid ID or data" });
  }
});

// 👉 Delete user (Protected)
router.delete("/users/:id", authenticateToken, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json(deleted);
  } catch {
    res.status(400).json({ message: "Invalid ID" });
  }
});

export default router;
