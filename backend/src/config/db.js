import mongoose from 'mongoose';
import Admin from '../models/Admin.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Auto-seed admin user on startup if config is provided
    if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
      const adminExists = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
      if (!adminExists) {
        console.log(`Admin user '${process.env.ADMIN_USERNAME}' not found. Seeding admin user...`);
        const admin = new Admin({
          username: process.env.ADMIN_USERNAME,
          password: process.env.ADMIN_PASSWORD
        });
        await admin.save();
        console.log('Admin user successfully seeded!');
      } else {
        console.log('Admin user already exists in database.');
      }
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
