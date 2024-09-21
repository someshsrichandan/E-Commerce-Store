import express from 'express';
import { protectRoute ,getCartProducts,removeAllFromCart,updateQuantity} from '../middleware/auth.middleware';
const router = express.Router();

router.post('/' ,protectRoute, addToCart);
router.get('/' ,protectRoute, getCartProducts);
router.delete('/' ,protectRoute, removeAllFromCart);
router.put('/' ,protectRoute, updateQuantity);


export default router;  