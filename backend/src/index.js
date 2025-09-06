import express from "express";
import cors from "cors"
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import problemsRoutes from "./routes/problem.routes.js";
import excutionRoute from "./routes/excute.route.js";
import authRoutes from "./routes/auth.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import playlistRoutes from "./routes/playlists.routes.js";
dotenv.config()

// here we are providing power of express to app
const app=express();

// here we are make our app to get json file give and take
app.use(express.json())

app.use(express.urlencoded({ extended: true }));

// we are allowing the cookie related stuff
app.use(cookieParser())

// using cors
app.use(
    cors({
        origin :" http://localhost:5173",
        credentials:true
    })
)

// we are making api for authencation
app.use('/api/v1/auth',authRoutes)

// we are makig the problems realated api
app.use('/api/v1/problems',problemsRoutes)

// we are making code excuatioon 

app.use('/api/v1/execute-code',excutionRoute)

app.use('/api/v1/submission',submissionRoutes)

app.use('/api/v1/playlists',playlistRoutes)

app.get("/",(req,res)=>{
    res.send("hello jee kiya hal chal")
})



app.listen(process.env.PORT,()=>{
    console.log("server is running on port 8080");
    
})