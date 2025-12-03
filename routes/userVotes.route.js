const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const userVotesService = require('../services/userVotes.service');

// POST /api/votes/:targetType/:targetId
router.post('/:targetType/:targetId', authMiddleware, async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const { voteType } = req.body;
    const userId = req.user._id;

    const validTypes = ['perspective_post', 'visual_post', 'comment'];
    if (!validTypes.includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid target type'
      });
    }

    const result = await userVotesService.toggleVote(userId, targetType, targetId, voteType);

    const counts = await userVotesService.getVoteCounts(targetType, targetId);

    res.status(200).json({
      success: true,
      message: `Vote ${result.action}`,
      data: {
        action: result.action,
        voteType: result.voteType,
        counts
      }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/votes/:targetType/:targetId/my-vote
router.get('/:targetType/:targetId/my-vote', authMiddleware, async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const userId = req.user._id;

    const vote = await userVotesService.getUserVote(userId, targetType, targetId);

    res.status(200).json({
      success: true,
      data: vote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/votes/:targetType/:targetId/counts
router.get('/:targetType/:targetId/counts', async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    const counts = await userVotesService.getVoteCounts(targetType, targetId);

    res.status(200).json({
      success: true,
      data: counts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/votes/:targetType/batch
router.post('/:targetType/batch', authMiddleware, async (req, res) => {
  try {
    const { targetType } = req.params;
    const { targetIds } = req.body;
    const userId = req.user._id;

    const votes = await userVotesService.getUserVotesBatch(userId, targetType, targetIds);

    res.status(200).json({
      success: true,
      data: votes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;