import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Member from "../models/Member.js";
import Election from "../models/Election.js";

const emails = [
  "vmwanzam@gmail.com",
  "opentvet@gmail.com",
  "simonthuranira5@gmail.com",
  "m.mugomorris@gmail.com",
  "oyoriobegi@gmail.com",
  "kenmwangi273@gmail.com",
  "kioko.kisua22@students.dkut.ac.ke",
  "gakirijulius@gmail.com",
  "ndemiflorence@gmail.com",
  "denniskibiwott2001@gmail.com",
  "kelvohndungu001@gmail.com",
  "gitongasally4@gmail.com",
  "mutisorhodah202@gmail.com",
];

try {
  await connectDB();
  for (const email of emails) {
    const role = email === "gakirijulius@gmail.com" ? "SUPER_ADMIN" : "VOTER";
    await Member.updateOne(
      { email },
      { $set: { role }, $setOnInsert: { email, isActive: true } },
      { upsert: true },
    );
  }
  if (!(await Election.exists({ status: "OPEN" }))) {
    await Election.create({
      title: "MSc Computer Science Class Representatives Election",
      totalMembers: 13,
      requiredWinners: 2,
      status: "OPEN",
    });
  }
  console.log(
    "Seed completed: 13 registered members and an open election are available.",
  );
} catch (error) {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
