import express from "express";
import { authmiddleware } from "../middleware/auth.middleware.js";
import { 
  getAllSubmission, 
  getAllTheSubmissionForProblem, 
  getSubmissionsForProblem 
} from "../controllers/submission.controllers.js";

const submissionRoutes = express.Router();

// 1. Get all submissions of logged-in user
submissionRoutes.get("/get-all-submission", authmiddleware, getAllSubmission);

// 2. Get submissions of logged-in user for a specific problem
submissionRoutes.get("/get-submission/:problemId", authmiddleware, getSubmissionsForProblem);

// 3. Get all submissions for a problem (all users) → admin/leaderboard
submissionRoutes.get("/get-submissions-for-problem/:problemId", authmiddleware, getAllTheSubmissionForProblem);

export default submissionRoutes;
