// this file is for db connection

import mongoose from 'mongoose';

//define a fun to establish db connection
const connectDB = async () => {
  try {
    // Get the connection string from environment variables
    const mongoURI = process.env.MONGODB_URI;

    // Safety check: make sure the URI exists
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in your .env file');
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Stop the server if DB connection fails
  }
};

export default connectDB;
