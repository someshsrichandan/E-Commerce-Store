import { redis } from '../lib/redis.js';
import Product from '../model/product.model.js';

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({ products });
    } catch (error) {
        console.log("error in getAllProducts controller", error);
        res.status(500).json({ message: error.message });
    }
}

export const getFeaturedProducts = async (req, res) => {
    try {
        const featuredProducts = await redis.get("featuredProducts");
        if (featuredProducts) {
            return res.json({ products: JSON.parse(featuredProducts) });
        }
        featuredProducts = await Product.find({ isFeatured: true }).lean();
        if (!featuredProducts) {
            return res.status(404).json({ message: "Featured products not found" });
        }
        await redis.set("featuredProducts", JSON.stringify(featuredProducts));
        res.json(featuredProducts)
    } catch (error) {
        console.log("error in getFeaturedProducts controller", error);
        res.status(500).json({ message: error.message });
    }
}

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, category } = req.body;
        let cloudinaryResponse = null;
        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image, {
                folder: "Products",
            });
        }
        const product = await Product.create({
            name,
            description,
            price,
            image:cloudinaryResponse?.secure_url || "",
            category
        });
        res.status(201).json(product);

    } catch (error) {
        console.log("error in createProduct controller", error);
        res.status(500).json({ message: error.message });

    }
}

export const deleteProduct = async (req, res) => {
    try {
        const product = req.params.id;
        if(!product){
            return res.status(400).json({message:"Product id is required"});
        }
        if(product.image){
            const publicId  = product.image.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`);
            } catch (error) {
                console.log("error deleting image in cloudinary", error);
                res.status(500).json({ message: error.message });
                
            }
        }
        await Product.findByIdAndDelete(product);
        res.json({message:"Product deleted successfully"});
        
    } catch (error) {
        console.log("error in deleteProduct controller", error);
        res.status(500).json({ message: error.message });
        
    }
}

export const getRecommendedProducts = async (req, res) => {
    try {
        const product = await Product.aggregate([
            { $sample: { size: 3 } },{
                $project:{
                    name:1,
                    description:1,
                    price:1,
                    image:1,
                    category:1
            }
        }
        ]);
        
    } catch (error) {
        console.log("error in getRecommendedProducts controller", error); 
        res.status(500).json({ message: error.message });
    }
}

export const getProductsByCategory = async (req, res) => {
    const {category} = req.params;
    try {
        const products = await Product.find({category});
        res.json(products);
    } catch (error) {
        console.log("error in getProductsByCategory controller", error);
        res.status(500).json({ message: error.message });   
    }
}

export const toggleFeaturedProduct = async (req, res) => {
    const {id} = req.params;
    try {
        const product = await Product.findById(req.params.id);
        if(product){
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save();
            await updateFeaturedProductsCache();
            res.json(updatedProduct);
        }else{
            res.status(404).json({message:"Product not found"});
        }
        
    } catch (error) {
        console.log("error in toggleFeaturedProduct controller", error);
        res.status(500).json({ message: error.message });
        
    }

}

async function updateFeaturedProductsCache(){
    try {
        const featuredProducts = await Product.find({isFeatured:true}).lean();
        await redis.set("featuredProducts",JSON.stringify(featuredProducts));

    } catch (error) {
        console.log("error in updateFeaturedProductsCache controller", error);
    }
}