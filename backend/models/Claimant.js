import mongoose from 'mongoose';

const claimantSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Please provide a message explaining your claim'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  contactInfo: {
    email: String,
    phone: String
  },
  proof: [{
    description: String,
    imageUrl: String,
    publicId: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String
}, {
  timestamps: true
});

// Index for better query performance
claimantSchema.index({ item: 1, user: 1 });
claimantSchema.index({ status: 1 });
claimantSchema.index({ createdAt: -1 });

// Prevent duplicate claims
claimantSchema.index({ item: 1, user: 1 }, { unique: true });

// Virtual for formatted dates
claimantSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString();
});

claimantSchema.virtual('formattedApprovedAt').get(function() {
  return this.approvedAt ? this.approvedAt.toLocaleDateString() : null;
});

// Ensure virtual fields are serialized
claimantSchema.set('toJSON', { virtuals: true });
claimantSchema.set('toObject', { virtuals: true });

// Static method to get claims by status
claimantSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('user item');
};

// Static method to get claims for a specific item
claimantSchema.statics.findByItem = function(itemId) {
  return this.find({ item: itemId }).populate('user item');
};

// Instance method to check if claim can be approved
claimantSchema.methods.canBeApproved = function() {
  return this.status === 'pending';
};

// Instance method to check if claim can be rejected
claimantSchema.methods.canBeRejected = function() {
  return this.status === 'pending';
};

// Instance method to check if claim can be cancelled
claimantSchema.methods.canBeCancelled = function() {
  return this.status === 'pending';
};

// Pre-save middleware to validate claim
claimantSchema.pre('save', function(next) {
  if (this.status === 'approved' && !this.approvedAt) {
    this.approvedAt = new Date();
  }
  next();
});

export default mongoose.model('Claimant', claimantSchema);