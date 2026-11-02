import mongoose from "mongoose";

export async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
  await mongoose.connect(process.env.MONGO_URI);
  return mongoose.connection;
}

export default connectDB;
