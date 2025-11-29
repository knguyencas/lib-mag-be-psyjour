const adminUserService = require('../services/adminUser.service');
const ApiResponse = require('../utils/apiResponse');

class AdminUserController {
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
}

module.exports = new AdminUserController();
