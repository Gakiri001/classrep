import Election from "../models/Election.js";

export async function getCurrentElection() {
  return (
    (await Election.findOne({ status: "OPEN" })) ||
    Election.findOne().sort({ startedAt: -1 })
  );
}
