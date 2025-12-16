

const express = require('express');
const router = express.Router();
const axios = require('axios');

const EVALUATION_SERVICE = process.env.EVALUATION_SERVICE_URL || 'http://localhost:4000';

console.log(' Evaluation Service URL:', EVALUATION_SERVICE);

// ========================== HEALTH CHECK ==========================
router.get('/health/check', async (req, res) => {
  try {
    const response = await axios.get(`${EVALUATION_SERVICE}/health`, {
      timeout: 3000
    });
    
    res.json({
      gateway: 'connected',
      evaluationService: response.data
    });
  } catch (error) {
    res.status(503).json({
      gateway: 'connected',
      evaluationService: 'unavailable',
      error: error.message,
      url: `${EVALUATION_SERVICE}/health`
    });
  }
});

// ========================== GET STATISTICS ==========================
router.get('/statistics/:userId?', async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const url = userId 
      ? `${EVALUATION_SERVICE}/api/statistics/${userId}`
      : `${EVALUATION_SERVICE}/api/statistics`;

    console.log(` Fetching statistics from: ${url}`);

    const response = await axios.get(url, { 
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });

    console.log(` Statistics fetched successfully`);
    res.json(response.data);

  } catch (error) {
    console.error(' Statistics error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Evaluation Service unavailable',
        message: 'Service is not running on port 4000'
      });
    }
    
    next(error);
  }
});

// ========================== GET HISTORY ==========================
router.get('/history', async (req, res, next) => {
  try {
    const { userId, limit = 10, offset = 0, type } = req.query;

    console.log(`📜 Fetching history - userId: ${userId || 'all'}`);

    const response = await axios.get(
      `${EVALUATION_SERVICE}/api/evaluations/history`,
      {
        params: { userId, limit: parseInt(limit), offset: parseInt(offset), type },
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log(` History fetched: ${response.data.history?.length || 0} items`);
    res.json(response.data);

  } catch (error) {
    console.error(' History error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Service Unavailable'
      });
    }
    
    next(error);
  }
});

// ========================== GET BY ID ==========================
router.get('/:evaluationId', async (req, res, next) => {
  try {
    const { evaluationId } = req.params;

    console.log(`🔍 Fetching evaluation: ${evaluationId}`);

    const response = await axios.get(
      `${EVALUATION_SERVICE}/api/evaluations/${evaluationId}`,
      { 
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log(` Evaluation fetched`);
    res.json(response.data);

  } catch (error) {
    console.error(' Get evaluation error:', error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Evaluation not found'
      });
    }
    
    next(error);
  }
});

// ========================== DELETE ==========================
router.delete('/:evaluationId', async (req, res, next) => {
  try {
    const { evaluationId } = req.params;

    console.log(`🗑️ Deleting evaluation: ${evaluationId}`);

    const response = await axios.delete(
      `${EVALUATION_SERVICE}/api/evaluations/${evaluationId}`,
      { 
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log(` Evaluation deleted`);
    res.json(response.data);

  } catch (error) {
    console.error(' Delete error:', error.message);
    next(error);
  }
});

module.exports = router;