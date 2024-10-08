import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/auth.route.js';
import productRouter from './routes/product.route.js';
import cartRouter from './routes/cart.route.js';
import couponRouter from './routes/coupon.route.js';
import paymentsRouter from './routes/payments.route.js';
import analyticsRouter from './routes/analytics.route.js';
import { connecDB } from './lib/db.js';
import cookieParser from 'cookie-parser';




dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());


const PORT = process.env.PORT || 5000;

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/coupons', couponRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/analytics' , analyticsRouter);



app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
    connecDB();
});

