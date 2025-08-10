import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import problemsRoutes from "./routes/problem.routes.js";


import authRoutes from "./routes/auth.routes.js";
dotenv.config()

const app=express();


app.use(express.json())

app.use(cookieParser())

app.use('/api/v1/auth',authRoutes)

app.use('/api/v1/problems',problemsRoutes)

app.use("/",(req,res)=>{
    res.send("hello jee kiya hal chal")
})




app.listen(process.env.PORT,()=>{
    console.log("server is running on port 8080");
    
})