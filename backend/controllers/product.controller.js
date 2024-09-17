import Product from '../model/product.model.js';

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({products});
    } catch (error) {
        console.log("error in getAllProducts controller", error);
        res.status(500).json({ message: error.message });
    }
}