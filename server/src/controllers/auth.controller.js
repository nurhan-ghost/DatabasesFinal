import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}

export async function register(req, res) {
  const { fullName, email, password, phone = "", address = "" } = req.body || {};
  if (!fullName || !email || !password) return res.status(400).json({ message: "fullName, email, password required" });

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: "Email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ fullName, email: email.toLowerCase(), phone, address, passwordHash, role: "user" });

  const token = signToken(user._id.toString());
  res.status(201).json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
}

export async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "email, password required" });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user._id.toString());
  res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
}

export async function me(req, res) {
  res.json({ user: req.user });
}
