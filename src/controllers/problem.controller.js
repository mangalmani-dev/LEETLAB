import {db} from "../libs/db.js"
import { pollBatchResult } from "../libs/judge0.libs.js"
export const createProblem=async (req,res)=>{

    // going to get all the data from the request body

    const {title, description,  difficulty,tag,examples,constarints ,  testCases, 
         codeSnipptes,refranceSolutions}= req.body
     
    //going to get the user role once again

    if(req.user.role!=='ADMIN'){
        res.status(403).json({
            error:"you are not allowed to create a problem"
        })
    }

    try {
         for(const [language,solutionCode] of Object.entries(refranceSolutions)){// hum log language and uska code nikal rahe hai
        const languageId=getJudge0LanguageId(language)
         

         if(!languageId){
            return res.status(400).json({
                error:`Language ${language} is not supported`
            })}

            const submission=testCases.map(({input,output})=>({
                source_Code:solutionCode,
                language_Id:languageId,
                stdInp:input,
                expected_Output:output

            }))

            const submissionResult=await submitBatch(submission)

            const tokens= submissionResult.map((res)=>res.token)

            const results= await pollBatchResult(tokens)

            for(let i=0;i<results.length;i++){
                const result=results[i]

                if(result.status.id!==3){
                    return res.status(400).json({
                        error:`Testcasee ${i+1} failed for the language ${language}`
                })
                }
            }

            // save the problem to database

            const newProblem=await db.problem.create({
                data:{
                    title, description,  difficulty,tag,examples,constarints ,  testCases, 
                     codeSnipptes,refranceSolutions,userId:req.user.id
                }
            })

           return  res.status(201).json(new problem)

         }
    } catch (error) {
        
    }
    //loop through each refreance solution from the given language
    //



}

export const getAllProblems=async(req,res)=>{}


export const getAllSolvedProblemsByUser=async(req,res)=>{}

export const deleteProblem=async(req,res)=>{}


export const updateProblem=async(req,res)=>{}

export const getProblemById=async(req,res)=>{}



