import mongoose  from "mongoose";

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    description:{
        type: String,
        required: [true, "Description is required"],
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price must be greater than 0"],
    },
    image: {
        type: String,
        required: [true, "Image is required"],
    },
    catagory: {
        type: String,
        required: [true, "Catagory is required"],
    },
    isFeatured: {
        type: Boolean,
        default: false,
    }

    }
,{timestamps: true});

const Product = mongoose.model("Product", productSchema);

export default Product;