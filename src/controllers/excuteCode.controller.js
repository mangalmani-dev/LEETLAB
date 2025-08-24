import { pollBatchResults, submitBatch } from "../libs/judge0.libs.js"

export const excuteCode =async(req,res)=>{

    try { 
        const {source_code, language_id,stdin, expected_outputs, problemId}=req.body

        const userId=req.user.id

        // validate the test cases

        if(
            !Array.isArray(stdin)||
            stdin.length===0||
            !Array.isArray(expected_outputs)||
            expected_outputs.length!==stdin.length

        ){
            res.status(400).json({
                error :"Invalid or missing testCases"
            })
        }
        // 2 . prepare each test cases for judge0 batch submission

        const submissions =stdin.map((input)=>({
            source_code,
            language_id,
            stdin:input
       
        }))
        
        // 3 send this batch to jugde0

        const submitResponse=await submitBatch(submissions)

        const tokens =submitResponse.map((res)=>res.tokens)

        /// 3 poll the jude0 for all submitted for all result test cases

        const results=await pollBatchResults(tokens)

        console.log("Result ---------------------");
        console.log(results);
        res.status(200).json({
            message :"Code Excuted"
        })
        


    } catch (error) {
        
    }

}