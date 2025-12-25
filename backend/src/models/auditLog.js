import mongoose from "mongoose"
const auditLogSchema = new mongoose.Schema(
   {
       action : {type: String, required: true},
       by : {type: mongoose.Schema.Types.Mixed, required: true}, 
       from: {type: mongoose.Schema.Types.Mixed, required: true},
       to: {type: mongoose.Schema.Types.Mixed, required: true},
       meta: {type: mongoose.Schema.Types.Mixed, required: true}, // phần giải thích chi tiết của auditLog
       at : {type: Date, required: true}

   }, 
   { _id: false},

) 
export default auditLogSchema;