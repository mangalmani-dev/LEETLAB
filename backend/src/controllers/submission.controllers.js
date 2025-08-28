import { db } from "../libs/db.js";

// ✅ Get all submissions of a logged-in user
export const getAllSubmission = async (req, res) => {
  try {
    const userId = req.user.id;

    const submissions = await db.submission.findMany({
      where: { userId },
    });

    return res.status(200).json({
      success: true,
      message: "Submissions fetched successfully",
      submissions,
    });
  } catch (error) {
    console.error("fetch submission error", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
};

// ✅ Get all submissions of a specific problem for a logged-in user
export const getSubmissionsForProblem = async (req, res) => {
  try {
    const userId = req.user.id;
    const problemId = req.params.problemId;

    const submissions = await db.submission.findMany({
      where: { userId, problemId }, // ✅ added userId filter
    });

    return res.status(200).json({
      success: true,
      message: "Submissions for problem fetched successfully",
      submissions,
    });
  } catch (error) {
    console.error("fetching submissions error", error);
    res.status(500).json({ error: "Failed to fetch submissions for problem" });
  }
};

// ✅ Get ALL submissions for a problem (from all users) → useful for admin
export const getAllTheSubmissionForProblem = async (req, res) => {
  try {
    const problemId = req.params.problemId;

    const submissions = await db.submission.findMany({
      where: { problemId },
    });

    return res.status(200).json({
      success: true,
      message: "All submissions for problem fetched successfully",
      submissions, // ✅ changed field name to match the content
      total: submissions.length, // optional count
    });
  } catch (error) {
    console.error("fetching all problem submissions error", error);
    res.status(500).json({ error: "Failed to fetch all submissions for problem" });
  }
};
