import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Item from '../models/Item.js';
import Claimant from '../models/Claimant.js';
import 'dotenv/config';

const categories = ['electronics', 'documents', 'clothing', 'accessories', 'bags', 'books', 'keys', 'jewelry', 'other'];
const locations = ['Central Park', 'Shopping Mall', 'University Campus', 'Bus Station', 'Coffee Shop', 'Library', 'Sports Complex'];
const features = {
  color: ['black', 'white', 'red', 'blue', 'green', 'silver', 'gold'],
  brand: ['Apple', 'Samsung', 'Nike', 'Sony', 'Dell', 'Lenovo'],
  size: ['small', 'medium', 'large']
};

const generateDemoData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create demo user
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('demo123', salt);

    let demoUser = await User.findOne({ email: 'demo@lostbuddy.com' });
    
    if (!demoUser) {
      demoUser = new User({
        username: 'demo',
        email: 'demo@lostbuddy.com',
        password: hashedPassword,
        phone: '+1234567890',
        address: '123 Demo Street, Demo City'
      });
      await demoUser.save();
      console.log('✅ Demo user created');
    }

    // Delete existing demo items
    await Item.deleteMany({ reporter: demoUser._id });
    console.log('🧹 Cleared existing demo items');

    // Create demo items
    const demoItems = [];
    
    for (let i = 0; i < 8; i++) {
      const type = i % 2 === 0 ? 'lost' : 'found';
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      const item = new Item({
        title: `${type === 'lost' ? 'Lost' : 'Found'} ${category} item ${i + 1}`,
        description: `This is a demo ${type} ${category} item. ${type === 'lost' ? 'I lost this item and would really appreciate if anyone finds it.' : 'I found this item and looking for its owner.'}`,
        category,
        type,
        location: locations[Math.floor(Math.random() * locations.length)],
        date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date in last 7 days
        reporter: demoUser._id,
        features: {
          color: features.color[Math.floor(Math.random() * features.color.length)],
          brand: Math.random() > 0.5 ? features.brand[Math.floor(Math.random() * features.brand.length)] : undefined,
          size: Math.random() > 0.5 ? features.size[Math.floor(Math.random() * features.size.length)] : undefined
        },
        status: Math.random() > 0.7 ? 'matched' : 'open'
      });
      
      demoItems.push(item);
    }

    await Item.insertMany(demoItems);
    console.log(`✅ Created ${demoItems.length} demo items`);
    console.log('👤 Demo user credentials:');
    console.log('   Email: demo@lostbuddy.com');
    console.log('   Password: demo123');
    
  } catch (error) {
    console.error('Error creating demo data:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

generateDemoData();