const mongoose = require('mongoose');
const connectDB = async () =>{
    try {
        const connOjb = await mongoose.connect(process.env.Database_URL);
        console.log(`MongoDB connected: ${connOjb.connection.host}`);
    } catch (error) {
        console.log('Error: ' + error.message);
        process.exit(1);
    }
}
module.exports = connectDB;