
const express = require('express');
const router = express.Router();
const axios = require('axios');

const GRAMMAR_SERVICE = process.env.GRAMMAR_SERVICE_URL || 'http://localhost:7860';

// ========================== SINGLE TEXT CHECK ==========================
router.post('/check', async (req, res, next) => {
  try {
    const { text } = req.body;

    // Validation
    if (!text || !text.trim()) {
      return res.status(400).json({
        error: 'Missing text parameter',
        message: 'Please provide text to check'
      });
    }

    console.log(`ðŸ“ Grammar check request: ${text.substring(0, 50)}...`);

    // Forward to grammar service
    const response = await axios.post(`${GRAMMAR_SERVICE}/api/grammar/check`, {
      text
    }, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`âœ… Grammar check completed`);
    res.json(response.data);

  } catch (error) {
    console.error('âŒ Grammar check error:', error.message);
    next(error);
  }
});

// ========================== BATCH CHECK ==========================
router.post('/batch', async (req, res, next) => {
  try {
    const { texts } = req.body;

    // Validation
    if (!Array.isArray(texts)) {
      return res.status(400).json({
        error: 'Invalid format',
        message: 'texts must be an array'
      });
    }

    if (texts.length === 0) {
      return res.status(400).json({
        error: 'Empty array',
        message: 'Please provide at least one text'
      });
    }

    console.log(`ðŸ“ Batch grammar check: ${texts.length} texts`);

    // Forward to grammar service
    const response = await axios.post(`${GRAMMAR_SERVICE}/api/grammar/batch`, {
      texts
    }, {
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`âœ… Batch check completed`);
    res.json(response.data);

  } catch (error) {
    console.error('âŒ Batch check error:', error.message);
    next(error);
  }
});

// ========================== SERVICE STATUS ==========================
router.get('/status', async (req, res) => {
  try {
    const response = await axios.get(`${GRAMMAR_SERVICE}/health`, {
      timeout: 5000
    });
    
    res.json({
      gateway: 'connected',
      grammarService: response.data
    });
  } catch (error) {
    res.status(503).json({
      gateway: 'connected',
      grammarService: 'unavailable',
      error: error.message
    });
  }
});

module.exports = router;