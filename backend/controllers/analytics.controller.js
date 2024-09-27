import Product from "../model/product.model";
import User from "../model/user.model";

export const getAnalyticsData = async () => {
    try {
        const totalUsers = await User.countDocuments();
        const  totalProduct = await Product.countDocuments();

        const saleDate = await Order.aggregate([
            {
                $group: {
                  _id: null,
                  totalSales: { $sum: 1 },
                  totalRevenue: { $sum: "$totalAmount"}

                },
                }
            
        ]);

        const { totalSales, totalRevenue } = saleDate[0] || { totalSales: 0, totalRevenue: 0 };
        return { 
            user: totalUsers,
            product: totalProduct,
            totalSales,
            totalRevenue,
        };

    } catch (error) {
        console.log("error in getAnalyticsData", error);
        throw new Error("Internal server error");
    }
}