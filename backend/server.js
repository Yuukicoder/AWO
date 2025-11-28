const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const app = express();
require('dotenv').config();
app.use(cors())
app.get('/', (req, res)=>{
    res.json({message: "AWO Hi there!"});
})
const PORT = process.env.PORT || 3002;
server = app.listen(PORT, ()=>{
    console.log(`Server running on port ${3000}`);
    connectDB();
})