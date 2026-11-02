import Member from "../models/Member.js";
import Election from "../models/Election.js";
import { progress } from "./memberController.js";
import { getCurrentElection } from "../utils/currentElection.js";

export async function getElectionStatus(req, res, next) {
  try {
    const [election, members] = await Promise.all([
      getCurrentElection(),
      Member.find({ isActive: true }).select("email"),
    ]);
    if (!election)
      return res.json({
        election: null,
        status: null,
        ...progress(null, members),
        startedAt: null,
      });
    res.json({
      electionId: String(election._id),
      title: election.title,
      status: election.status,
      ...progress(election, members),
      startedAt: election.startedAt,
    });
  } catch (error) {
    next(error);
  }
}

export async function getElectionResults(req, res, next) {
  try {
    const election = req.params.electionId
      ? await Election.findById(req.params.electionId)
      : await Election.findOne().sort({ startedAt: -1 });
    if (req.params.electionId && !election)
      return res.status(404).json({ message: "Election not found." });
    if (!election)
      return res.status(404).json({ message: "No election is available." });
    res.json({
      electionId: String(election._id),
      title: election.title,
      status: election.status,
      drawCompleted: election.status === "COMPLETED",
      winners: election.status === "COMPLETED" ? election.winners : [],
      participants: election.participants.map((p) => ({
        email: p.email,
        assignedNumber: p.assignedNumber,
        participatedAt: p.participatedAt,
      })),
      completedAt: election.completedAt,
    });
  } catch (error) {
    next(error);
  }
}

export async function getElectionHistory(req, res, next) {
  try {
    const elections = await Election.find({
      status: { $in: ["COMPLETED", "ARCHIVED"] },
    })
      .sort({ startedAt: -1 })
      .select(
        "title status startedAt completedAt archivedAt winners participants totalMembers",
      );
    res.json(
      elections.map((e) => ({
        electionId: String(e._id),
        title: e.title,
        status: e.status,
        startedAt: e.startedAt,
        completedAt: e.completedAt,
        archivedAt: e.archivedAt,
        winners: e.winners,
        participantCount: e.participants.length,
        totalMembers: e.totalMembers,
      })),
    );
  } catch (error) {
    next(error);
  }
}

export function validateObjectId(req, res, next) {
  if (!/^[a-f\d]{24}$/i.test(req.params.electionId || ""))
    return res.status(400).json({ message: "Invalid election ID." });
  next();
}
