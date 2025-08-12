import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";

     // register controllers
export const register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: UserRole.USER
      }
    });

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        image: newUser.image
      }
    });

  } catch (error) {
    console.log("error in creating user", error);
    res.status(500).json({ error: "Error in creating user" });
  }
};

    // login controllers
export const login=async(req, res)=>{
    const {email,password}=req.body;
try {
    const user=await db.user.findUnique({
        where:{
            email
        }
    })

    if(!user){
        return res.status(401).json({
            error:"user not found"
        })
    }

    const ismatch=await bcrypt.compare(password,user.password)

    if(!ismatch){
        return res.status(402).json({
            error:"invalid crediantilas"
        })
    }

const token= jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    });

    res.status(200).json({
      message: "User login successfully",
      user: {
        id: user.id,
        email: user.email,
        name:user.name,
        role:user.role,
        image: user.image
      }
    });
} catch (error) {
     console.log("error in creating user", error);
    res.status(500).json({ error: "error in login in user" });
}
}

// logut user

export const logout=async(req, res)=>{
    try {
        res.clearCookie("jwt",{
            httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
        })
        res.status(200).json({
            succes:true,
            message:"user logout succesfull"
        })
        
    } catch (error) {
        return res.status(221).json({
          message:"User unable to logout",
          error:error
        })
    }

}

// check

export const check = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "User authenticated successfully",
      user: req.user
    });
  } catch (error) {
    console.error("Error in authentication", error);
    res.status(500).json({
      message: "Error in authenticating user"
    });
  }
};


