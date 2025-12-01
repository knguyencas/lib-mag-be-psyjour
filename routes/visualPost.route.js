const express = require('express');
const multer = require('multer');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const visualPostController = require('../controllers/vp_controller');

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

/**
 * @swagger
 * /api/visualpost:
 *   get:
 *     summary: Get all published visual posts (public)
 *     tags: [Visual Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, likes]
 *           default: newest
 *     responses:
 *       200:
 *         description: List of published visual posts
 */
router.get('/', visualPostController.getPublishedPosts);

/**
 * @swagger
 * /api/visualpost:
 *   post:
 *     summary: Create a new visual post
 *     tags: [Visual Posts]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, upload.single('image'), visualPostController.createVisualPost);

/**
 * @swagger
 * /api/visualpost/my-posts:
 *   get:
 *     summary: Get current user's visual posts
 *     tags: [Visual Posts]
 *     security:
 *       - bearerAuth: []
 */
router.get('/my-posts', authenticate, visualPostController.getUserPosts);

/**
 * @swagger
 * /api/visualpost/{id}:
 *   get:
 *     summary: Get a single visual post by ID
 *     tags: [Visual Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID (e.g., VP001)
 */
router.get('/:id', visualPostController.getPostById);

module.exports = router;