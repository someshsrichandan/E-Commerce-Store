import { stripe } from "../lib/stripe.js";
import Coupon  from "../model/coupon.model.js";
import Order from "../model/order.model.js";    


export const createCheckoutSession = async (req, res) => {
    try {
        const {product, couponCode} = req.body;
        if(!Array.isArray(product) || product.length === 0){
            return res.status(400).json({ message: "Invalid or empty product" });
        }
        let totalAmount = 0;
        const lineItems = product.map((product) => {
            const amount = product.price * 100;
            totalAmount += amount + product.quantity;
            return{
                price_data:{
                    currency: "usd",
                    product_data:{
                        name: product.name,
                        images: [product.image],
                    },
                    unit_amount: amount,
                }
            }
        });
        let coupon = null;
        if(couponCode){
            coupon = await Coupon.findOne({code:couponCode, userId: req.user._id, isActive:true});
            if(coupon){
                totalAmount -= Math.round(totalAmount * coupon.discountPercentage / 100);
            }
        }
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-canlcel`,
            discounts: coupon ? [{coupon: await createStripCoupon(coupon.discountPercentage)}] : [],
            metadata: {
                userId: req.user._id.toString(),
                couponCode: couponCode || "", 
                products: JSON.stringify(
                    product.map((p) => ({
                        productId: p._id.toString(),
                        quantity: p.quantity,
                        price: p.price,
                    }))
                ),
            },

        });
        if(totalAmount > 20000){
            await createNewCoupon(req.user._id);
        }
        res.status(200).json({ id: session.id , totalAmount:totalAmount / 100});
    } catch (error) {
       console.log(error);
       res.status(500).json({ message: "Internal server error" });
        
    }
}

export const checkoutSuccess = async (req, res) => {
    try {
        const {sessionId} = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if(session.payment_status === 'paid'){
           if(session.metadata.couponCode){
            await Coupon.findOneAndUpdate({code:session.metadata.couponCode, userId: session.metadata.userId},{
                isActive: false
            });
           }
           const products = JSON.parse(session.metadata.products);
           const newOrder = new Order({
            user:session.metadata.userId,
            products: products.map((product) => ({
                product: product.productId,
                quantity: product.quantity,
                price: product.price,
            })),
            totalAmount: session.amount_total / 100,  
            stripeSessionId: sessionId,
            
           })
           await newOrder.save();
        }
    } catch (error) {
        console.log("error in checkout-success route", error);
        res.status(500).json({ message: error.message });
    }
}
async function createStripCoupon(discountPercentage){
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    });
    return coupon.id;
}

async function createNewCoupon(discountPercentage){
    const newCoupon = new Coupon({
        code: "GIFT" + Math.random().toString(36).substring(2,8).toUpperCase(),
        discountPercentage:10,
        expirationDate: new Date(Date.now() + 30* 24 * 60 * 60 * 24 * 1000),
        userId: userId

    })

    return newCoupon;
}
