export const getCoupon = asyncHandler(async (req, res) => {
    try {
        
    } catch (error) {
        console.log("error in getCoupon controller", error);
        res.status(500).json({ message: error.message });
        
    }
});