import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../libs/db.js";

dotenv.config();

export const authmiddleware = async (req, res, next) => {
  try {
    // 1. Get token from cookie
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized: No token provided",
      });
    }

    // 2. Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET); 
    } catch (error) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    // 3. Fetch user from DB
    const user = await db.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 4. Attach user to request
    req.user = user;

    // 5. Proceed to next middleware or controller
    next();

  } catch (error) {
    console.error("Error in authentication middleware:", error);
    res.status(500).json({
      message: "Error in authenticating user",
    });
  }
};


// check admin

export const checkAdmin=async (req,res,next)=>{
  try {
    const userId=req.user.id;
    const user=await db.user.findUnique({
      where:{
        id:userId
      },
      select :{
        role:true
      }
    })
    if(!user||user.role!=="ADMIN"){
      return res.status(403).json({
        message :"Forbidden you do not have a permission to use it"
      })

    }
    next()
  } catch (error) {

    console.error("error checking admin role",error)
    return res.status(500).json({message :"errror checkin admin role"})
    
  }
}
