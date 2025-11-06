import natural from 'natural';
import stopword from 'stopword';

// Initialize natural language tools
const { TfIdf, PorterStemmer } = natural;
const tokenizer = new natural.WordTokenizer();

// Preprocess text: tokenize, remove stopwords, stem
const preprocessText = (text) => {
  if (!text) return '';
  
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const filteredTokens = stopword.removeStopwords(tokens);
  const stemmedTokens = filteredTokens.map(token => PorterStemmer.stem(token));
  
  return stemmedTokens.join(' ');
};

// Calculate cosine similarity between two texts
const calculateTextSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;
  
  const processed1 = preprocessText(text1);
  const processed2 = preprocessText(text2);
  
  if (!processed1 || !processed2) return 0;
  
  const tfidf = new TfIdf();
  
  tfidf.addDocument(processed1);
  tfidf.addDocument(processed2);
  
  let similarity = 0;
  const terms = new Set([...processed1.split(' '), ...processed2.split(' ')]);
  
  terms.forEach(term => {
    const score1 = tfidf.tfidf(term, 0);
    const score2 = tfidf.tfidf(term, 1);
    similarity += score1 * score2;
  });
  
  return Math.min(Math.max(similarity, 0), 1);
};

// Calculate location similarity
const calculateLocationSimilarity = (loc1, loc2) => {
  if (!loc1 || !loc2) return 0;
  
  const words1 = loc1.toLowerCase().split(/\s+/);
  const words2 = loc2.toLowerCase().split(/\s+/);
  
  const commonWords = words1.filter(word => 
    words2.includes(word) && word.length > 2
  );
  
  const similarity = commonWords.length / Math.max(words1.length, words2.length);
  return similarity;
};

// Calculate date similarity (closer dates get higher scores)
const calculateDateSimilarity = (date1, date2, rangeDays = 7) => {
  const diffTime = Math.abs(new Date(date1) - new Date(date2));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > rangeDays) return 0;
  
  return 1 - (diffDays / rangeDays);
};

// Calculate feature similarity
const calculateFeatureSimilarity = (features1, features2) => {
  if (!features1 || !features2) return 0;
  
  let score = 0;
  let totalFeatures = 0;
  
  // Color similarity
  if (features1.color && features2.color) {
    totalFeatures++;
    if (features1.color.toLowerCase() === features2.color.toLowerCase()) {
      score += 1;
    } else {
      // Partial match for similar colors
      const color1 = features1.color.toLowerCase();
      const color2 = features2.color.toLowerCase();
      if (color1.includes(color2) || color2.includes(color1)) {
        score += 0.5;
      }
    }
  }
  
  // Brand similarity
  if (features1.brand && features2.brand) {
    totalFeatures++;
    if (features1.brand.toLowerCase() === features2.brand.toLowerCase()) {
      score += 1;
    } else {
      // Partial match for similar brands
      const brand1 = features1.brand.toLowerCase();
      const brand2 = features2.brand.toLowerCase();
      if (brand1.includes(brand2) || brand2.includes(brand1)) {
        score += 0.7;
      }
    }
  }
  
  // Model similarity
  if (features1.model && features2.model) {
    totalFeatures++;
    if (features1.model.toLowerCase() === features2.model.toLowerCase()) {
      score += 1;
    } else {
      // Partial match for similar models
      const model1 = features1.model.toLowerCase();
      const model2 = features2.model.toLowerCase();
      if (model1.includes(model2) || model2.includes(model1)) {
        score += 0.8;
      }
    }
  }
  
  // Size similarity
  if (features1.size && features2.size) {
    totalFeatures++;
    if (features1.size.toLowerCase() === features2.size.toLowerCase()) {
      score += 1;
    } else {
      // Partial match for similar sizes
      const size1 = features1.size.toLowerCase();
      const size2 = features2.size.toLowerCase();
      const sizeMap = {
        'xs': 'extra small', 's': 'small', 'm': 'medium', 
        'l': 'large', 'xl': 'extra large'
      };
      
      const normalized1 = sizeMap[size1] || size1;
      const normalized2 = sizeMap[size2] || size2;
      
      if (normalized1 === normalized2) {
        score += 1;
      } else if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
        score += 0.6;
      }
    }
  }
  
  return totalFeatures > 0 ? score / totalFeatures : 0;
};

