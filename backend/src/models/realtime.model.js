const mongoose = require('mongoose');
const realtimeEventSchema = new mongoose.Schema({
    type: {type: String},
    payload: {type: Object}
});
// chưa xong