import jwt from "jsonwebtoken";
import User from "../model/user.model.js";
export const protectRoute = async (req, res, next) => { 
try {
    const accessToken = req.cookies.access_token;
    if (!accessToken) {
        return res.status(401).json({ message: "You are not authenticated" });
    }
    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.userId).select("-password");
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        req.user = user;
        
        next();

    } catch (error) {
        console.log("error in protectRoute middleware", error);
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
  

} catch (error) {
    console.log("error in protectRoute middleware", error);
    res.status(500).json({ message: error.message });
}

}

export const adminRoute = async (req, res, next) => {
    try {
        const user = req.user;
        if (user && user.role === 'admin') {
            
            next();
        } else {
            
            res.status(403).json({ message: "Not authorized as an admin" });
        }
    } catch (error) {
        
        console.log("error in adminRoute middleware", error);
        res.status(500).json({ message: error.message });
    }
}   

