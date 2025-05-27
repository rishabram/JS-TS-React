// config/db.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let db;

const connectDB = async () => {
    try {
        await client.connect();
        db = client.db("notesdb");
        console.log("Connected to MongoDB Atlas");
        return db;
    } catch (err) {
        console.error("MongoDB connection failed:", err);
        process.exit(1);
    }
};

const getDB = () => {
    if (!db) {
        throw new Error("Database not initialized");
    }
    return db;
};

module.exports = { connectDB, getDB, client };