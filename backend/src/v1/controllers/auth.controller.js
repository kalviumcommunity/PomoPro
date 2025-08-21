import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function signToken(userId) {
	const payload = { id: userId };
	const secret = process.env.JWT_SECRET || "dev_secret";
	const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
	return jwt.sign(payload, secret, { expiresIn });
}

export async function signup(req, res) {
	const { name, email, password } = req.body;
	if (!name || !email || !password) {
		return res.status(400).json({ message: "name, email and password are required" });
	}
	const existing = await User.findOne({ email: email.toLowerCase() });
	if (existing) return res.status(409).json({ message: "Email already in use" });
	const passwordHash = await bcrypt.hash(password, 10);
	const user = await User.create({ name, email: email.toLowerCase(), passwordHash });
	const token = signToken(user.id);
	return res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
}

export async function login(req, res) {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ message: "email and password are required" });
	}
	const user = await User.findOne({ email: email.toLowerCase() });
	if (!user) return res.status(401).json({ message: "Invalid credentials" });
	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) return res.status(401).json({ message: "Invalid credentials" });
	const token = signToken(user.id);
	return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
}

export async function me(req, res) {
	const user = await User.findById(req.user.id).select("name email createdAt");
	if (!user) return res.status(404).json({ message: "User not found" });
	return res.json({ user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } });
}


