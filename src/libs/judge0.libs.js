import axios from "axios"

export const getJudge0LanguageId =(language)=>{
       const languagemap ={
        "PYTHON":71,
        "JAVA":62,
        "JAVASCRIPT":63
       }

       return languagemap[language.toUpperCase()]||null
}


export const submitBatch= async(submission)=>{
    const {data}=await axios.post(`${process.env.JUDGE0_API_URL}/submission/batch?base64_encoded=false`,{
        submission
    })

    console.log("submissiom result",data)

    return data // [{token}, {token}]  jo humne diffrent languge me code bheje hai uske related token mila hai

}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const pollBatchResult = async (tokens) => {
  while (true) {
    const { data } = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`, {
      params: {
        tokens: tokens.join(","),
        base64_encoded: false,
      },
    });

    const results = data.submissions; // Judge0 returns 'submissions' array

    const isAllDone = results.every(
      (r) => r.status.id !== 1 && r.status.id !== 2 // 1=In Queue, 2=Processing
    );

    if (isAllDone) return results;

    await sleep(1000); // wait before next poll
  }
}
