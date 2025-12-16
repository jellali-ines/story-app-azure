
const express = require('express');
const router = express.Router();
const axios = require('axios');

const GRAMMAR_SERVICE = process.env.GRAMMAR_SERVICE_URL || 'http://localhost:7860';
const EVALUATION_SERVICE = process.env.EVALUATION_SERVICE_URL || 'http://localhost:4000';

// ========================== STORY EVALUATION ==========================
router.post('/evaluate', async (req, res, next) => {
  try {
    const { summary, userId } = req.body;

    // Validation
    if (!summary || !summary.trim()) {
      return res.status(400).json({
        error: 'Missing summary parameter',
        message: 'Please provide story summary'
      });
    }

    console.log(`ðŸ“š Story evaluation request: ${summary.substring(0, 50)}...`);

    // Call grammar service for evaluation
    const grammarResponse = await axios.post(
      `${GRAMMAR_SERVICE}/api/story/evaluate`,
      { summary },
      { 
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Save evaluation to database (non-blocking)
    if (grammarResponse.data.success) {
      try {
        await axios.post(
          `${EVALUATION_SERVICE}/api/evaluations`,
          {
            userId: userId || 'anonymous',
            type: 'story',
            originalText: summary,
            result: grammarResponse.data,
            timestamp: new Date().toISOString()
          },
          { 
            timeout: 5000,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('ðŸ’¾ Evaluation saved to database');
      } catch (dbError) {
        console.error('âš ï¸ Failed to save evaluation:', dbError.message);
        // Don't fail the request if database save fails
      }
    }

    console.log(`âœ… Story evaluation completed`);
    res.json(grammarResponse.data);

  } catch (error) {
    console.error('âŒ Story evaluation error:', error.message);
    next(error);
  }
});

// ========================== GET ORIGINAL STORY ==========================
router.get('/original', async (req, res, next) => {
  try {
    console.log('ðŸ“– Fetching original story');

    const response = await axios.get(
      `${GRAMMAR_SERVICE}/api/story/original`,
      { 
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('âœ… Original story retrieved');
    res.json(response.data);

  } catch (error) {
    console.error('âŒ Get original story error:', error.message);
    next(error);
  }
});

module.exports = router;