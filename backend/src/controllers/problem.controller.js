import { db } from "../libs/db.js";
import { pollBatchResults, getJudge0LanguageId, submitBatch } from "../libs/judge0.libs.js";
   // create problem
export const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tag,
    examples,
    constraints,
    hints = "",           // optional
    editorial = "",       // optional
    testCases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  // Check user role
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "You are not allowed to create a problem",
    });
  }

  try {
    // Validate all reference solutions before saving
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        return res.status(400).json({
          error: `Language ${language} is not supported`,
        });
      }

      const submission = testCases.map(({ input, output }) => ({
        source_Code: solutionCode,
        language_Id: languageId,
        stdInp: input,
        expected_Output: output,
      }));

      console.log("Reference solution submissions for", language, ":", submission);

      let submissionResult;
      try {
        submissionResult = await submitBatch(submission);
      } catch (err) {
        console.error("Judge0 submission failed:", err.response?.data || err.message);
        return res.status(500).json({ error: "Judge0 submission failed" });
      }

      const tokens = submissionResult.map((r) => r.token);

      let results;
      try {
        results = await pollBatchResults(tokens);
      } catch (err) {
        console.error("Error polling Judge0 results:", err.response?.data || err.message);
        return res.status(500).json({ error: "Error polling Judge0 results" });
      }

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status.id !== 3) {
          console.error("Failed Testcase:", result);
          return res.status(400).json({
            error: `Testcase ${i + 1} failed for language ${language}`,
            details: result,
          });
        }
      }
    }

    // Save problem to DB
    const newProblem = await db.problem.create({
      data: {
        title,
        description,
        difficulty,           // enum: EASY / MEDIUM / HARD
        tag,                  // String[]
        examples,             // Json
        constraints,
        hints,                // optional
        editorial,            // optional
        testCases,            // Json
        codeSnippets,         // Json
        referenceSolutions,   // Json
        userId: req.user.id,
      },
    });

    console.log("Problem saved:", newProblem);

    return res.status(201).json({
      success: true,
      message: "Problem Created Successfully",
      problem: newProblem,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "Error While Creating Problem", details: error.message });
  }
};

//  get all problems
export const getAllProblems = async (req, res) => {
  try {
    const problems = await db.problem.findMany(); // 

    if (!problems || problems.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No problems found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Problems fetched successfully",
      problems,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({
      error: "Error fetching problems",
      details: error.message,
    });
  }
};
  // get problem by id
export const getProblemById = async (req, res) => {
  const { id } = req.params;

  try {
    const problem = await db.problem.findUnique({
      where: { id },
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        error: "Problem not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Problem fetched successfully",
      problem, // <-- it was 'problems', should match the variable
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({
      error: "Error fetching Problem by id",
      details: error.message,
    });
  }
};

export const getAllSolvedProblemsByUser = async (req, res) => {
    try {
      const problems =await db.problem.findMany({
        where:{
          solvedBy:{
            some:{
              userId:req.user.id
            }
          }
        },
        include:{
          solvedBy:{
            where:{
              userId:req.user.id
            }
          }
        }
      })
      res.status(200).json({
        success:true,
        message:"problems fetched successfully",
        problems
      })
      
    } catch (error) {
      console.error("error fetching problem",error)
      res.status(500).json({
        error:"failed to fetch problem"
      })
      
    }

};

export const deleteProblem = async (req, res) => {
  const { id } = req.params;

  try {
    // Correct: db.problem not db.problems
    const problem = await db.problem.findUnique({ where: { id } });

    if (!problem) {
      return res.status(404).json({
        success: false,
        error: "Problem does not exist",
      });
    }

    await db.problem.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: "Problem deleted successfully", // 'error' → 'message'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Error while deleting the problem",
      details: error.message,
    });
  }
};


export const updateProblem = async (req, res) => {
  const problemId = req.params.id;
  const {
    title,
    description,
    difficulty,
    tag,
    examples,
    constraints,
    hints = "",
    editorial = "",
    testCases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "You are not allowed to update a problem" });
  }

  try {
    // Validate reference solutions with Judge0
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);
      if (!languageId) return res.status(400).json({ error: `Language ${language} is not supported` });
      if (!solutionCode || solutionCode.trim() === "")
        return res.status(400).json({ error: `Reference solution for ${language} cannot be empty` });

      const submissions = testCases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      let submissionResult;
      try {
        submissionResult = await submitBatch(submissions);
      } catch (err) {
        console.error("Judge0 submission failed:", err.response?.data || err.message);
        return res.status(500).json({ error: "Judge0 submission failed" });
      }

      const tokens = submissionResult.map((r) => r.token);

      let results;
      try {
        results = await pollBatchResults(tokens);
      } catch (err) {
        console.error("Error polling Judge0 results:", err.response?.data || err.message);
        return res.status(500).json({ error: "Error polling Judge0 results" });
      }

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Testcase ${i + 1} failed for language ${language}`,
            details: result,
          });
        }
      }
    }

    // Update problem in DB
    const updatedProblem = await db.problem.update({
      where: { id: problemId },
      data: {
        title,
        description,
        difficulty,
        tag,
        examples,
        constraints,
        hints,
        editorial,
        testCases,
        codeSnippets,
        referenceSolutions,
        userId: req.user.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Problem Updated Successfully",
      problem: updatedProblem,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "Error While Updating Problem", details: error.message });
  }
};