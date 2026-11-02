import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    email: { type: String, required: true, lowercase: true, trim: true },
    assignedNumber: { type: Number, required: true, min: 1, max: 13 },
    participatedAt: { type: Date, required: true },
  },
  { _id: false },
);

const winnerSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    email: { type: String, required: true },
    assignedNumber: { type: Number, required: true, min: 1, max: 13 },
  },
  { _id: false },
);

const electionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    totalMembers: { type: Number, default: 13, immutable: true },
    requiredWinners: { type: Number, default: 2, immutable: true },
    status: {
      type: String,
      enum: ["OPEN", "COMPLETED", "ARCHIVED"],
      default: "OPEN",
    },
    participants: { type: [participantSchema], default: [] },
    winners: { type: [winnerSchema], default: [] },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    archivedAt: { type: Date, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      default: null,
    },
    renewedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      default: null,
    },
    drawMetadata: {
      algorithm: String,
      drawnAt: Date,
      participantCount: Number,
    },
  },
  { timestamps: true },
);

electionSchema.index(
  { status: 1 },
  { unique: true, partialFilterExpression: { status: "OPEN" } },
);
export default mongoose.model("Election", electionSchema);
