import express from 'express';
import cors from 'cors';
import {client, connectDB } from './config/db';
import dotenv from 'dotenv';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

app.use('/api/notes', require('./routes/notes'));


const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});

startServer();