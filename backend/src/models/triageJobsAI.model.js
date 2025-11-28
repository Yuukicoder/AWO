const mongoose = require('mongoose');
const triageJobsAISchema = new mongoose.Schema({
    rawInput: {type: String, required: true},
    ticketId: {type: String, required: true},

})
// chưa xong 