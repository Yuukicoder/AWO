const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors())
app.get('/', (req, res)=>{
    res.json({message: "AWO Hi there!"});
})
app.listen(3000, ()=>{console.log("server chay o localhost 3000");})