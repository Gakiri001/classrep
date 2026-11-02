import { randomInt } from "node:crypto";

export function secureShuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function selectWinners(participants, count = 2) {
  if (participants.length < count)
    throw new Error("Not enough participants to draw winners.");
  return secureShuffle(participants).slice(0, count);
}

export default selectWinners;
