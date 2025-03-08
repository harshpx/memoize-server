import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`); 
    } catch {
        console.log("Error connecting to MongoDB");
        process.exit(1);
    }
}

export default connectDB;