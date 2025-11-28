const mongoose = require('mongoose');
const nodeSchema = new mongoose.Schema(
    {
        nodeId: {type:String, required: true},
        type: {type: String, required: true},
        config: {type: Object, required: true},
    }
)
const connectionSchema = new mongoose.Schema({
    from: {type: String, required: true},
    to: {type: String, required: true}
})
const workflowSchema = new mongoose.Schema({
    name: {type: String, required: true},
    timeId: {type: Number},
    nodes: {type: [nodeSchema], default: []},
    connections: {type: [connectionSchema], default: []},
    enabled:{type: Boolean, default: false},
    version: {type: Number, default: 1},

},
{timestamps: true}
)

const Workflow = mongoose.model('Workflow', workflowSchema)
module.exports = Workflow;