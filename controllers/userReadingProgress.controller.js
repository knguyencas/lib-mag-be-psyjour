const userReadingProgressService = require('../services/userReadingProgress.service');

// POST /api/reading-progress/:bookId
exports.updateProgress = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;
    const progressData = req.body;

    const progress = await userReadingProgressService.updateProgress(
      userId,
      bookId,
      progressData
    );

    res.status(200).json({
      success: true,
      message: 'Progress updated',
      data: progress,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/reading-progress/:bookId
exports.getProgress = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    const progress = await userReadingProgressService.getProgress(userId, bookId);

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/reading-progress/recently-read/list
exports.getRecentlyRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const recentlyRead = await userReadingProgressService.getRecentlyRead(
      userId,
      req.query
    );

    res.status(200).json({
      success: true,
      data: recentlyRead,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE /api/reading-progress/:bookId
exports.deleteProgress = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    await userReadingProgressService.deleteProgress(userId, bookId);

    res.status(200).json({
      success: true,
      message: 'Progress deleted',
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
