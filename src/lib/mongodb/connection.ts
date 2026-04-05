// lib/mongodb/connection.ts
import { Db, GridFSBucket, MongoClient } from "mongodb";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI =  "mongodb://127.0.0.1:27017/etala";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

const connectMongoDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return; // Already connected
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit process with failure
  }
};

export default connectMongoDB;

// we here are creating a new mongo client too support gridfs
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let cachedBucket: GridFSBucket;

export async function getDBConnection() {
  if (cachedClient && cachedDb && cachedBucket) {
    return { client: cachedClient, db: cachedDb, gridfsBucket: cachedBucket };
  }

  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 20, // Increase from 10
    serverSelectionTimeoutMS: 30000, // Increase from 10,000
    socketTimeoutMS: 45000, // Add this parameter
    connectTimeoutMS: 30000, // Add this parameter
    waitQueueTimeoutMS: 30000, // Add this parameter
  });

  try {
    return await client.connect().then(async (value) => {
      const db = client.db();
      const bucket = new GridFSBucket(db, {
        bucketName: "images",
        timeoutMS: 30000,
      });

      // Test the connection
      await db.command({ ping: 1 });

      cachedClient = value;
      cachedDb = db;
      cachedBucket = bucket;

      console.log("Successfully connected to MongoDB");
      return { client, db, gridfsBucket: bucket };
    });
  } catch (error) {
    await client.close();
    throw new Error(`Failed to connect to MongoDB: ${error}`);
  }
}

export const dbConnection = getDBConnection();
