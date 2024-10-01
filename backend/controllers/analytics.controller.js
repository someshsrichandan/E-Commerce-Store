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

export const getDailySalesData = async (startDate, endDate) => {
    try {
       const dailSalesData = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lt: endDate,
                }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                totalSales: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" },
            }
        },
        {
            $sort: { _id: 1 }
        }
       ])
       const dataArray = getDataInRange(startDate, endDate);
       return dataArray.map((date) => {
           const data = dailSalesData.find((data) => data._id === date) || { totalSales: 0, totalRevenue: 0 };
           return {
               date,
                totalSales: foundData?.sales || 0,
                revenue: foundData?.revenue || 0,
           }
       })
        
    } catch (error) {
        console.log("error in getDailySalesData", error);
        throw new Error("Internal server error");
        
    }
}

function getDataInRange(startDate, endDate) {
    const dateArray = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().slice(0, 10));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
}