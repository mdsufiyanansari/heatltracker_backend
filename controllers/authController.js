import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User.js";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(100),
  age: z.coerce.number().int().min(13).max(100).optional()
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

function makeToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "48h" });
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, age: user.age, fitnessLevel: user.fitnessLevel };
}

export async function register(req, res, next) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
    const { name, email, password, age } = parsed.data;
    const normalizedEmail = email.toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: normalizedEmail, passwordHash, age });
    return res.status(201).json({ success: true, message: "Account created.", token: makeToken(user._id), user: publicUser(user) });
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: "Enter a valid email and password." });
    const user = await User.findOne({ email: parsed.data.email.toLowerCase() }).select("+passwordHash");
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: "Incorrect email or password." });
    }
    return res.json({ success: true, message: "Login successful.", token: makeToken(user._id), user: publicUser(user) });
  } catch (err) { next(err); }
}

export async function me(req, res) {
  return res.json({ success: true, user: publicUser(req.user) });
}

export async function updateProfile(req, res, next) {
  try {
    const schema = z.object({
      name: z.string().trim().min(2).max(80).optional(),
      age: z.coerce.number().int().min(13).max(100).optional(),
      fitnessLevel: z.enum(["Beginner", "Intermediate", "Advanced"]).optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
    Object.assign(req.user, parsed.data);
    await req.user.save();
    return res.json({ success: true, user: publicUser(req.user) });
  } catch (err) { next(err); }
}
