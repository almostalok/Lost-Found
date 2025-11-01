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
// Allow CORS from the client. In development we default to Vite's port 5174.
const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5174';
app.use(cors({
    origin: (origin, cb) => {
        // allow requests with no origin like mobile apps or curl
        if (!origin) return cb(null, true);
        // allow the configured client origin
        if (origin === clientOrigin) return cb(null, true);
        // allow localhost dev origins (ports 3000/5173/5174)
        if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);
        return cb(new Error('Not allowed by CORS'), false);
    },
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


