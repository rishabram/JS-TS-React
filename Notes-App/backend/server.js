// server.js
const express = require('express');
const cors = require('cors');
const { connectDB, client } = require('./config/db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/notes', require('./routes/notes'));

const PORT = process.env.PORT || 5000;

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