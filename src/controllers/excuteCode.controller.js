import { getLanguageName, pollBatchResults, submitBatch } from "../libs/judge0.libs.js"

export const excuteCode = async (req, res) => {
    try { 
        const { source_code, language_id, stdin, expected_outputs, problemId } = req.body
        const userId = req.user.id

        // validate the test cases
        if (
            !Array.isArray(stdin) ||
            stdin.length === 0 ||
            !Array.isArray(expected_outputs) ||
            expected_outputs.length !== stdin.length
        ) {
            return res.status(400).json({
                error: "Invalid or missing testCases"
            })
        }

        // 2. prepare each test case for judge0 batch submission
        const submissions = stdin.map(input => ({
            source_code,
            language_id,
            stdin: input
        }))
        
        // 3. send this batch to judge0
        const submitResponse = await submitBatch(submissions)

        // 4. extract tokens correctly
        const tokens = submitResponse.map(r => r.token)

        // 5. poll judge0 for all submitted test case results
        const results = await pollBatchResults(tokens)

        console.log("Result ---------------------")
        console.log(results)

        // analyze the results using map
        let allPassed = true
        const detailResults=results.map((result, i) => {
            const stdout = result.stdout?.trim() || ""
            const expected = expected_outputs[i]?.trim() || ""
            const passed = stdout === expected

            if (!passed) allPassed = false

            return {
                testCase :i+1,
                passed,
                stdout,
                expected:expected_outputs,
                stderr:result.stderr||null,
                compile_output:result.compile_output||null,
                status:result.status.description,
                memory :result.memory ?`${result.memory} kb`:undefined,
                time :result.time ? `${result.time} s`:undefined
            }

            // console.log(`Testcase #${i + 1}`)
            // console.log(`Input: ${stdin[i]}`)
            // console.log(`Expected: ${expected}`)
            // console.log(`Actual: ${stdout}`)
            // console.log(`Matched: ${passed}`)
        })
       
        console.log(detailResults);
        

        res.status(200).json({
            message: "Code Executed",
          
        })

        // store submission summary in db

        const submission =await db.submission.create({
            data:{
                userId,
                problemId,
                source_code,
                language:getLanguageName(language_id),
                stdin:stdin.join("/n"),
                stdout:JSON.stringify(detailResults.map((r)=>{r.stdout})),
                stderr:detailResults.some((r)=>r.stderr)
                ? JSON.stringify(detailResults.map((r)=>r.stderr)):null,
                compileOutput :detailResults.some((r)=>r.compile_output)
                ? JSON.stringify(detailResults.map((r)=>r.compile_output)):null,
                status : allPassed ?"accepted": "Wrong_answer",
                  memory :detailResults.some((r)=>r.memory)
                ? JSON.stringify(detailResults.map((r)=>r.memory)):null,
                  time :detailResults.some((r)=>r.time)
                ? JSON.stringify(detailResults.map((r)=>r.time)):null,

                
            }
        })


        // if all passed true marked as done for user

        if(allPassed){
            await db.problemSolved.upsert({
                where:{
                    userId_problemId:{
                        userId,problemId
                    }
                },
                update:{},
                create:{
                    userId,problemId
                }
            })
        }





    } catch (error) {
        console.error(error)
        res.status(500).json({
            error: "Server error"
        })
    }
}
