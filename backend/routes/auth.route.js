import express from 'express';
import { login, logout, refresh_token, signup ,getProfile} from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { get } from 'mongoose';
const router = express.Router();

router.post('/signup',signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refresh_token);
router.post('/profile',protectRoute, getProfile);

export default router;