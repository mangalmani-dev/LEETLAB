import { getLanguageName, pollBatchResults, submitBatch } from "../libs/judge0.libs.js";
import { db } from "../libs/db.js";

export const excuteCode = async (req, res) => {
  try {
    const { source_code, language_id, stdin, expected_outputs, problemId } = req.body;
    const userId = req.user.id;

    // 1. Validate the test cases
    if (
      !Array.isArray(stdin) ||
      stdin.length === 0 ||
      !Array.isArray(expected_outputs) ||
      expected_outputs.length !== stdin.length
    ) {
      return res.status(400).json({ error: "Invalid or missing testCases" });
    }

    // 2. Prepare submissions for Judge0 batch
    const submissions = stdin.map(input => ({
      source_code,
      language_id,
      stdin: input
    }));

    // 3. Submit batch to Judge0
    const submitResponse = await submitBatch(submissions);

    // 4. Extract tokens
    const tokens = submitResponse.map(r => r.token);

    // 5. Poll Judge0 for results
    const results = await pollBatchResults(tokens);
    console.log("Submission Results:", results);

    // 6. Analyze results
    let allPassed = true;
    const detailResults = results.map((result, i) => {
      const stdout = result.stdout?.trim() || "";
      const expected = expected_outputs[i]?.trim() || "";
      const passed = stdout === expected;

      if (!passed) allPassed = false;

      return {
        testCase: i + 1,
        passed,
        stdout,
        expected,
        stderr: result.stderr || null,
        compile_output: result.compile_output || null,
        status: result.status.description,
        memory: result.memory ? `${result.memory} kb` : undefined,
        time: result.time ? `${result.time} s` : undefined
      };
    });

    console.log(detailResults);

    // 7. Store submission summary in DB
    const submission = await db.submission.create({
      data: {
        userId,
        problemId,
        sourceCode: source_code,
        language: getLanguageName(language_id),
        stdin: stdin.join("\n"),
        stdout: JSON.stringify(detailResults.map(r => r.stdout)),
        stderr: detailResults.some(r => r.stderr)
          ? JSON.stringify(detailResults.map(r => r.stderr))
          : null,
        compileOutput: detailResults.some(r => r.compile_output)
          ? JSON.stringify(detailResults.map(r => r.compile_output))
          : null,
        status: allPassed ? "accepted" : "Wrong_answer",
        memory: detailResults.some(r => r.memory)
          ? JSON.stringify(detailResults.map(r => r.memory))
          : null,
        time: detailResults.some(r => r.time)
          ? JSON.stringify(detailResults.map(r => r.time))
          : null
      }
    });

    // 8. Mark problem as solved if all passed (without changing schema)
    if (allPassed) {
      const alreadySolved = await db.problemSolved.findFirst({
        where: { userId, problemId }
      });

      if (!alreadySolved) {
        await db.problemSolved.create({
          data: { userId, problemId }
        });
      }
    }

    // 9. Save individual test case results
    const testCaseResults = detailResults.map(result => ({
      submissionId: submission.id,
      testCase: result.testCase,
      passed: result.passed,
      stdout: result.stdout,
      expected: result.expected,
      stderr: result.stderr,
      compileOutput: result.compile_output,
      status: result.status,
      memory: result.memory,
      time: result.time
    }));

    await db.TestCaseResult.createMany({ data: testCaseResults });

    // 10. Fetch submission with test case results
    const submissionWithTestCase = await db.submission.findUnique({
      where: { id: submission.id },
      include: { testCases: true }
    });

    res.status(200).json({
      success: true,
      message: "Code executed successfully",
      submission: submissionWithTestCase
    });

  } catch (error) {
    console.error("Execution Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
