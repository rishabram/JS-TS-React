const express = require('express');
const cors = require ('cors');
const app = express();
const PORT = 5000;
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());

let data = [];

app.get('/toDo',(req,res)=>{
    res.json(data)
})
app.listen(PORT,()=>{
    console.log(`Listened to:${PORT}`)
})
app.post('/toDo',(req,res)=>{
    const newToDo ={
        id:data.length+1,
        text:req.body.text
    }
    data.push(newToDo)
    res.status(201).json(newToDo);
})
