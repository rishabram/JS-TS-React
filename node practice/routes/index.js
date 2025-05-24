import userRoutes from './routes/users.js'
import express from 'express'
import cors from 'cors'
const app = express();
const port = 5000;
import bodyParser from 'body-parser'


app.use(cors());
app.use(bodyParser.json())

app.get('/',(req,res)=>{
    console.log('Visited base URL');
    res.send("Hello World")
})
app.use('/users', userRoutes);

app.listen(port, ()=>{console.log(`Listening to port: ${port}`)})