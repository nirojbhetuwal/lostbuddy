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

const createTestData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Item.deleteMany({});
    await Claimant.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create test users
    const users = [];
    const userData = [
      { username: 'alice', email: 'alice@test.com', password: 'password123', phone: '+1234567890', address: '123 Main St' },
      { username: 'bob', email: 'bob@test.com', password: 'password123', phone: '+1234567891', address: '456 Oak Ave' },
      { username: 'charlie', email: 'charlie@test.com', password: 'password123', phone: '+1234567892', address: '789 Pine Rd' },
      { username: 'admin', email: 'admin@lostbuddy.com', password: 'admin123', phone: '+1234567893', address: 'System Admin', role: 'admin' }
    ];

    for (const user of userData) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      const newUser = new User({
        username: user.username,
        email: user.email,
        password: hashedPassword,
        phone: user.phone,
        address: user.address,
        role: user.role || 'user'
      });
      
      await newUser.save();
      users.push(newUser);
      console.log(`✅ Created user: ${user.username}`);
    }

    // Create test items
    const items = [];
    for (let i = 0; i < 10; i++) {
      const type = i < 5 ? 'lost' : 'found'; // First 5 lost, next 5 found
      const reporter = users[i % users.length]; // Distribute items among users
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      const item = new Item({
        title: `${type === 'lost' ? 'Lost' : 'Found'} ${category} item ${i + 1}`,
        description: `This is a test ${type} ${category} item. ${type === 'lost' ? 'I lost this item and would really appreciate if anyone finds it.' : 'I found this item and looking for its owner.'}`,
        category,
        type,
        location: locations[Math.floor(Math.random() * locations.length)],
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
        reporter: reporter._id,
        features: {
          color: features.color[Math.floor(Math.random() * features.color.length)],
          brand: Math.random() > 0.3 ? features.brand[Math.floor(Math.random() * features.brand.length)] : undefined,
          size: Math.random() > 0.3 ? features.size[Math.floor(Math.random() * features.size.length)] : undefined
        },
        status: 'open'
      });
      
      await item.save();
      items.push(item);
      console.log(`✅ Created ${type} item: ${item.title}`);
    }

    // Create test claims (only on found items)
    const foundItems = items.filter(item => item.type === 'found');
    for (let i = 0; i < Math.min(3, foundItems.length); i++) {
      const item = foundItems[i];
      const claimant = users.find(user => user._id.toString() !== item.reporter.toString());
      
      if (claimant) {
        const claim = new Claimant({
          item: item._id,
          user: claimant._id,
          message: `I believe this is my ${item.category} that I lost around ${item.location}. It matches the description and features mentioned. I can provide more specific details to verify ownership.`,
          contactInfo: {
            email: claimant.email,
            phone: claimant.phone
          },
          status: 'pending'
        });
        
        await claim.save();
        console.log(`✅ Created claim by ${claimant.username} on ${item.title}`);
      }
    }

    // Create some approved and rejected claims for testing
    if (foundItems.length >= 2) {
      const item = foundItems[1];
      const claimant = users.find(user => user._id.toString() !== item.reporter.toString());
      
      if (claimant) {
        // Approved claim
        const approvedClaim = new Claimant({
          item: item._id,
          user: claimant._id,
          message: `This is definitely my ${item.category}! I lost it last week and have been searching everywhere. The description matches perfectly.`,
          contactInfo: {
            email: claimant.email,
            phone: claimant.phone
          },
          status: 'approved',
          approvedBy: users[3]._id, // admin user
          approvedAt: new Date()
        });
        
        await approvedClaim.save();
        
        // Update item status to claimed
        item.status = 'claimed';
        await item.save();
        
        console.log(`✅ Created approved claim by ${claimant.username}`);
      }
    }

    if (foundItems.length >= 3) {
      const item = foundItems[2];
      const claimant = users.find(user => user._id.toString() !== item.reporter.toString() && user._id.toString() !== users[1]._id);
      
      if (claimant) {
        // Rejected claim
        const rejectedClaim = new Claimant({
          item: item._id,
          user: claimant._id,
          message: `I think this might be my ${item.category}. I lost something similar in that area.`,
          contactInfo: {
            email: claimant.email,
            phone: claimant.phone
          },
          status: 'rejected',
          rejectionReason: 'Insufficient proof of ownership provided.'
        });
        
        await rejectedClaim.save();
        console.log(`✅ Created rejected claim by ${claimant.username}`);
      }
    }

    console.log('\n🎉 Test data created successfully!');
    console.log('\n👤 Test User Credentials:');
    console.log('   Alice (Regular User): alice@test.com / password123');
    console.log('   Bob (Regular User): bob@test.com / password123');
    console.log('   Charlie (Regular User): charlie@test.com / password123');
    console.log('   Admin: admin@lostbuddy.com / admin123');
    console.log('\n📦 Created:');
    console.log(`   - ${users.length} users`);
    console.log(`   - ${items.length} items (${items.filter(i => i.type === 'lost').length} lost, ${items.filter(i => i.type === 'found').length} found)`);
    console.log(`   - ${await Claimant.countDocuments()} claims`);
    console.log('\n🔍 Test Scenarios Available:');
    console.log('   - Browse items with search/filters');
    console.log('   - Submit new claims on found items');
    console.log('   - Approve/reject pending claims');
    console.log('   - View approved/rejected claims');
    console.log('   - Admin dashboard with statistics');
    
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

createTestData();