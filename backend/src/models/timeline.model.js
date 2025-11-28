const mongoose = require('mongoose');
const timelineSchema = new mongoose.Schema({
    ticketId:{type:mongoose.Schema.Types.ObjectId, ref: 'Ticket'},
    actorId:{type:mongoose.Schema.Types.ObjectId, ref: 'User'},
    action: {type: String, enum : ['created', 'status_updated', 'assigned', 'comment_added', 'updated', 'deleted'],  required: true},
    meta: {type:Object, default:{}},

}, 
{timestamps: true}
)
const Timeline = mongoose.model('Timeline', timelineSchema)
module.exports = Timeline;