// utils/grammarHelpers.js

/**
 * Mock Grammar Correction Function
 * Simulates grammar correction with common patterns
 */
export const correctGrammar = async (text) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const corrections = text
    .replace(/hare run/gi, 'hare runs')
    .replace(/say he will/gi, 'says he will')
    .replace(/keep walking/gi, 'keeps walking')
    .replace(/Hare sleep/gi, 'Hare sleeps')
    .replace(/tortoise finally reach/gi, 'tortoise finally reaches')
    .replace(/Hare too late/gi, 'Hare is too late')
    .replace(/win race/gi, 'wins the race');
  
  return corrections;
};

/**
 * Calculate changes between original and corrected text
 * Returns an array of change objects with type and position
 */
export const calculateChanges = (original, corrected) => {
  const origWords = original.split(/\s+/).filter(word => word.length > 0);
  const corrWords = corrected.split(/\s+/).filter(word => word.length > 0);
  const changes = [];
  
  const maxLength = Math.max(origWords.length, corrWords.length);
  
  for (let i = 0; i < maxLength; i++) {
    const origWord = origWords[i] || '';
    const corrWord = corrWords[i] || '';
    
    if (origWord !== corrWord) {
      const cleanOrig = origWord.replace(/[.,!?;:]/g, '');
      const cleanCorr = corrWord.replace(/[.,!?;:]/g, '');
      
      let type;
      if (!origWord && corrWord) {
        type = 'insertion';
      } else if (origWord && !corrWord) {
        type = 'deletion';
      } else if (cleanOrig.toLowerCase() === cleanCorr.toLowerCase()) {
        type = 'punctuation';
      } else {
        type = 'replacement';
      }
      
      changes.push({
        original: origWord,
        corrected: corrWord,
        type,
        position: i,
        id: `${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      });
    }
  }
  
  return changes;
};

/**
 * Get word positions in text
 * Returns array of positions where word appears
 */
export const getWordPositions = (text, word) => {
  const positions = [];
  const regex = new RegExp(`\\b${word}\\b`, 'gi');
  let match;
  while ((match = regex.exec(text)) !== null) {
    positions.push(match.index);
  }
  return positions;
};