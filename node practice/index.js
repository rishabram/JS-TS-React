const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json())

const data = [
    { id: 1, name: 'Item 1' },
{ id: 2, name: 'Item 2' },
];

app.get('/api/items', (req, res) => {
    res.json(data);
});

app.post('/api/items', (req,res)=>{
    newItem={
        id: data.length+1,
        name: req.body.name
    }
    data.push(newItem)
    res.json(newItem)
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
     
