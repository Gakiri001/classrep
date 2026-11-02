import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["VOTER", "SUPER_ADMIN"],
      default: "VOTER",
      required: true,
    },
    hasParticipated: { type: Boolean, default: false },
    assignedNumber: { type: Number, default: null },
    participatedAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Member", memberSchema);
