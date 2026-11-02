import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getMe,
  listMembers,
  participate,
} from "../controllers/memberController.js";

const router = Router();
router.get("/", authenticate, listMembers);
router.get("/me", authenticate, getMe);
router.post("/participate", authenticate, participate);
export default router;
