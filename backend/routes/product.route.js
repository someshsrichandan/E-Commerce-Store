import express from 'express';
const router = express.Router();
import { getAllProducts,getFeaturedProducts,createProduct ,deleteProduct} from '../controllers/product.controller.js';
import { protectRoute , adminRoute } from '../middleware/auth.middleware.js';


router.get('/',protectRoute , adminRoute, getAllProducts);
router.get('/featured', getFeaturedProducts);
router.post('/',protectRoute , adminRoute, createProduct);
router.delete('/:id',protectRoute , adminRoute, deleteProduct);

export default router;