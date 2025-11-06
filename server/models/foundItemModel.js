import mongoose from "mongoose";

const claimSchema = new mongoose.Schema({
    claimant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "denied"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
});

const foundItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    category: String,
    image: String,
    location: String,
    dateFound: { type: Date, default: Date.now },
    status: { type: String, default: "pending" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    claims: [claimSchema],
}, { timestamps: true });

export default mongoose.model("FoundItem", foundItemSchema);