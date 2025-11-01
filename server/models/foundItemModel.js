import mongoose from "mongoose";

const foundItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    category: String,
    image: String,
    location: String,
    dateFound: { type: Date, default: Date.now },
    status: { type: String, default: "pending" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("FoundItem", foundItemSchema);