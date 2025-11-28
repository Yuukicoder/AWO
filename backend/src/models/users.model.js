const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    role: {type: String, enum:['admin', 'member', 'manager'], default: 'member'},
    skills: [
        {
            name: {type: String },
            level: {type: Number}
        }
    ],
    capacityHoursPerWeek: {type: Number, default: 40},
    currentEstimatedHours: {type: Number},
    isDeleted: {type: Boolean, default: false},
},
 {timestamps: true}
)
const User = mongoose.model('User', userSchema);
module.exports = User;