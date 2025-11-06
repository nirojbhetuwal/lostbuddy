import natural from 'natural';
const { JaroWinklerDistance, LevenshteinDistance } = natural;

// Calculate string similarity using multiple algorithms
const calculateStringSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  
  const str1Clean = str1.toLowerCase().trim();
  const str2Clean = str2.toLowerCase().trim();
  
  if (str1Clean === str2Clean) return 1;
  
  // Jaro-Winkler distance (good for short strings)
  const jaroWinkler = JaroWinklerDistance(str1Clean, str2Clean);
  
  // Levenshtein distance normalized
  const maxLength = Math.max(str1Clean.length, str2Clean.length);
  const levenshtein = 1 - (LevenshteinDistance(str1Clean, str2Clean) / maxLength);
  
  // Combine both algorithms for better accuracy
  const combinedScore = (jaroWinkler * 0.7) + (levenshtein * 0.3);
  
  return Math.min(Math.max(combinedScore, 0), 1);
};

// Tokenize and compare text with fuzzy matching
const fuzzyTextMatch = (text1, text2) => {
  if (!text1 || !text2) return 0;
  
  const tokens1 = text1.toLowerCase().split(/\s+/).filter(token => token.length > 2);
  const tokens2 = text2.toLowerCase().split(/\s+/).filter(token => token.length > 2);
  
  if (tokens1.length === 0 || tokens2.length === 0) return 0;
  
  let totalSimilarity = 0;
  let matches = 0;
  
  // Compare each token from first text with each token from second text
  tokens1.forEach(token1 => {
    let bestMatchScore = 0;
    
    tokens2.forEach(token2 => {
      const similarity = calculateStringSimilarity(token1, token2);
      if (similarity > bestMatchScore) {
        bestMatchScore = similarity;
      }
    });
    
    if (bestMatchScore > 0.6) { // Threshold for considering it a match
      totalSimilarity += bestMatchScore;
      matches++;
    }
  });
  
  // Calculate average similarity, weighted by match count
  const similarityScore = matches > 0 ? totalSimilarity / tokens1.length : 0;
  
  return similarityScore;
};

// Fuzzy match for item features
const fuzzyFeatureMatch = (features1, features2) => {
  if (!features1 || !features2) return 0;
  
  let score = 0;
  let totalFeatures = 0;
  
  // Color matching with fuzzy logic
  if (features1.color && features2.color) {
    totalFeatures++;
    const colorSimilarity = calculateStringSimilarity(features1.color, features2.color);
    if (colorSimilarity > 0.7) {
      score += colorSimilarity;
    }
  }
  
  // Brand matching with fuzzy logic
  if (features1.brand && features2.brand) {
    totalFeatures++;
    const brandSimilarity = calculateStringSimilarity(features1.brand, features2.brand);
    if (brandSimilarity > 0.8) {
      score += brandSimilarity;
    }
  }
  
  // Model matching with fuzzy logic
  if (features1.model && features2.model) {
    totalFeatures++;
    const modelSimilarity = calculateStringSimilarity(features1.model, features2.model);
    if (modelSimilarity > 0.8) {
      score += modelSimilarity;
    }
  }
  
  // Size matching with fuzzy logic
  if (features1.size && features2.size) {
    totalFeatures++;
    const sizeSimilarity = calculateStringSimilarity(features1.size, features2.size);
    if (sizeSimilarity > 0.7) {
      score += sizeSimilarity;
    }
  }
  
  return totalFeatures > 0 ? score / totalFeatures : 0;
};

// Location fuzzy matching
const fuzzyLocationMatch = (location1, location2) => {
  if (!location1 || !location2) return 0;
  
  const loc1 = location1.toLowerCase();
  const loc2 = location2.toLowerCase();
  
  // Exact match
  if (loc1 === loc2) return 1;
  
  // Contains match
  if (loc1.includes(loc2) || loc2.includes(loc1)) return 0.8;
  
  // Token-based fuzzy match
  return fuzzyTextMatch(location1, location2);
};

// Main fuzzy matching function for items
const fuzzyItemMatch = (item1, item2) => {
  const titleSimilarity = fuzzyTextMatch(item1.title, item2.title);
  const descriptionSimilarity = fuzzyTextMatch(item1.description, item2.description);
  const locationSimilarity = fuzzyLocationMatch(item1.location, item2.location);
  const featureSimilarity = fuzzyFeatureMatch(item1.features, item2.features);
  
  // Calculate weighted score
  const weights = {
    title: 0.35,
    description: 0.25,
    location: 0.25,
    features: 0.15
  };
  
  const totalScore = 
    (titleSimilarity * weights.title) +
    (descriptionSimilarity * weights.description) +
    (locationSimilarity * weights.location) +
    (featureSimilarity * weights.features);
  
  return {
    totalScore: Math.round(totalScore * 100) / 100,
    breakdown: {
      title: Math.round(titleSimilarity * 100),
      description: Math.round(descriptionSimilarity * 100),
      location: Math.round(locationSimilarity * 100),
      features: Math.round(featureSimilarity * 100)
    }
  };
};

// Find best fuzzy matches from a list of items
const findFuzzyMatches = (targetItem, candidateItems, threshold = 0.6) => {
  const matches = candidateItems.map(candidate => {
    const matchResult = fuzzyItemMatch(targetItem, candidate);
    return {
      item: candidate,
      score: matchResult.totalScore,
      breakdown: matchResult.breakdown
    };
  });
  
  // Filter by threshold and sort by score
  return matches
    .filter(match => match.score >= threshold)
    .sort((a, b) => b.score - a.score);
};

export {
  calculateStringSimilarity,
  fuzzyTextMatch,
  fuzzyFeatureMatch,
  fuzzyLocationMatch,
  fuzzyItemMatch,
  findFuzzyMatches
};