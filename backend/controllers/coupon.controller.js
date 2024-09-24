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

export const validateCoupon = asyncHandler(async (req, res) => {
    try {
        const {code} = req.body;
        const coupon = await Coupon.findOne({code:code,userId: req.user._id,isActive:true});
        if(!coupon){
            return res.status(400).json({message: "Invalid Coupon"});
        }
        if(coupon.expirationDate < new Date()){
            coupon.isActive = false;
            await coupon.save();
            return res.status(400).json({message: "Coupon Expired"});
        }
        res.json({
            message: "Coupon is Vaild",
            code:coupon.code,
            discountPercentage:coupon.discountPercentage
        })
    } catch (error) {
        console.log("error in validateCoupon controller", error);
        res.status(500).json({ message: error.message });
        
    }
}
);