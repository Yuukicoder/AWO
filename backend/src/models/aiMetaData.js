import mongoose from "mongoose"
const aiMetaDataSchema = mongoose.Schema(
    {
        labels: {type: [String], default: null},
        estimatedEffort: {type: Number, default: null},
        model: {type: String, default: null},
        promptVersion: {type: String, default: null},
        confidence: {type: Number, min: 0, max: 1, default: null},
    },
    {_id: false}
)
export default aiMetaDataSchema;