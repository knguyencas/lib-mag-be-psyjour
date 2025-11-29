const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         displayName:
 *           type: string
 *         avatar:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     RegisterInput:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           minLength: 3
 *         email:
 *           type: string
 *           format: email
 *           description: "Optional email"
 *         password:
 *           type: string
 *           minLength: 8
 *     LoginInput:
 *       type: object
 *       required:
 *         - identifier
 *         - password
 *       properties:
 *         identifier:
 *           type: string
 *           description: "Email or username"
 *         password:
 *           type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/change-password', authMiddleware, authController.changePassword);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;