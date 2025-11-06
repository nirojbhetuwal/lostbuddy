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

export default mongoose.model('Claimant', claimantSchema);