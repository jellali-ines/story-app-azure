// ========================== UPDATED GRAMMAR ANALYSIS HOOK ==========================
// WITH DIRECT DATABASE SAVE

import { useState } from 'react';
import { checkGrammar, evaluateStory } from '../services/api';

const EVAL_SERVICE = 'http://localhost:4000'; // Direct connection to DB

console.log('🔧 useGrammarAnalysis loaded - EVAL_SERVICE:', EVAL_SERVICE);

export default function useGrammarAnalysis() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // ========================== SAVE TO DATABASE ==========================
  const saveToDatabase = async (type, originalText, result, score, statistics) => {
    try {
      console.log('💾 Saving to database...', { type, score, statistics });
      
      const evaluationData = {
        userId: 'anonymous', // You can change this later
        type: type,
        originalText: originalText,
        result: result,
        score: score,
        statistics: statistics
      };

      const response = await fetch(`${EVAL_SERVICE}/api/evaluations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evaluationData)
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Saved to database successfully:', data);
        return true;
      } else {
        console.error('❌ Failed to save:', data);
        return false;
      }
    } catch (error) {
      console.error('❌ Database save error:', error);
      return false;
    }
  };

  // ========================== ANALYZE GRAMMAR ==========================
  const analyzeGrammar = async (text) => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      console.log('📝 Analyzing grammar...');
      
      const response = await checkGrammar(text);
      
      console.log('✅ Grammar analysis completed:', response);
      
      // Convert response to compatible format
      const formattedResult = {
        type: 'grammar',
        score: response.statistics?.grammar_score || 0,
        similarity: response.statistics?.semantic_similarity || 0,
        original: response.original_text,
        corrected: response.corrected_plain,
        changes: response.changes?.flatMap(change => 
          change.changes.map((c, idx) => ({
            id: `${change.sentence_num}-${idx}`,
            original: c.original,
            corrected: c.corrected,
            type: c.type,
            position: c.position
          }))
        ) || [],
        statistics: response.statistics,
        errorAnalysis: response.error_analysis || {},
        corrections: response.changes?.flatMap(change =>
          change.changes.map(c => ({
            original: c.original,
            corrected: c.corrected,
            explanation: getExplanation(c.type)
          }))
        ) || [],
        positiveFeedback: response.is_perfect 
          ? "Perfect! No errors found! 🌟" 
          : `Great job! Fixed ${response.statistics?.total_changes || 0} issues! 💪`
      };
      
      setResult(formattedResult);
      
      // ✅ Save to database
      await saveToDatabase(
        'grammar',
        text,
        response,
        formattedResult.score,
        {
          wordCount: response.statistics?.words || 0,
          errorsFound: response.statistics?.errors_before || 0,
          changesMade: response.statistics?.total_changes || 0
        }
      );
      
      // Show confetti
      if (formattedResult.score > 80) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      
    } catch (err) {
      console.error('❌ Grammar analysis error:', err);
      setError(err.message || 'Failed to analyze grammar');
    } finally {
      setLoading(false);
    }
  };

  // ========================== EVALUATE STORY ==========================
  const evaluateStoryWrapper = async (story, keyPoints) => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      console.log('📚 Evaluating story...');
      
      const response = await evaluateStory(story);
      
      console.log('✅ Story evaluation completed:', response);
      
      // Convert response
      const formattedResult = {
        type: 'story',
        overallGrade: response.evaluation?.overall_grade || 0,
        grammarScore: response.evaluation?.grammar_score || 0,
        coverage: response.evaluation?.content_coverage || 0,
        similarity: response.evaluation?.story_similarity || 0,
        wordCount: response.evaluation?.word_count || 0,
        original: response.original_summary,
        corrected: response.corrected_summary,
        
        grammarChanges: response.grammar_changes?.flatMap(change =>
          change.changes.map((c, idx) => ({
            id: `${change.sentence_num}-${idx}`,
            original: c.original,
            corrected: c.corrected,
            type: c.type,
            position: c.position
          }))
        ) || [],
        
        storyAnalysis: response.story_analysis || {},
        errorAnalysis: response.error_analysis || {},
        keyPointsScores: response.story_analysis?.coverage_by_category || {},
        foundPoints: extractFoundPoints(response.story_analysis),
        feedback: generateFeedback(response),
        gradeEmoji: response.evaluation?.grade_emoji || '📚',
        gradeText: response.evaluation?.grade_text || 'Good Try'
      };
      
      setResult(formattedResult);
      
      // ✅ Save to database
      await saveToDatabase(
        'story',
        story,
        response,
        formattedResult.overallGrade,
        {
          wordCount: response.evaluation?.word_count || 0,
          errorsFound: response.evaluation?.errors_before || 0,
          changesMade: response.grammar_changes?.length || 0
        }
      );
      
      // Show confetti
      if (formattedResult.overallGrade > 85) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      
    } catch (err) {
      console.error('❌ Story evaluation error:', err);
      setError(err.message || 'Failed to evaluate story');
    } finally {
      setLoading(false);
    }
  };

  // ========================== CLEAR RESULT ==========================
  const clearResult = () => {
    setResult(null);
    setError(null);
    setShowConfetti(false);
  };

  // ========================== HELPER FUNCTIONS ==========================
  
  const getExplanation = (type) => {
    const explanations = {
      replacement: "Word form or tense corrected",
      insertion: "Missing word added",
      deletion: "Unnecessary word removed"
    };
    return explanations[type] || "Grammar correction applied";
  };

  const extractFoundPoints = (storyAnalysis) => {
    if (!storyAnalysis || !storyAnalysis.student_elements) return [];
    
    const points = [];
    const elements = storyAnalysis.student_elements;
    
    if (elements.characters) {
      points.push(...elements.characters.map(c => `Character: ${c}`));
    }
    
    if (elements.locations) {
      points.push(...elements.locations.map(l => `Location: ${l}`));
    }
    
    if (elements.actions) {
      points.push(...elements.actions.slice(0, 5).map(a => 
        `Action: ${a.subject || 'Someone'} ${a.verb} ${a.object || ''}`
      ));
    }
    
    return points;
  };

  const generateFeedback = (response) => {
    const grade = response.evaluation?.overall_grade || 0;
    const coverage = response.evaluation?.content_coverage || 0;
    const grammar = response.evaluation?.grammar_score || 0;
    
    let feedback = `${response.evaluation?.grade_emoji} ${response.evaluation?.grade_text}! `;
    
    if (grade >= 90) {
      feedback += "Outstanding work! You captured all the key elements perfectly.";
    } else if (grade >= 80) {
      feedback += "Excellent! You included most important story elements.";
    } else if (grade >= 70) {
      feedback += "Good job! Try to include more details about the story.";
    } else {
      feedback += "Keep practicing! Focus on the main events and characters.";
    }
    
    if (grammar < 80) {
      feedback += " Review the grammar corrections to improve.";
    }
    
    if (coverage < 70) {
      feedback += " Try to mention more story elements.";
    }
    
    return feedback;
  };

  return {
    loading,
    result,
    error,
    showConfetti,
    analyzeGrammar,
    evaluateStory: evaluateStoryWrapper,
    clearResult
  };
}