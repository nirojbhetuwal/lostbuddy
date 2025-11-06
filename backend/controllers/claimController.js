import Claimant from '../models/Claimant.js';
import Item from '../models/Item.js';
import Notification from '../models/Notification.js';
import { validationResult } from 'express-validator';

// Submit a claim
const submitClaim = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { itemId } = req.params;
    const { message, contactInfo, proof } = req.body;

    // Check if item exists and is found
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    if (item.type !== 'found') {
      return res.status(400).json({
        success: false,
        message: 'Can only claim found items'
      });
    }

    if (item.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This item is no longer available for claiming'
      });
    }

    // Check if user already claimed this item
    const existingClaim = await Claimant.findOne({
      item: itemId,
      user: req.user.id
    });

    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a claim for this item'
      });
    }

    // Check if user is trying to claim their own item
    if (item.reporter.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot claim your own item'
      });
    }

    // Create claim
    const claim = new Claimant({
      item: itemId,
      user: req.user.id,
      message,
      contactInfo: contactInfo || {
        email: req.user.email,
        phone: req.user.phone
      },
      proof: proof || []
    });

    await claim.save();
    await claim.populate('user', 'username email phone');
    await claim.populate('item', 'title type category reporter');

    // Create notification for item reporter
    const notification = new Notification({
      user: item.reporter,
      type: 'new_claim',
      title: 'New Claim Submitted',
      message: `A user has submitted a claim for your found item "${item.title}"`,
      relatedItem: itemId,
      metadata: {
        claimId: claim._id,
        claimant: req.user.username,
        itemTitle: item.title
      }
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully',
      data: { claim }
    });

  } catch (error) {
    console.error('Submit claim error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting claim'
    });
  }
};

// Get claims for user's items
const getMyItemClaims = async (req, res) => {
  try {
    // Find items belonging to the user
    const userItems = await Item.find({ reporter: req.user.id });
    const itemIds = userItems.map(item => item._id);

    const claims = await Claimant.find({ item: { $in: itemIds } })
      .populate('user', 'username email phone')
      .populate('item', 'title type category images location')
      .populate('approvedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { claims }
    });

  } catch (error) {
    console.error('Get claims error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching claims'
    });
  }
};

// Get claims submitted by user
const getMyClaims = async (req, res) => {
  try {
    const claims = await Claimant.find({ user: req.user.id })
      .populate('item', 'title type category location reporter images')
      .populate('approvedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { claims }
    });

  } catch (error) {
    console.error('Get my claims error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your claims'
    });
  }
};

// Approve a claim
const approveClaim = async (req, res) => {
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

    // Check if user owns the item or is admin
    const item = await Item.findById(claim.item._id);
    if (item.reporter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve this claim'
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
    item.status = 'claimed';
    await item.save();

    // Create notification for claimant
    const claimantNotification = new Notification({
      user: claim.user._id,
      type: 'claim_approved',
      title: 'Claim Approved!',
      message: `Your claim for "${item.title}" has been approved. Contact the finder to arrange pickup.`,
      relatedItem: item._id,
      metadata: {
        contactInfo: {
          email: item.contactInfo?.email || item.reporter.email,
          phone: item.contactInfo?.phone || item.reporter.phone
        },
        itemTitle: item.title
      }
    });

    await claimantNotification.save();

    // Reject other pending claims for the same item
    await Claimant.updateMany(
      {
        item: item._id,
        _id: { $ne: claimId },
        status: 'pending'
      },
      {
        status: 'rejected',
        rejectionReason: 'Another claim was approved for this item'
      }
    );

    res.json({
      success: true,
      message: 'Claim approved successfully',
      data: { claim }
    });

  } catch (error) {
    console.error('Approve claim error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving claim'
    });
  }
};

// Reject a claim
const rejectClaim = async (req, res) => {
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

    // Check if user owns the item or is admin
    const item = await Item.findById(claim.item._id);
    if (item.reporter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this claim'
      });
    }

    if (claim.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Claim is not in pending status'
      });
    }

    // Update claim status
    claim.status = 'rejected';
    claim.rejectionReason = rejectionReason || 'Claim rejected by item owner';
    await claim.save();

    // Create notification for claimant
    const notification = new Notification({
      user: claim.user._id,
      type: 'claim_rejected',
      title: 'Claim Rejected',
      message: `Your claim for "${item.title}" has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
      relatedItem: item._id,
      metadata: {
        rejectionReason: rejectionReason || 'Claim rejected by item owner',
        itemTitle: item.title
      }
    });

    await notification.save();

    res.json({
      success: true,
      message: 'Claim rejected successfully',
      data: { claim }
    });

  } catch (error) {
    console.error('Reject claim error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting claim'
    });
  }
};

export {
  submitClaim,
  getMyItemClaims,
  getMyClaims,
  approveClaim,
  rejectClaim
};