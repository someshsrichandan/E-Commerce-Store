import { redis } from "../lib/redis.js";
import User from "../model/user.model.js";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
    const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"});
    const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "7d"});
    return {accessToken, refreshToken};
}
const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7*24*60*60);
}  
const setCookie = (res, accessToken , refreshToken) => {
    res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        samesite: "strict",
        maxAge: 15*60*1000,
    });
    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        samesite: "strict",
        maxAge: 15*7*60*1000,
    });
} 

export const signup = async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
        const userExist = await User.findOne({email});
        if(userExist){
           return res.status(400).json({message: "User already exist"});
        }
        const user = await User.create({name, email, password});

        //authenticate user
        const {accessToken, refreshToken} = generateToken(user._id);
        await storeRefreshToken(user._id, refreshToken);
        setCookie(res, accessToken, refreshToken);

        res.status(201).json({user:{
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        }, message: "User created successfully"});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};
export const login = (req, res) => {
    res.send('Hello from auth  login controller');
};
export const logout = async (req, res) => {
    try {

        const refreshToken = req.cookies.refresh_token;
        
        if(refreshToken){
            const decode =  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            
            await redis.del(`refresh_token:${decode.userId}`);
        }
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
        res.status(200).json({message: "Logout successfully"});
        
    } catch (error) {
        res.status(500).json({message:"server error",error: error.message});
    }
};