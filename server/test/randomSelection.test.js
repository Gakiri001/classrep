import test from "node:test";
import assert from "node:assert/strict";
import { secureShuffle, selectWinners } from "../utils/randomSelection.js";

test("secure shuffle preserves every entry exactly once", () => {
  const items = Array.from({ length: 13 }, (_, i) => ({ id: i }));
  const shuffled = secureShuffle(items);
  assert.equal(shuffled.length, 13);
  assert.deepEqual(
    new Set(shuffled.map((item) => item.id)),
    new Set(items.map((item) => item.id)),
  );
  assert.deepEqual(
    items.map((item) => item.id),
    Array.from({ length: 13 }, (_, i) => i),
  );
});

test("selection returns exactly two different participants", () => {
  const participants = Array.from({ length: 13 }, (_, i) => ({ id: i }));
  const winners = selectWinners(participants);
  assert.equal(winners.length, 2);
  assert.notEqual(winners[0].id, winners[1].id);
  assert.ok(winners.every((winner) => participants.includes(winner)));
});

test("selection rejects too few participants", () => {
  assert.throws(() => selectWinners([{ id: 1 }]), /Not enough participants/);
});
