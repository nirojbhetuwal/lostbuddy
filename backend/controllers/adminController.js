import User from '../models/User.js';
import Item from '../models/Item.js';
import Claimant from '../models/Claimant.js';
import Notification from '../models/Notification.js';

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalItems,
      totalClaims,
      recentUsers,
      recentItems,
      pendingClaims
    ] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      Claimant.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('username email createdAt'),
      Item.find().sort({ createdAt: -1 }).limit(5).populate('reporter', 'username'),
      Claimant.countDocuments({ status: 'pending' })
    ]);

    // Get items by status
    const itemsByStatus = await Item.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get items by type
    const itemsByType = await Item.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get items by category
    const itemsByCategory = await Item.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get claims by status
    const claimsByStatus = await Claimant.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await Item.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalItems,
          totalClaims,
          pendingClaims
        },
        itemsByStatus: itemsByStatus.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        itemsByType: itemsByType.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        itemsByCategory: itemsByCategory.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        claimsByStatus: claimsByStatus.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        recentActivity,
        recentUsers,
        recentItems
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
};

// Get all users with pagination and filters
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive
    } = req.query;

    // Build filter
    const filter = {};
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

// Update user role or status
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent self-modification
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify your own account'
      });
    }

    const updateData = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
};

// Get all items with admin filters
const getAdminItems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      category,
      status,
      search
    } = req.query;

    // Build filter
    const filter = {};
    
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const items = await Item.find(filter)
      .populate('reporter', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Item.countDocuments(filter);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get admin items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching items'
    });
  }
};

// Delete item (admin)
const deleteItemAdmin = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Also delete associated claims
    await Claimant.deleteMany({ item: itemId });

    await Item.findByIdAndDelete(itemId);

    res.json({
      success: true,
      message: 'Item and associated claims deleted successfully'
    });

  } catch (error) {
    console.error('Delete item admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting item'
    });
  }
};

// Get all claims for admin
const getAdminClaims = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const claims = await Claimant.find(filter)
      .populate('user', 'username email')
      .populate('item', 'title type category')
      .populate('approvedBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Claimant.countDocuments(filter);

    res.json({
      success: true,
      data: {
        claims,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get admin claims error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching claims'
    });
  }
};

// Admin approve claim
const adminApproveClaim = async (req, res) => {
  try {
    const { claimId } = req.params;

    const claim = await Claimant.findById(claimId)
      .populate('item')
      .populate('user');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    if (claim.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Claim is not in pending status'
      });
    }

    // Update claim status
    claim.status = 'approved';
    claim.approvedBy = req.user.id;
    claim.approvedAt = new Date();
    await claim.save();

    // Update item status
    const item = await Item.findById(claim.item._id);
    item.status = 'claimed';
    await item.save();

    // Create notification for claimant
    await new Notification({
      user: claim.user._id,
      type: 'claim_approved',
      title: 'Claim Approved by Admin',
      message: `Your claim for "${item.title}" has been approved by an administrator.`,
      relatedItem: item._id,
      metadata: {
        contactInfo: {
          email: item.contactInfo?.email || item.reporter.email,
          phone: item.contactInfo?.phone || item.reporter.phone
        }
      }
    }).save();

    res.json({
      success: true,
      message: 'Claim approved successfully by admin',
      data: { claim }
    });

  } catch (error) {
    console.error('Admin approve claim error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving claim'
    });
  }
};

// Admin reject claim
const adminRejectClaim = async (req, res) => {
  try {
    const { claimId } = req.params;
    const { rejectionReason } = req.body;

    const claim = await Claimant.findById(claimId).populate('item user');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    if (claim.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Claim is not in pending status'
      });
    }

    claim.status = 'rejected';
    claim.rejectionReason = rejectionReason || 'Claim rejected by administrator';
    await claim.save();

    // Create notification for claimant
    await new Notification({
      user: claim.user._id,
      type: 'claim_rejected',
      title: 'Claim Rejected by Admin',
      message: `Your claim for "${claim.item.title}" has been rejected by an administrator.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
      relatedItem: claim.item._id
    }).save();

    res.json({
      success: true,
      message: 'Claim rejected successfully by admin',
      data: { claim }
    });

  } catch (error) {
    console.error('Admin reject claim error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting claim'
    });
  }
};

export {
  getDashboardStats,
  getUsers,
  updateUser,
  getAdminItems,
  deleteItemAdmin,
  getAdminClaims,
  adminApproveClaim,
  adminRejectClaim
};