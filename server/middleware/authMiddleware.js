import jwt from "jsonwebtoken";
import Member from "../models/Member.js";

export async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;
    if (!token)
      return res.status(401).json({ message: "Authentication required." });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const member = await Member.findById(payload.sub).select(
      "_id email role isActive",
    );
    if (!member?.isActive)
      return res.status(401).json({ message: "Authentication required." });
    req.member = member;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired authentication." });
  }
}

export default authenticate;
