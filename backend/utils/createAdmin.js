import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import 'dotenv/config';

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@lostbuddy.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('Email: admin@lostbuddy.com');
      console.log('You can reset the password if needed.');
      process.exit(0);
    }

    // Create admin user
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = new User({
      username: 'admin',
      email: 'admin@lostbuddy.com',
      password: hashedPassword,
      phone: '+1234567890',
      address: 'System Administration',
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@lostbuddy.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

createAdmin();