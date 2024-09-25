import express from 'express';
import { adminRoute, protectRoute } from '../middleware/auth.middleware';
const router= express.Router();

router.get('/',protectRoute,adminRoute,)


export default router;