import express from "express"
import { authmiddleware, checkAdmin } from "../middleware/auth.middleware.js"
import { createProblem ,getAllProblems,updateProblem,getProblemById,getAllSolvedProblemsByUser,deleteProblem} from "../controllers/problem.controller.js"


 const problemsRoutes=express.Router()

 problemsRoutes.post("/create-problem",authmiddleware,checkAdmin,createProblem)

 problemsRoutes.get("/get-all-problems",authmiddleware,getAllProblems)

 problemsRoutes.get("/get-problem/:id",authmiddleware,getProblemById)

 problemsRoutes.put("/update-problem/:id",authmiddleware,checkAdmin,updateProblem)


 problemsRoutes.delete("/delete-problem/:id",authmiddleware,checkAdmin,deleteProblem)

 problemsRoutes.get("/get-solved-problems",authmiddleware,getAllSolvedProblemsByUser)

 export default problemsRoutes