import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@notesdb.o15tguf.mongodb.net/?retryWrites=true&w=majority&appName=notesdb';
export const client = new MongoClient(MONGODB_URI);
let db: any;

export const connectDB = async () => {
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

export const getDB = () => {
    if (!db) {
        throw new Error("Database not initialized");
    }
    return db;
};

