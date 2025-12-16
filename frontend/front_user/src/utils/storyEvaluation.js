// utils/storyEvaluation.js

/**
 * Evaluate how well the story covers key points
 */
export const evaluateKeyPoints = (story, keyPoints) => {
  const storyLower = story.toLowerCase();
  const scores = {};
  const foundPoints = [];
  
  keyPoints.forEach(point => {
    const pointLower = point.toLowerCase();
    let score = 0;
    
    // Check for exact matches
    if (storyLower.includes(pointLower)) {
      score = 100;
      foundPoints.push(point);
    } 
    // Check for partial matches
    else {
      const words = pointLower.split(' ');
      const matchedWords = words.filter(word => 
        storyLower.includes(word) && word.length > 3
      );
      score = (matchedWords.length / words.length) * 100;
      
      if (score > 50) {
        foundPoints.push(point);
      }
    }
    
    scores[point] = Math.round(score);
  });

  const overall = keyPoints.length > 0 
    ? Math.round((foundPoints.length / keyPoints.length) * 100)
    : 0;

  return {
    scores,
    foundPoints,
    overall,
    totalPoints: keyPoints.length,
    foundCount: foundPoints.length
  };
};

/**
 * Calculate overall story score based on grammar and content
 */
export const calculateStoryScore = (grammarScore, contentScore) => {
  // Weight: 60% grammar, 40% content
  return Math.round((grammarScore * 0.6) + (contentScore * 0.4));
};

/**
 * Generate feedback based on story evaluation
 */
export const generateStoryFeedback = (overallGrade, foundPoints, totalPoints) => {
  if (overallGrade >= 90) {
    return {
      title: "Excellent Story! 🎉",
      message: `You covered ${foundPoints}/${totalPoints} key points perfectly!`,
      emoji: "🏆"
    };
  } else if (overallGrade >= 70) {
    return {
      title: "Good Job! 👍", 
      message: `You covered ${foundPoints}/${totalPoints} key points. Keep practicing!`,
      emoji: "⭐"
    };
  } else if (overallGrade >= 50) {
    return {
      title: "Nice Try! 💪",
      message: `You covered ${foundPoints}/${totalPoints} key points. Try to include more details.`,
      emoji: "📝"
    };
  } else {
    return {
      title: "Keep Practicing! 📚",
      message: `You covered ${foundPoints}/${totalPoints} key points. Read the story again carefully.`,
      emoji: "🔍"
    };
  }
};

/**
 * Analyze story structure and quality
 */
export const analyzeStoryStructure = (story) => {
  const words = story.split(/\s+/).filter(word => word.length > 0);
  const sentences = story.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgSentenceLength: words.length / (sentences.length || 1),
    hasBeginning: story.length > 10,
    hasMiddle: story.length > 30, 
    hasEnd: story.includes('.') && story.length > 20
  };
};