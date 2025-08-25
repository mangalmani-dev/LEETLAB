import axios from "axios";

// Get Judge0 language ID from language name
export const getJudge0LanguageId = (language) => {
  const languageMap = {
    PYTHON: 71,
    JAVA: 62,
    JAVASCRIPT: 63,
  };

  return languageMap[language.toUpperCase()];
};

// Sleep helper for polling
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Poll Judge0 batch submissions until all are done
export const pollBatchResults = async (tokens) => {
  while (true) {
    const { data } = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`, {
      params: {
        tokens: tokens.join(","),
        base64_encoded: false,
      },
    });

    const results = data.submissions;

    const isAllDone = results.every((r) => r.status.id !== 1 && r.status.id !== 2);

    if (isAllDone) return results;

    await sleep(1000);
  }
};

// Submit a batch of code submissions to Judge0
export const submitBatch = async (submissions) => {
  // Map your submissions to Judge0 expected keys with fallback
  const payload = submissions.map((s) => ({
    source_code: s.source_code || s.source_Code,
    language_id: s.language_id || s.language_Id,
    stdin: s.stdin || s.stdInp,
    expected_output: s.expected_output || s.expected_Output,
  }));

  const { data } = await axios.post(
    `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
    { submissions: payload }
  );

  console.log("Submission Results: ", data);

  return data; // Returns array like [{ token }, { token }, ...]
};


export function getLanguageName(languageId){
   const LANGUAGE_NAME={
      74 :"TypeScript",
      63:"javaScript",
      71 :"Python",
       62 :"Java"
   }
   return LANGUAGE_NAME[languageId]|| "unknown"

}