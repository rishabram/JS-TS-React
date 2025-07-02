const { MongoClient } = require('mongodb');
require('dotenv').config({ path: __dirname + '/.env' });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

const client = new MongoClient(MONGODB_URI);
let db = null;

async function connectToDatabase() {
    try {
        await client.connect();
        db = client.db(DB_NAME);
        console.log('Connected successfully to MongoDB Atlas');
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

function getDB() {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
}

async function closeConnection() {
    if (client) {
        await client.close();
        console.log('MongoDB connection closed');
    }
}

module.exports = {
    client,
    connectToDatabase,
    getDB,
    closeConnection
};