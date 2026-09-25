import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;

/**
 * Safely masks credentials from MongoDB connection strings
 */
const maskMongoUri = (uri) => {
  if (!uri) return '';
  return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^:@]+):([^@]+)@/gi, '$1***:***@');
};

export const connectDB = async () => {
  if (isConnected) {
    return true;
  }

  // Allow adequate timeout for MongoDB Atlas / production connections
  const timeoutMs = config.nodeEnv === 'production' ? 10000 : 5000;

  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: timeoutMs,
    });
    isConnected = true;
    console.log(`[Database] MongoDB connected successfully to: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    const sanitizedMsg = maskMongoUri(error.message || 'Connection failed');
    console.warn(`[Database Warning] MongoDB connection failed: ${sanitizedMsg}`);
    console.warn(`[Database Warning] Target host: ${maskMongoUri(config.mongodbUri)}`);
    console.warn('[Database Warning] Operating in resilient fallback mode. API server remains running.');
    return false;
  }
};

export const getDbStatus = () => {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const state = mongoose.connection.readyState;
  return {
    state: stateMap[state] || 'unknown',
    connected: state === 1,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
};
