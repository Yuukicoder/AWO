const User = require('./users.model');
const Workflow = required('./workflows.model');
const db = {};

db.User = User;
db.Workflow = Workflow;

module.exports = db;