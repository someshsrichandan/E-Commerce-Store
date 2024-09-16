import User from "../model/user.model.js";

export const signup = async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
        const userExist = await User.findOne({email});
        if(userExist){
            res.status(400).json({message: "User already exist"});
        }
        const user = await User.create({name, email, password});
        res.status(201).json({user, message: "User created successfully"});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};
export const login = (req, res) => {
    res.send('Hello from auth  login controller');
};
export const logout = (req, res) => {
    res.send('Hello from auth logout controller');
};