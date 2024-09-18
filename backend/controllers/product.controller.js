import { redis } from '../lib/redis.js';
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

export const getFeaturedProducts = async (req, res) => {
    try {
        const featuredProducts = await redis.get("featuredProducts");
        if (featuredProducts) {
            return res.json({products: JSON.parse(featuredProducts)});
        }
        featuredProducts = await Product.find({isFeatured: true}).lean();
        if(!featuredProducts){
            return res.status(404).json({message: "Featured products not found"});
        }
        await redis.set("featuredProducts", JSON.stringify(featuredProducts));
        res.json(featuredProducts)
    } catch (error) {
        console.log("error in getFeaturedProducts controller", error);
        res.status(500).json({ message: error.message });
    }
}   