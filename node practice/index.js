/*var http = require('http');

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('Hello World!');
}).listen(8080)
*/

const express = require('express');
const app = express();
const port = 8000
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('<h1>Welcome!</h1>');
});

app.get('/api/hi', (req, res) => {
    res.json({message:'Hello from server'});
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});;