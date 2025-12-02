import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
    sessionId: { type: String, required: true },
    message: { type: String, required: true },
    sender: { type: String, enum: ['user', 'bot'], required: true },
    intent: { type: String },
    confidence: { type: Number },
    timestamp: { type: Date, default: Date.now }
});

const chatMessageModel = mongoose.models.chatMessage || mongoose.model("chatMessage", chatMessageSchema);
export default chatMessageModel;