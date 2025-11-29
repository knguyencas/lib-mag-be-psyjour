const adminUserService = require('../services/adminUser.service');
const ApiResponse = require('../utils/apiResponse');

class AdminUserController {
  // POST /api/admin/users/create-admin
  async createAdmin(req, res, next) {
    try {
      const creatorId = req.userId; // super_admin
      const result = await adminUserService.createAdminUser(creatorId, req.body);

      res.status(201).json(
        ApiResponse.success(result, 'Admin user created successfully', 201)
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admin/users/admins
  async getAllAdmins(req, res, next) {
    try {
      const requesterId = req.userId;
      const admins = await adminUserService.getAllAdmins(requesterId);

      res.json(
        ApiResponse.success(admins, 'Admin list retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admin/users/admins/:id
  async deleteAdmin(req, res, next) {
    try {
      const requesterId = req.userId;
      const adminId = req.params.id;

      const result = await adminUserService.deleteAdmin(requesterId, adminId);

      res.json(
        ApiResponse.success(result, 'Admin user deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminUserController();