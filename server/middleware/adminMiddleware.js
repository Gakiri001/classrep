import Member from "../models/Member.js";
import { authenticate } from "./authMiddleware.js";

export async function requireAdmin(req, res, next) {
  try {
    const member = await Member.findById(req.member?._id).select(
      "role isActive",
    );
    if (!member?.isActive || member.role !== "SUPER_ADMIN")
      return res.status(403).json({ message: "Super Admin access required." });
    req.member = { ...req.member.toObject(), role: member.role };
    next();
  } catch (error) {
    next(error);
  }
}

export const adminAuth = [authenticate, requireAdmin];
export default requireAdmin;
