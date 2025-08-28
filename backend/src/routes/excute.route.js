import express from "express"
import { authmiddleware } from "../middleware/auth.middleware.js"
import { excuteCode } from "../controllers/excuteCode.controller.js"

const excutionRoute =express.Router()

excutionRoute.post("/",authmiddleware,excuteCode)




export default excutionRoute