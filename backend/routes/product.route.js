import express from 'express';
const router = express.Router();
import { getAllProducts } from '../controllers/product.controller.js';
import { protectRoute , adminRoute } from '../middleware/auth.middleware.js';


router.get('/',protectRoute , adminRoute, getAllProducts);

export default router;