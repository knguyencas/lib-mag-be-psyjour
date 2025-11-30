const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware } = require('../middleware/auth');
const {
  createVisualPost,
  getUserPosts
} = require('../controllers/visualPost.controller');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  createVisualPost
);

router.get('/my-posts', authMiddleware, getUserPosts);

module.exports = router;