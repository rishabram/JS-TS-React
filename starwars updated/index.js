const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json())

let data = [

];

app.get('/api/starwars', (req, res) => {
    res.json(data);
});

app.post('/api/starwars', (req,res)=>{
    const character = req.body.name;
    const newChar={
        id: data.length+1,
        name: character.name
    }
    data.push(newChar)
    res.json(newChar)
})


app.delete('/api/starwars/:id', (req,res) => {
    const id = parseInt(req.params.id);
    const lengthBeforeDelete = data.length;

    data = data.filter(item => item.id !== id);

    if (data.length < lengthBeforeDelete) {
        res.json(data);
    } else {
        res.status(404).json({ success: false, message: `Char with id ${id} not found` });
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
