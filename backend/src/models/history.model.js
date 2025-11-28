const mongoose = require('mongoose')
const historySchema = new mongoose.Schema({
    ticketId: {type: String, required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
    assignedAt: {type: Date, required: true},
    confidenceScore: {type: Number, required: true},
    reason: {type: String, required: true}
})
const History = mongoose.model('History', historySchema)
module.exports = History