import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const generateToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:"30d"});

}


export const registerUser=async (req,res) => {
 
    
    const{name,email,password}=req.body;
    // check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User Already Exists!");
    }

    // create new user
    const createdUser = await User.create({ name, email, password });
    if (createdUser) {
        // set httpOnly cookie for the token
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        };

        res.cookie('token', generateToken(createdUser._id), cookieOptions);

        res.status(201).json({
            _id: createdUser._id,
            name: createdUser.name,
            email: createdUser.email,
            token: generateToken(createdUser._id),
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
}

export const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        };

        res.cookie('token', generateToken(user._id), cookieOptions);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
};

export const logoutUser = async (req, res) => {
    // Clear the token cookie by setting it to an empty value and expiring it
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 0,
    };

    res.cookie('token', '', cookieOptions);
    res.json({ message: 'Logged out' });
};

export const getCurrentUser = async (req, res) => {
    // protect middleware should have already attached req.user
    if (req.user) {
        res.json(req.user);
    } else {
        res.status(401);
        throw new Error('Not authenticated');
    }
};

// Request Aadhar verification: accepts aadharNumber and an uploaded file (req.file.path)
// For now we auto-verify when a number and/or document is provided (no external verification)
export const requestAadharVerification = async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        res.status(401);
        throw new Error('Not authenticated');
    }

    const { aadharNumber } = req.body;
    const aadharDocument = req.file ? req.file.path : null;

    if (!aadharNumber && !aadharDocument) {
        res.status(400);
        throw new Error('Provide aadharNumber or upload an aadhar document');
    }

    const update = {
        aadharNumber: aadharNumber || undefined,
        aadharDocument: aadharDocument || undefined,
        // Auto-verify immediately when user provides both or either
        aadharStatus: 'verified',
        aadharRequestedAt: new Date(),
        aadharVerifiedAt: new Date(),
        aadharRejectedReason: undefined,
    };

    const updatedUser = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password');

    res.status(200).json({ message: 'Aadhar verified', user: updatedUser });
};

// Admin: list users with pending aadhar requests
export const listPendingAadharRequests = async (req, res) => {
    const users = await User.find({ aadharStatus: 'pending' }).select('-password');
    res.json(users);
};

// Admin: verify or reject a user's aadhar
export const updateAadharStatus = async (req, res) => {
    const { id } = req.params;
    const { status, reason } = req.body; // status = 'verified' | 'rejected'

    if (!['verified', 'rejected'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status. Use verified or rejected');
    }

    const user = await User.findById(id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.aadharStatus = status;
    user.aadharRejectedReason = status === 'rejected' ? (reason || 'Rejected by admin') : undefined;
    user.aadharVerifiedAt = status === 'verified' ? new Date() : undefined;

    await user.save();

    res.json({ message: `Aadhar ${status}`, user: user.toObject() });
};