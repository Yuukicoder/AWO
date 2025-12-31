const mongoose = require('mongoose');


const TriagleResultSchema = new mongoose.Schema({    
    // content
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    summary:{
        type: String,
        required: true,
    },

    // phân loại
    category: {
        type: String,
        required: true,
    },
    labels: {
        type: [String],
        required: true,
    },
    priority: {
        type: "low"|"medium"|"high"|"urgent",
        required: true,
    },
    // ước lượng
    estimatedEffort: {
        type: Number,
        required: true,
    },
    complexity: {
        type: "simple"|"moderate"|"complex",
        required: true,
    },

    // gợi ý assign
    suggestedAssigneesId: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: [],
    },
    assignmentReason:{
        type: String,
    },

    // độ tin cậy
    confidenceScore: {
        type: Number,
        required: true,
    },
    riskFlags: {
        type: [String],
        default: [],
    }
}
, { timestamps: true });

module.exports = mongoose.model('TriagleResult', TriagleResultSchema);