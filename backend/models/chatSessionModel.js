import mongoose from "mongoose";

const chatSessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    userId: { type: String, default: `guest_${Date.now()}` }, // Made optional with default
    userType: { type: String, enum: ['admin', 'customer'], required: true },
    context: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const chatSessionModel = mongoose.models.chatSession || mongoose.model("chatSession", chatSessionSchema);
export default chatSessionModel;