import { redis } from "../lib/redis.js";
import User from "../model/user.model.js";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
}
const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60);
}
const setCookie = (res, accessToken, refreshToken) => {
    res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        samesite: "strict",
        maxAge: 15 * 60 * 1000,
    });
    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        samesite: "strict",
        maxAge: 15 * 7 * 60 * 1000,
    });
}

export const signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User already exist" });
        }
        const user = await User.create({ name, email, password });

        //authenticate user
        const { accessToken, refreshToken } = generateToken(user._id);
        await storeRefreshToken(user._id, refreshToken);
        setCookie(res, accessToken, refreshToken);

        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        console.log("error in signup controller", error);
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            const { accessToken, refreshToken } = generateToken(user._id);
            await storeRefreshToken(user._id, refreshToken);
            setCookie(res, accessToken, refreshToken);
            res.status(200).json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                }
            });
        }else{
            res.status(401).json({message: "Invalid email or password"});
        }
    } catch (error) {
        console.log("error in login controller", error);
        res.status(500).json({ message: error.message });

    }
};

export const logout = async (req, res) => {
    try {

        const refreshToken = req.cookies.refresh_token;

        if (refreshToken) {
            const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

            await redis.del(`refresh_token:${decode.userId}`);
        }
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
        res.status(200).json({ message: "Logout successfully" });

    } catch (error) {
        console.log("error in logout controller", error);
        res.status(500).json({ message: "server error", error: error.message });
    }
};

export const refresh_token = async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
        return res.status(401).json({ message: "no refresh token provided" });
    }

    const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedRefreshToken = await redis.get(`refresh_token:${decode.userId}`);
    if (refreshToken !== storedRefreshToken){
        return res.status(401).json({ message: "Invalid refresh token" });
    }
    const accessToken = jwt.sign({ userId: decode.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        samesite: "strict",
        maxAge: 15 * 60 * 1000,
    });
    res.json({message: "access token refreshed"});
    } catch (error) {
        console.log("error in refresh token controller", error);
        res.status(500).json({ message: error.message });
        
    }
    


    }

export const getProfile = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.log("error in getProfile controller", error);
        res.status(500).json({ message: error.message });
    }
};