import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        // Aadhar verification fields
        aadharNumber: { type: String },
        aadharDocument: { type: String }, // URL to uploaded Aadhar image/pdf
        aadharStatus: { type: String, enum: ['unverified', 'pending', 'verified', 'rejected'], default: 'unverified' },
        aadharRequestedAt: { type: Date },
        aadharVerifiedAt: { type: Date },
        aadharRejectedReason: { type: String },
        isAdmin: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Hash password before saving to DB. Use a regular function so `this` is bound to the document.
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;