import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Member from "../models/Member.js";
import OTP from "../models/OTP.js";
import { sendOtpEmail } from "../utils/emailService.js";

const normalizeEmail = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

export async function requestOtp(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ message: "Enter a valid email address." });
    const member = await Member.findOne({ email, isActive: true });
    if (!member)
      return res
        .status(403)
        .json({ message: "This email is not registered for the election." });
    const otp = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const otpHash = await bcrypt.hash(otp, 10);
    await OTP.deleteMany({ email, verifiedAt: null });
    await OTP.create({
      email,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60_000),
    });
    try {
      await sendOtpEmail(email, otp);
    } catch {
      await OTP.deleteMany({ email, verifiedAt: null });
      return res
        .status(503)
        .json({ message: "Unable to send a verification email right now." });
    }
    res.json({
      message:
        "If the address is registered, a verification code has been sent.",
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    const otp = typeof req.body?.otp === "string" ? req.body.otp : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(otp))
      return res
        .status(400)
        .json({ message: "A valid email and six-digit code are required." });
    const member = await Member.findOne({ email, isActive: true });
    const record = await OTP.findOne({
      email,
      verifiedAt: null,
      expiresAt: { $gt: new Date() },
      attempts: { $lt: 5 },
    }).sort({ createdAt: -1 });
    if (!member || !record)
      return res
        .status(401)
        .json({
          message:
            "The code is invalid, expired, or has reached its attempt limit.",
        });
    if (!(await bcrypt.compare(otp, record.otpHash))) {
      await OTP.updateOne(
        { _id: record._id, verifiedAt: null, attempts: { $lt: 5 } },
        { $inc: { attempts: 1 } },
      );
      return res
        .status(401)
        .json({
          message:
            "The code is invalid, expired, or has reached its attempt limit.",
        });
    }
    const used = await OTP.findOneAndUpdate(
      {
        _id: record._id,
        verifiedAt: null,
        expiresAt: { $gt: new Date() },
        attempts: { $lt: 5 },
      },
      { $set: { verifiedAt: new Date() } },
      { new: true },
    );
    if (!used)
      return res
        .status(401)
        .json({
          message:
            "The code is invalid, expired, or has reached its attempt limit.",
        });
    if (!process.env.JWT_SECRET)
      throw new Error("JWT_SECRET is not configured");
    const token = jwt.sign(
      { sub: String(member._id) },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
    );
    res.json({
      token,
      member: {
        id: String(member._id),
        email: member.email,
        role: member.role,
      },
    });
  } catch (error) {
    next(error);
  }
}
