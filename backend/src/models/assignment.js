import mongoose from "mongoose"
const assignmentSchema = new mongoose.Schema(
    {
        method: {
            type: String, 
            enum: [Manual, AI_Suggested, Auto_Assigned],
            default: Manual,
        },
        suggestedByAI:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        confidence: {
            type: Number,
            min: 0,
            max: 1,
            default: null,
        }, 
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        }
    },
    {_id: false}
)
export default assignmentSchema;