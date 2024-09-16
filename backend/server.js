import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/auth.route.js';
import { connecDB } from './lib/db.js';


dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

app.use('/api/auth', authRouter);


app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
    connecDB();
});

