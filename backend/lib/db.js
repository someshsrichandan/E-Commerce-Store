import mongoose from "mongoose";
export const  connecDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI,)
        console.log(`MongoDB connected: ${conn.connection.host}`);
        
    } catch (error) {
        console.log(`Error connecting to MonogoDB: ${error.message}`);
        process.exit(1); 
        
    }
}