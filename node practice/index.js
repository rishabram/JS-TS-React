const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json())

let data = [
    { id: 1, name: 'Item 1' },
{ id: 2, name: 'Item 2' },
];

app.get('/api/items', (req, res) => {
    res.json(data);
});

app.post('/api/items', (req,res)=>{
    const newItem={
        id: data.length+1,
        name: req.body.name
    }
    data.push(newItem)
    res.json(newItem)
})

app.delete('/api/items', (req,res) => {
    const id = parseInt(req.body.id);
    const lengthBeforeDelete = data.length;

    data = data.filter(item => item.id !== id);

    if (data.length < lengthBeforeDelete) {
        res.json(data);
    } else {
        res.status(404).json({ success: false, message: `Item with id ${id} not found` });
    }
});

    app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
     
