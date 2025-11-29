const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const adminUserController = require('../controllers/adminUser.controller');

// POST /api/admin/users/create-admin
router.post(
  '/users/create-admin',
  authMiddleware,
  authorizeRoles('super_admin'),
  (req, res, next) => adminUserController.createAdmin(req, res, next)
);

module.exports = router;
