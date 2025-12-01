const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const perspectivePostController = require('../controllers/pp_controller');

/**
 * @swagger
 * /api/perspectivepost:
 *   get:
 *     summary: Get all published perspective posts (public)
 *     tags: [Perspective Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts per page
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by primary genre
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, upvotes]
 *           default: newest
 *         description: Sort order for posts
 *     responses:
 *       200:
 *         description: List of published perspective posts
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
 *                     $ref: '#/components/schemas/PerspectivePost'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pages:
 *                       type: integer
 *                       example: 5
 *                     limit:
 *                       type: integer
 *                       example: 10
 *       500:
 *         description: Server error
 */
router.get('/', perspectivePostController.getPublishedPosts);

/**
 * @swagger
 * /api/perspectivepost:
 *   post:
 *     summary: Create a new perspective post
 *     tags: [Perspective Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *               - content
 *             properties:
 *               topic:
 *                 type: string
 *                 maxLength: 200
 *                 example: "The Role of Mindfulness in Modern Psychology"
 *               content:
 *                 type: string
 *                 example: "Mindfulness has emerged as a powerful tool in contemporary psychological practice..."
 *               primary_genre:
 *                 type: string
 *                 enum: [Psychology, Philosophy, Literature, Self-help, Mindfulness, Spirituality, General]
 *                 example: "Psychology"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["mindfulness", "therapy", "mental-health"]
 *     responses:
 *       201:
 *         description: Perspective post created successfully
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
 *                   example: "Perspective post created successfully. Pending admin approval."
 *                 data:
 *                   $ref: '#/components/schemas/PerspectivePost'
 *       400:
 *         description: Bad request - missing required fields or invalid data
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, perspectivePostController.createPerspectivePost);

/**
 * @swagger
 * /api/perspectivepost/my-posts:
 *   get:
 *     summary: Get current user's perspective posts
 *     tags: [Perspective Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's perspective posts
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
 *                     $ref: '#/components/schemas/PerspectivePost'
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Server error
 */
router.get('/my-posts', authenticate, perspectivePostController.getUserPerspectivePosts);

/**
 * @swagger
 * /api/perspectivepost/{id}:
 *   get:
 *     summary: Get a single perspective post by ID
 *     tags: [Perspective Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID (e.g., PP001)
 *     responses:
 *       200:
 *         description: Perspective post details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PerspectivePost'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.get('/:id', perspectivePostController.getPostById);

/**
 * @swagger
 * /api/perspectivepost/{id}:
 *   put:
 *     summary: Update a perspective post (author only)
 *     tags: [Perspective Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID (e.g., PP001)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic:
 *                 type: string
 *                 maxLength: 200
 *               content:
 *                 type: string
 *               primary_genre:
 *                 type: string
 *                 enum: [Psychology, Philosophy, Literature, Self-help, Mindfulness, Spirituality, General]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Post updated successfully
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
 *                   example: "Post updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/PerspectivePost'
 *       400:
 *         description: Bad request - invalid data
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - not the post author
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticate, perspectivePostController.updatePost);

/**
 * @swagger
 * /api/perspectivepost/{id}:
 *   delete:
 *     summary: Delete a perspective post (author only)
 *     tags: [Perspective Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID (e.g., PP001)
 *     responses:
 *       200:
 *         description: Post deleted successfully
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
 *                   example: "Post deleted successfully"
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - not the post author
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticate, perspectivePostController.deletePost);

/**
 * @swagger
 * components:
 *   schemas:
 *     PerspectivePost:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         post_id:
 *           type: string
 *           example: "PP001"
 *         topic:
 *           type: string
 *           example: "The Role of Mindfulness in Modern Psychology"
 *         content:
 *           type: string
 *           example: "Mindfulness has emerged as a powerful tool..."
 *         author_id:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["mindfulness", "psychology"]
 *         primary_genre:
 *           type: string
 *           example: "Psychology"
 *         status:
 *           type: string
 *           enum: [pending, published, rejected, archived]
 *           example: "pending"
 *         upvotes:
 *           type: number
 *           example: 0
 *         downvotes:
 *           type: number
 *           example: 0
 *         views:
 *           type: number
 *           example: 0
 *         commentsCount:
 *           type: number
 *           example: 0
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