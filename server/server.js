//⁡⁢⁣⁢​‌‌‍Server Initialization:-​⁡

//dependencies
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/userModel.js';
import Chat from './models/chatModel.js';
import LostItem from './models/lostItemModel.js';
import FoundItem from './models/foundItemModel.js';

//route imports
import authRoutes from './routes/authRoutes.js';
import lostRoutes from './routes/lostRoutes.js';
import FoundRoutes from './routes/foundRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import {notFound,errorHandler} from './middleware/errorMiddleware.js'


//dependencies injection
dotenv.config();
connectDB();    
const app=express();

// create HTTP server (so we can attach socket.io)
const httpServer = createServer(app);

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

// Setup Socket.IO
const io = new Server(httpServer, {
    cors: {
        // allow configured client origin and any localhost origin (dev)
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (origin === clientOrigin) return callback(null, true);
            if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
            return callback(new Error('Not allowed by CORS'));
        },
        methods: ["GET", "POST"],
        credentials: true,
    }
});

// Simple auth for sockets using token passed in handshake auth
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) return next();
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user) socket.user = user;
        next();
    } catch (err) {
        // allow unauthenticated sockets to connect but without user attached
        next();
    }
});

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on('join', ({ itemType, itemId }) => {
        if (!itemType || !itemId) return;
        const room = `chat:${itemType}:${itemId}`;
        socket.join(room);
    });

    socket.on('sendMessage', async ({ itemType, itemId, text }, ack) => {
        try {
            if (!socket.user) {
                return ack && ack({ status: 'error', message: 'Not authenticated' });
            }
            // fetch item to verify participant
            let item, owner;
            if (itemType === 'lost') {
                item = await LostItem.findById(itemId).populate('claims.claimant');
                owner = await (await LostItem.findById(itemId).populate('user', '_id name email')).user;
            } else {
                item = await FoundItem.findById(itemId).populate('claims.claimant');
                owner = await (await FoundItem.findById(itemId).populate('user', '_id name email')).user;
            }
            if (!item) return ack && ack({ status: 'error', message: 'Item not found' });

            const isOwner = owner && socket.user && owner._id.toString() === socket.user._id.toString();
            const isClaimant = item.claims && item.claims.some(c => c.claimant && c.claimant._id.toString() === socket.user._id.toString());
            if (!isOwner && !isClaimant) {
                return ack && ack({ status: 'error', message: 'Not authorized to message for this item' });
            }

            // Persist message in Chat model
            const room = `chat:${itemType}:${itemId}`;
            let chat = await Chat.findOne({ itemType, itemId });
            if (!chat) {
                const participants = [owner?._id, socket.user._id].filter(Boolean);
                chat = await Chat.create({ itemType, itemId, participants, messages: [] });
            }

            const message = { sender: socket.user._id, text, createdAt: new Date() };
            chat.messages.push(message);
            await chat.save();

            const populated = await Chat.findById(chat._id).populate('messages.sender', 'name email');
            const lastMsg = populated.messages[populated.messages.length - 1];

            io.to(room).emit('message', lastMsg);
            ack && ack({ status: 'ok', message: lastMsg });
        } catch (err) {
            console.error('socket sendMessage error', err);
            ack && ack({ status: 'error', message: 'Server error' });
        }
    });

    socket.on('disconnect', () => {
        // console.log('socket disconnected', socket.id);
    });
});

//routes
// ensure leading slashes so Express mounts paths correctly
app.use('/api/auth', authRoutes);
app.use('/api/lost', lostRoutes);
app.use('/api/found', FoundRoutes);
app.use('/api/chats', chatRoutes);

//health check
app.get('/',(req,res)=>{
    res.send(`lost and found api is running`);
})

//error handlers
app.use(notFound);
app.use(errorHandler);

const PORT=process.env.PORT || 5000;

httpServer.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`);
    
}) 


