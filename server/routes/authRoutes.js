import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { requestOtp, verifyOtp } from "../controllers/authController.js";

const router = Router();
const otpLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Try again later." },
});
router.post("/request-otp", otpLimiter, requestOtp);
router.post("/verify-otp", otpLimiter, verifyOtp);
export default router;
