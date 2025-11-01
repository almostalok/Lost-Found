// ​‌‌‍⁡⁣⁢⁡⁢⁣⁣​‌‍‌⁡⁢⁣⁢Data Base Connection​:-⁡


//imports for db connection
import mongoose from 'mongoose';
import dotenv from 'dotenv';

//dotenv injection
dotenv.config();

//connectDB function
const connectDB=async()=>{

    try{
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in environment');
        }

    // Await the connection promise so we get a proper connection object
    // Newer MongoDB drivers no longer require useNewUrlParser/useUnifiedTopology options
    await mongoose.connect(uri);

        // mongoose.connection is available after connect resolves
        console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
       } 
  
    catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); 
    
    // stop process if DB fails
    }
};

export default connectDB;
    

