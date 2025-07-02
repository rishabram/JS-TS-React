const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: __dirname + '/.env' });
const { connectToDatabase, closeConnection } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
const recipeRoutes = require('./recipeRoutes');
app.use('/api/recipes', recipeRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Smart Meal Planner API is running!' });
});

app.get('/api', async (req, res) => {
    try {
        const db = await connectToDatabase();
        await db.admin().ping();
        res.json({ status: 'healthy', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

async function startServer() {
    try {
        await connectToDatabase();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Test it at: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

process.on('SIGINT', async () => {
    console.log('\nShutting down');
    await closeConnection();
    process.exit(0);
});

startServer();