const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 3000;
const app = express();
//Todo: middleware code;

//Todo: root apis code;
app.get('/',(req,res)=>{
    res.send('root api here')
})
//Todo: listiner code;
app.listen(port,()=>{
    console.log(`This server ruining in port:${port}`);
})