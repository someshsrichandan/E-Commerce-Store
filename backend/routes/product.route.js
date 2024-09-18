import express from 'express';
const router = express.Router();
import { getAllProducts,getFeaturedProducts } from '../controllers/product.controller.js';
import { protectRoute , adminRoute } from '../middleware/auth.middleware.js';


router.get('/',protectRoute , adminRoute, getAllProducts);
router.get('/featured', getFeaturedProducts);

export default router;