import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  attempts: { type: Number, default: 0, min: 0 },
  verifiedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("OTP", otpSchema);
