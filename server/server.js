//⁡⁢⁣⁢​‌‌‍Server Initialization:-​⁡

//dependencies
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

//route imports
import authRoutes from './routes/authRoutes.js';
import lostRoutes from './routes/lostRoutes.js';
import FoundRoutes from './routes/foundRoutes.js';
import {notFound,errorHandler} from './middleware/errorMiddleware.js'


//dependencies injection
dotenv.config();
connectDB();    
const app=express();

//middlewares
// Allow credentials so browsers accept httpOnly cookies from the API
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

//routes
// ensure leading slashes so Express mounts paths correctly
app.use('/api/auth', authRoutes);
app.use('/api/lost', lostRoutes);
app.use('/api/found', FoundRoutes);

//health check
app.get('/',(req,res)=>{
    res.send(`lost and found api is running`);
})

//error handlers
app.use(notFound);
app.use(errorHandler);

const PORT=process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`);
    
}) 


