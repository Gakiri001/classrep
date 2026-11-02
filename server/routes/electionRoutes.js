import { Router } from "express";
import {
  getElectionHistory,
  getElectionResults,
  getElectionStatus,
  validateObjectId,
} from "../controllers/electionController.js";

const router = Router();
router.get("/status", getElectionStatus);
router.get("/results", getElectionResults);
router.get("/results/:electionId", validateObjectId, getElectionResults);
router.get("/history", getElectionHistory);
export default router;
