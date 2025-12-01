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
 *   post:
 *     summary: Create a new visual post
 *     tags: [Visual Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *                 example: "The Beauty of Mindfulness"
 *               content:
 *                 type: string
 *                 example: "In our fast-paced world, taking a moment to breathe and be present can transform our daily experience..."
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (max 5MB)
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["mindfulness", "psychology", "wellness"]
 *     responses:
 *       201:
 *         description: Visual post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Visual post created successfully. Pending admin approval."
 *                 data:
 *                   $ref: '#/components/schemas/VisualPost'
 *       400:
 *         description: Bad request - missing required fields or invalid data
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Server error
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
 *     responses:
 *       200:
 *         description: List of user's visual posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VisualPost'
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Server error
 */
router.get('/my-posts', authenticate, visualPostController.getUserPosts);

/**
 * @swagger
 * components:
 *   schemas:
 *     VisualPost:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         post_id:
 *           type: string
 *           example: "VP001"
 *         title:
 *           type: string
 *           example: "The Beauty of Mindfulness"
 *         content:
 *           type: string
 *           example: "In our fast-paced world, taking a moment to breathe..."
 *         author_id:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         author_username:
 *           type: string
 *           example: "john_doe"
 *         image_url:
 *           type: string
 *           example: "https://res.cloudinary.com/demo/image/upload/v1234567890/psyche_library/visual_posts/abc123.jpg"
 *         image_public_id:
 *           type: string
 *           example: "psyche_library/visual_posts/abc123"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["mindfulness", "psychology"]
 *         likes:
 *           type: number
 *           example: 0
 *         status:
 *           type: string
 *           enum: [pending, published, archived, rejected]
 *           example: "pending"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 */

module.exports = router;