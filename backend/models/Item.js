import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'electronics', 'documents', 'clothing', 'accessories', 
      'bags', 'books', 'keys', 'jewelry', 'pets', 'other'
    ]
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['lost', 'found'],
    lowercase: true
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  images: [{
    url: String,
    publicId: String
  }],
  status: {
    type: String,
    enum: ['open', 'matched', 'claimed', 'returned', 'closed'],
    default: 'open'
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactInfo: {
    email: String,
    phone: String
  },
  features: {
    color: String,
    brand: String,
    model: String,
    size: String
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  matchScore: {
    type: Number,
    default: 0
  },
  matchedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }
}, {
  timestamps: true
});

// Indexes for better performance
itemSchema.index({ type: 1, status: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ location: 'text', title: 'text', description: 'text' });
itemSchema.index({ createdAt: -1 });

export default mongoose.model('Item', itemSchema);