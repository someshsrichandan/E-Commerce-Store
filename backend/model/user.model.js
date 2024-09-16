import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],

    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minilength: [6, "Password must be at least 6 characters"],
    }, cartItem: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "Product",
            },
            quantity: {
                type: Number,
                required: true,
                default: 1
            }
        }
    ],
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer",
    },

},{timeStamps: true});


userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.matchPassword = async function(password){
 return await bcrypt.compare(password, this.password);
};


const User = mongoose.model("User", userSchema);

export default User;