import Item from '../models/Item.js';
import { calculateMatchScore } from '../utils/algorithms/textSimilarity.js';
import Notification from '../models/Notification.js';

// Find potential matches for an item
const findPotentialMatches = async (itemId, threshold = 0.6) => {
  try {
    const item = await Item.findById(itemId)
      .populate('reporter', 'username email');
    
    if (!item) {
      throw new Error('Item not found');
    }

    // Determine what to search for based on item type
    const searchType = item.type === 'lost' ? 'found' : 'lost';
    const searchStatus = 'open';

    // Find potential matching items
    const potentialMatches = await Item.find({
      type: searchType,
      status: searchStatus,
      category: item.category, // Same category for better matches
      _id: { $ne: itemId } // Exclude self
    }).populate('reporter', 'username email');

    // Calculate match scores
    const matchesWithScores = potentialMatches.map(matchItem => {
      const matchResult = calculateMatchScore(
        item.type === 'lost' ? item : matchItem,
        item.type === 'lost' ? matchItem : item
      );
      
      return {
        item: matchItem,
        score: matchResult.totalScore,
        breakdown: matchResult.breakdown,
        matchDetails: matchResult
      };
    });

    // Filter by threshold and sort by score
    const filteredMatches = matchesWithScores
      .filter(match => match.score >= threshold)
      .sort((a, b) => b.score - a.score);

    return filteredMatches;

  } catch (error) {
    console.error('Error finding potential matches:', error);
    throw error;
  }
};

// Auto-match items and create notifications
const autoMatchItems = async (newItemId) => {
  try {
    const matches = await findPotentialMatches(newItemId, 0.7); // Higher threshold for auto-matching
    
    if (matches.length > 0) {
      const newItem = await Item.findById(newItemId);
      
      // Create notifications for both reporters
      const notifications = [];
      
      for (const match of matches.slice(0, 3)) { // Limit to top 3 matches
        // Notification for new item reporter
        notifications.push(
          new Notification({
            user: newItem.reporter,
            type: 'match_found',
            title: 'Potential Match Found!',
            message: `We found a potential match for your ${newItem.type} item "${newItem.title}"`,
            relatedItem: newItemId,
            metadata: {
              matchedItem: match.item._id,
              matchScore: match.score,
              matchBreakdown: match.breakdown
            }
          }).save()
        );

        // Notification for matched item reporter
        notifications.push(
          new Notification({
            user: match.item.reporter,
            type: 'match_found',
            title: 'Potential Match Found!',
            message: `We found a potential match for your ${match.item.type} item "${match.item.title}"`,
            relatedItem: match.item._id,
            metadata: {
              matchedItem: newItemId,
              matchScore: match.score,
              matchBreakdown: match.breakdown
            }
          }).save()
        );

        // Update match score on items
        await Item.findByIdAndUpdate(newItemId, {
          $set: {
            matchScore: Math.max(newItem.matchScore || 0, match.score)
          }
        });

        await Item.findByIdAndUpdate(match.item._id, {
          $set: {
            matchScore: Math.max(match.item.matchScore || 0, match.score)
          }
        });
      }

      await Promise.all(notifications);
      
      return {
        success: true,
        matchesFound: matches.length,
        topMatch: matches[0]
      };
    }

    return { success: true, matchesFound: 0 };

  } catch (error) {
    console.error('Error in auto-matching:', error);
    throw error;
  }
};

// Manual match confirmation
const confirmMatch = async (lostItemId, foundItemId, confirmedBy) => {
  try {
    const [lostItem, foundItem] = await Promise.all([
      Item.findById(lostItemId),
      Item.findById(foundItemId)
    ]);

    if (!lostItem || !foundItem) {
      throw new Error('One or both items not found');
    }

    if (lostItem.type !== 'lost' || foundItem.type !== 'found') {
      throw new Error('Items must be one lost and one found');
    }

    // Update items status
    lostItem.status = 'matched';
    lostItem.matchedWith = foundItemId;
    
    foundItem.status = 'matched';
    foundItem.matchedWith = lostItemId;

    await Promise.all([lostItem.save(), foundItem.save()]);

    // Create notifications
    const notifications = [
      new Notification({
        user: lostItem.reporter,
        type: 'match_confirmed',
        title: 'Match Confirmed!',
        message: `Your lost item "${lostItem.title}" has been matched with a found item. Contact the finder to arrange return.`,
        relatedItem: lostItemId,
        metadata: {
          matchedItem: foundItemId,
          contactInfo: foundItem.contactInfo
        }
      }).save(),
      
      new Notification({
        user: foundItem.reporter,
        type: 'match_confirmed',
        title: 'Match Confirmed!',
        message: `Your found item "${foundItem.title}" has been matched with a lost item. Contact the owner to arrange return.`,
        relatedItem: foundItemId,
        metadata: {
          matchedItem: lostItemId,
          contactInfo: lostItem.contactInfo
        }
      }).save()
    ];

    await Promise.all(notifications);

    return {
      success: true,
      message: 'Match confirmed successfully',
      lostItem,
      foundItem
    };

  } catch (error) {
    console.error('Error confirming match:', error);
    throw error;
  }
};

// Get match suggestions for dashboard
const getMatchSuggestions = async (userId, limit = 5) => {
  try {
    // Get user's open items
    const userItems = await Item.find({ 
      reporter: userId, 
      status: 'open' 
    });

    const suggestions = [];

    for (const userItem of userItems) {
      const matches = await findPotentialMatches(userItem._id, 0.5); // Lower threshold for suggestions
      
      if (matches.length > 0) {
        suggestions.push({
          userItem,
          matches: matches.slice(0, 2) // Top 2 matches per item
        });
      }
    }

    // Flatten and sort by match score
    const flattenedSuggestions = suggestions
      .flatMap(s => s.matches.map(m => ({ ...m, userItem: s.userItem })))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return flattenedSuggestions;

  } catch (error) {
    console.error('Error getting match suggestions:', error);
    throw error;
  }
};

// Calculate match statistics
const getMatchStatistics = async (userId) => {
  try {
    const userItems = await Item.find({ reporter: userId });
    
    const stats = {
      totalItems: userItems.length,
      itemsWithMatches: 0,
      totalMatchesFound: 0,
      averageMatchScore: 0,
      bestMatchScore: 0
    };

    let totalScore = 0;
    let matchCount = 0;

    for (const item of userItems) {
      if (item.matchScore > 0) {
        stats.itemsWithMatches++;
        totalScore += item.matchScore;
        matchCount++;
        
        if (item.matchScore > stats.bestMatchScore) {
          stats.bestMatchScore = item.matchScore;
        }
      }
    }

    if (matchCount > 0) {
      stats.averageMatchScore = totalScore / matchCount;
    }

    // Get recent matches (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentMatches = await Item.find({
      reporter: userId,
      status: 'matched',
      updatedAt: { $gte: thirtyDaysAgo }
    }).countDocuments();

    stats.recentMatches = recentMatches;

    return stats;

  } catch (error) {
    console.error('Error getting match statistics:', error);
    throw error;
  }
};

export {
  findPotentialMatches,
  autoMatchItems,
  confirmMatch,
  getMatchSuggestions,
  getMatchStatistics
};