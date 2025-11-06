import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'match_found',
      'match_confirmed',
      'new_claim',
      'claim_approved',
      'claim_rejected',
      'item_status_update',
      'system',
      'welcome'
    ]
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  relatedItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, {
  timestamps: true
});

// Index for better query performance
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(notificationData) {
  try {
    const notification = new this(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to mark all as read for a user
notificationSchema.statics.markAllAsRead = async function(userId) {
  try {
    const result = await this.updateMany(
      { user: userId, isRead: false },
      { 
        isRead: true,
        readAt: new Date()
      }
    );
    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = async function(userId) {
  try {
    const count = await this.countDocuments({
      user: userId,
      isRead: false
    });
    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

// Static method to get recent notifications for a user
notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  try {
    const {
      page = 1,
      limit = 20,
      unreadOnly = false
    } = options;

    const filter = { user: userId };
    if (unreadOnly) {
      filter.isRead = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await this.find(filter)
      .populate('relatedItem', 'title type images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await this.countDocuments(filter);

    return {
      notifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    };
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

// Pre-save middleware to trim message if too long
notificationSchema.pre('save', function(next) {
  if (this.message && this.message.length > 500) {
    this.message = this.message.substring(0, 497) + '...';
  }
  next();
});

// Virtual for formatted created date
notificationSchema.virtual('formattedDate').get(function() {
  const now = new Date();
  const diffInMs = now - this.createdAt;
  const diffInHours = diffInMs / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    return this.createdAt.toLocaleDateString();
  }
});

// Ensure virtual fields are serialized
notificationSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Notification', notificationSchema);