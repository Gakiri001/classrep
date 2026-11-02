import mongoose from "mongoose";
import Election from "../models/Election.js";
import Member from "../models/Member.js";
import { progress } from "./memberController.js";
import { getIo } from "../utils/realtime.js";

export async function dashboard(req, res, next) {
  try {
    const [openElection, members, history] = await Promise.all([
      Election.findOne({ status: "OPEN" }),
      Member.find({ isActive: true }).select("email"),
      Election.find()
        .sort({ startedAt: -1 })
        .limit(10)
        .select(
          "title status startedAt completedAt winners participants totalMembers",
        ),
    ]);
    const current = openElection || history[0] || null;
    res.json({
      currentElection: current
        ? {
            electionId: String(current._id),
            title: current.title,
            status: current.status,
            ...progress(current, members),
            winners: current.status === "COMPLETED" ? current.winners : [],
            startedAt: current.startedAt,
          }
        : null,
      history: history.map((e) => ({
        electionId: String(e._id),
        title: e.title,
        status: e.status,
        startedAt: e.startedAt,
        completedAt: e.completedAt,
        winners: e.winners,
        participantCount: e.participants.length,
        totalMembers: e.totalMembers,
      })),
    });
  } catch (error) {
    next(error);
  }
}

export async function renewElection(req, res, next) {
  const title =
    typeof req.body?.title === "string" ? req.body.title.trim() : "";
  const confirmation = req.body?.confirmation;
  if (!title || title.length > 160)
    return res
      .status(400)
      .json({ message: "A title of 1 to 160 characters is required." });
  if (
    confirmation !== "START_NEW_ELECTION" &&
    confirmation !== "CANCEL_AND_START_NEW_ELECTION"
  )
    return res
      .status(400)
      .json({ message: "Explicit election renewal confirmation is required." });
  const session = await mongoose.startSession();
  try {
    let newElection;
    await session.withTransaction(async () => {
      const current = await Election.findOne({ status: "OPEN" }).session(
        session,
      );
      if (current && confirmation !== "CANCEL_AND_START_NEW_ELECTION") {
        const error = new Error(
          "The current election is still open. Confirm cancellation to preserve it as an archived historical election.",
        );
        error.status = 409;
        throw error;
      }
      const previous =
        current ||
        (await Election.findOne().sort({ startedAt: -1 }).session(session));
      if (current) {
        current.status = "ARCHIVED";
        current.archivedAt = new Date();
        await current.save({ session });
      } else if (previous?.status === "COMPLETED") {
        previous.status = "ARCHIVED";
        previous.archivedAt = new Date();
        await previous.save({ session });
      }
      [newElection] = await Election.create(
        [
          {
            title,
            totalMembers: 13,
            requiredWinners: 2,
            status: "OPEN",
            participants: [],
            winners: [],
            startedAt: new Date(),
            createdBy: req.member._id,
            renewedFrom: previous?._id || null,
          },
        ],
        { session },
      );
    });
    getIo()?.emit("electionRenewed", {
      electionId: String(newElection._id),
      title: newElection.title,
      status: newElection.status,
      totalMembers: newElection.totalMembers,
      participantCount: 0,
      pendingCount: 13,
      participationPercentage: 0,
      participants: [],
      pending: [],
    });
    res.status(201).json({
      message: "New election cycle started.",
      electionId: String(newElection._id),
      title: newElection.title,
      status: newElection.status,
      totalMembers: newElection.totalMembers,
      renewedFrom: newElection.renewedFrom,
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
}

export async function archiveElection(req, res, next) {
  try {
    if (req.body?.confirmation !== "ARCHIVE_ELECTION")
      return res
        .status(400)
        .json({ message: "Explicit archive confirmation is required." });
    const election = await Election.findOneAndUpdate(
      { _id: req.params.electionId, status: { $in: ["OPEN", "COMPLETED"] } },
      { $set: { status: "ARCHIVED", archivedAt: new Date() } },
      { new: true },
    );
    if (!election)
      return res
        .status(404)
        .json({ message: "Election not found or already archived." });
    res.json({
      message: "Election archived.",
      electionId: String(election._id),
      status: election.status,
      archivedAt: election.archivedAt,
    });
  } catch (error) {
    next(error);
  }
}
