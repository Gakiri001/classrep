import Election from "../models/Election.js";
import { selectWinners } from "./randomSelection.js";
import { getIo } from "./realtime.js";

export async function completeElectionIfReady(electionId) {
  const election = await Election.findOne({ _id: electionId, status: "OPEN" });
  if (!election || election.participants.length !== election.totalMembers)
    return null;
  const winners = selectWinners(
    election.participants,
    election.requiredWinners,
  ).map((p) => ({
    member: p.member,
    email: p.email,
    assignedNumber: p.assignedNumber,
  }));
  const completedAt = new Date();
  const completed = await Election.findOneAndUpdate(
    {
      _id: election._id,
      status: "OPEN",
      $expr: { $eq: [{ $size: "$participants" }, "$totalMembers"] },
    },
    {
      $set: {
        status: "COMPLETED",
        winners,
        completedAt,
        drawMetadata: {
          algorithm: "Fisher-Yates with crypto.randomInt",
          drawnAt: completedAt,
          participantCount: election.participants.length,
        },
      },
    },
    { new: true },
  );
  if (completed)
    getIo()?.emit("electionCompleted", {
      electionId: String(completed._id),
      status: completed.status,
      winners: completed.winners,
      completedAt,
    });
  return completed;
}
