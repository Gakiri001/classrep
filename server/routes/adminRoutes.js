import { Router } from "express";
import { adminAuth } from "../middleware/adminMiddleware.js";
import {
  archiveElection,
  dashboard,
  renewElection,
} from "../controllers/adminController.js";
import { validateObjectId } from "../controllers/electionController.js";

const router = Router();
router.use(adminAuth);
router.get("/dashboard", dashboard);
router.post("/elections/renew", renewElection);
router.post(
  "/elections/:electionId/archive",
  validateObjectId,
  archiveElection,
);
export default router;
