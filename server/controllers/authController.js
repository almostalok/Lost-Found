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