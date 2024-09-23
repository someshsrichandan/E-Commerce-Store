import { Coupon } from "../model/coupon.model.js";

export const getCoupon = asyncHandler(async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ userId: req.user._id , isActive: true});
        res.json(coupon || null );
    } catch (error) {
        console.log("error in getCoupon controller", error);
        res.status(500).json({ message: error.message });
        
    }
});