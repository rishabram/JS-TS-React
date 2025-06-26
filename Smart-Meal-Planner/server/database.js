const { MongoClient } = require('mongodb');
require('dotenv').config({ path: __dirname + '/.env' });
let db = null;
let client = null;

const url = process.env.MONGODB_URI;
if (!url) {
    throw new Error('MONGODB_URI is not set in environment variables');
}
const dbName = process.env.DB_NAME || 'MealPlanDB';
async function connectToDatabase() {
    if (db) {
        return db;
    }

    try {
        client = new MongoClient(url);

        await client.connect();
        console.log('Connected to MongoDB successfully');

        db = client.db(dbName);

        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}
async function getCollection(collectionName) {
    const database = await connectToDatabase();
    return database.collection(collectionName);
}

async function closeConnection() {
    if (client) {
        await client.close();
        db = null;
        client = null;
        console.log('MongoDB connection closed');
    }
}
module.exports = {
    connectToDatabase,
    getCollection,
    closeConnection
};