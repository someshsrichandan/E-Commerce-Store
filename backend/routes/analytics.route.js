import express from 'express';
import { adminRoute, protectRoute } from '../middleware/auth.middleware';
import getAnalyticsData from '../controllers/analytics.controller.js';
import { get } from 'mongoose';
const router= express.Router();

router.get('/',protectRoute,adminRoute, async (req, res) => {
    try {
        const analyticsData = await getAnalyticsData();
    } catch (error) {
        console.log("error in analytics route", error);
        res.status(500).json({ message: error.message });
    }
})


export default router;