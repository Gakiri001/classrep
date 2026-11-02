import { randomInt } from "node:crypto";
import Member from "../models/Member.js";
import Election from "../models/Election.js";
import { getIo } from "../utils/realtime.js";
import { completeElectionIfReady } from "../utils/completeElection.js";
import { getCurrentElection } from "../utils/currentElection.js";

function progress(election, members) {
  const participantIds = new Set(
    (election?.participants || []).map((p) => String(p.member)),
  );
  const participants = (election?.participants || []).map((p) => ({
    email: p.email,
    assignedNumber: p.assignedNumber,
    participatedAt: p.participatedAt,
  }));
  const pending = members
    .filter((m) => !participantIds.has(String(m._id)))
    .map((m) => ({ email: m.email }));
  const total = members.length,
    count = participants.length;
  return {
    totalMembers: total,
    participantCount: count,
    pendingCount: Math.max(0, total - count),
    participationPercentage: total ? Math.round((count / total) * 100) : 0,
    participants,
    pending,
  };
}

export async function participate(req, res, next) {
  try {
    const member = await Member.findOne({
      _id: req.member._id,
      isActive: true,
    });
    if (!member)
      return res.status(401).json({ message: "Member is not active." });
    for (let tries = 0; tries < 26; tries += 1) {
      const election = await Election.findOne({ status: "OPEN" });
      if (!election)
        return res.status(409).json({ message: "There is no open election." });
      if (
        election.participants.some(
          (p) => String(p.member) === String(member._id),
        )
      )
        return res
          .status(409)
          .json({ message: "You have already participated in this election." });
      const used = new Set(election.participants.map((p) => p.assignedNumber));
      const available = Array.from({ length: 14 }, (_, i) => i + 1).filter(
        (n) => !used.has(n),
      );
      if (!available.length)
        return res
          .status(409)
          .json({ message: "The election is not accepting participation." });
      const assignedNumber = available[randomInt(available.length)];
      const participatedAt = new Date();
      const updated = await Election.findOneAndUpdate(
        {
          _id: election._id,
          status: "OPEN",
          "participants.member": { $ne: member._id },
          "participants.assignedNumber": { $ne: assignedNumber },
        },
        {
          $push: {
            participants: {
              member: member._id,
              email: member.email,
              assignedNumber,
              participatedAt,
            },
          },
        },
        { new: true },
      );
      if (!updated) continue;
      const members = await Member.find({ isActive: true }).select("email");
      const stats = progress(updated, members);
      getIo()?.emit("participationUpdated", {
        electionId: String(updated._id),
        ...stats,
      });
      const completed =
        updated.participants.length === updated.totalMembers
          ? await completeElectionIfReady(updated._id)
          : null;
      return res
        .status(201)
        .json({
          message: "Participation recorded.",
          electionId: String(updated._id),
          assignedNumber,
          participatedAt,
          status: completed?.status || updated.status,
          ...stats,
        });
    }
    return res
      .status(409)
      .json({
        message: "Participation conflicted with another request. Please retry.",
      });
  } catch (error) {
    next(error);
  }
}

export async function listMembers(req, res, next) {
  try {
    const [members, election] = await Promise.all([
      Member.find({ isActive: true }).select("email role"),
      getCurrentElection(),
    ]);
    const participating = new Map(
      (election?.participants || []).map((p) => [String(p.member), p]),
    );
    res.json(
      members.map((m) => ({
        email: m.email,
        role: m.role,
        hasParticipated: participating.has(String(m._id)),
        assignedNumber:
          participating.get(String(m._id))?.assignedNumber ?? null,
        participatedAt:
          participating.get(String(m._id))?.participatedAt ?? null,
      })),
    );
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const election = await getCurrentElection();
    const participation = election?.participants.find(
      (p) => String(p.member) === String(req.member._id),
    );
    res.json({
      id: String(req.member._id),
      email: req.member.email,
      role: req.member.role,
      electionId: election ? String(election._id) : null,
      hasParticipated: Boolean(participation),
      assignedNumber: participation?.assignedNumber ?? null,
      participatedAt: participation?.participatedAt ?? null,
    });
  } catch (error) {
    next(error);
  }
}

export { progress };