// Calculate category similarity
const calculateCategorySimilarity = (cat1, cat2) => {
  if (!cat1 || !cat2) return 0;
  
  if (cat1 === cat2) return 1;
  
  // Related categories get partial score
  const relatedCategories = {
    'electronics': ['phones', 'laptops', 'tablets'],
    'documents': ['ids', 'passports', 'licenses'],
    'clothing': ['accessories', 'bags'],
    'accessories': ['clothing', 'jewelry'],
    'bags': ['clothing', 'accessories'],
    'books': ['documents'],
    'keys': ['accessories'],
    'jewelry': ['accessories'],
    'pets': ['animals']
  };
  
  if (relatedCategories[cat1]?.includes(cat2) || relatedCategories[cat2]?.includes(cat1)) {
    return 0.5;
  }
  
  return 0;
};

// Main matching function
const calculateMatchScore = (lostItem, foundItem, weights = {
  title: 0.25,
  description: 0.20,
  location: 0.20,
  date: 0.15,
  features: 0.15,
  category: 0.05
}) => {
  // Ensure we're comparing lost vs found items
  if (lostItem.type === foundItem.type) {
    return {
      totalScore: 0,
      breakdown: {
        title: 0,
        description: 0,
        location: 0,
        date: 0,
        features: 0,
        category: 0
      }
    };
  }

  const titleSimilarity = calculateTextSimilarity(lostItem.title, foundItem.title);
  const descriptionSimilarity = calculateTextSimilarity(lostItem.description, foundItem.description);
  const locationSimilarity = calculateLocationSimilarity(lostItem.location, foundItem.location);
  const dateSimilarity = calculateDateSimilarity(lostItem.date, foundItem.date);
  const featureSimilarity = calculateFeatureSimilarity(lostItem.features, foundItem.features);
  const categorySimilarity = calculateCategorySimilarity(lostItem.category, foundItem.category);
  
  const totalScore = 
    titleSimilarity * weights.title +
    descriptionSimilarity * weights.description +
    locationSimilarity * weights.location +
    dateSimilarity * weights.date +
    featureSimilarity * weights.features +
    categorySimilarity * weights.category;
  
  return {
    totalScore: Math.round(totalScore * 100) / 100,
    breakdown: {
      title: Math.round(titleSimilarity * 100),
      description: Math.round(descriptionSimilarity * 100),
      location: Math.round(locationSimilarity * 100),
      date: Math.round(dateSimilarity * 100),
      features: Math.round(featureSimilarity * 100),
      category: Math.round(categorySimilarity * 100)
    }
  };
};

// Find best matches from a list of potential items
const findBestMatches = (targetItem, potentialItems, threshold = 0.3, limit = 5) => {
  const matchesWithScores = potentialItems.map(potentialItem => {
    const matchResult = calculateMatchScore(
      targetItem.type === 'lost' ? targetItem : potentialItem,
      targetItem.type === 'lost' ? potentialItem : targetItem
    );
    
    return {
      item: potentialItem,
      score: matchResult.totalScore,
      breakdown: matchResult.breakdown,
      matchDetails: matchResult
    };
  });

  // Filter by threshold and sort by score
  const filteredMatches = matchesWithScores
    .filter(match => match.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return filteredMatches;
};

export {
  calculateMatchScore,
  findBestMatches,
  preprocessText,
  calculateTextSimilarity,
  calculateLocationSimilarity,
  calculateDateSimilarity,
  calculateFeatureSimilarity,
  calculateCategorySimilarity
};