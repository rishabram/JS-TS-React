const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: __dirname + '/.env' });
// Import our database module
const { connectToDatabase, closeConnection } = require('./database');
// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
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
// Start server
async function startServer() {
    try {
        // Connect to database first
        await connectToDatabase();

        // Then start listening for requests
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Test it at: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down');
    await closeConnection();
    process.exit(0);
});

startServer();