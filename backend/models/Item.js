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
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    }
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
itemSchema.index({ reporter: 1 });
itemSchema.index({ status: 1, type: 1 });

// Virtual for formatted date
itemSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Ensure virtual fields are serialized
itemSchema.set('toJSON', { virtuals: true });

// Method to check if item can be claimed
itemSchema.methods.canBeClaimed = function() {
  return this.type === 'found' && this.status === 'open';
};

// Method to update status
itemSchema.methods.updateStatus = function(newStatus) {
  const validTransitions = {
    'open': ['matched', 'claimed', 'closed'],
    'matched': ['claimed', 'closed', 'open'],
    'claimed': ['returned', 'closed'],
    'returned': ['closed'],
    'closed': []
  };

  if (validTransitions[this.status].includes(newStatus)) {
    this.status = newStatus;
    return true;
  }
  return false;
};

// Static method to get items by status
itemSchema.statics.getByStatus = function(status) {
  return this.find({ status }).populate('reporter', 'username email');
};

// Static method to search items
itemSchema.statics.searchItems = function(query) {
  return this.find({
    $and: [
      { isPublic: true },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { location: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  }).populate('reporter', 'username email');
};

export default mongoose.model('Item', itemSchema);