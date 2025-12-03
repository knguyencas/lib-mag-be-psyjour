const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const userCommentsService = require('../services/userComments.service');

// POST /api/perspective-posts/:postId/comments
router.post('/:postId/comments', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const { content, parent_comment_id } = req.body;

    const comment = await userCommentsService.postComment(
      userId, 
      postId, 
      content,
      parent_comment_id || null
    );

    res.status(201).json({
      success: true,
      message: parent_comment_id ? 'Reply posted successfully' : 'Comment posted successfully',
      data: comment
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/perspective-posts/:postId/comments
router.get('/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const result = await userCommentsService.getCommentsWithReplies(postId, req.query);

    res.status(200).json({
      success: true,
      data: result.comments,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/perspective-posts/comments/:commentId
router.put('/comments/:commentId', authMiddleware, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;
    const { content } = req.body;

    const comment = await userCommentsService.updateComment(userId, commentId, content);

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: comment
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/perspective-posts/comments/:commentId
router.delete('/comments/:commentId', authMiddleware, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    await userCommentsService.deleteComment(userId, commentId);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;