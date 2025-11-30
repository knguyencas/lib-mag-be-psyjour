const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

/**
 * @desc    Create a new admin user
 * @route   POST /api/admin/users/create-admin
 * @access  Super Admin only
 */
const createAdmin = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      throw ApiError.badRequest('Username or email already exists');
    }

    const newAdmin = new User({
      username,
      email: email || undefined,
      password,
      role: 'admin'
    });

    await newAdmin.save();

    res.status(201).json(ApiResponse.success(
      { 
        username: newAdmin.username, 
        email: newAdmin.email, 
        role: newAdmin.role,
        _id: newAdmin._id
      },
      'Admin created successfully'
    ));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all admin users
 * @route   GET /api/admin/users/admins
 * @access  Super Admin only
 */
const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ 
      role: { $in: ['admin', 'super_admin'] }
    })
    .select('-password')
    .sort({ createdAt: -1 });

    res.json(ApiResponse.success(admins, 'Admins retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an admin user
 * @route   DELETE /api/admin/users/admins/:id
 * @access  Super Admin only
 */
const deleteAdmin = async (req, res, next) => {
  try {
    // Prevent super_admin from deleting themselves
    if (req.user.userId === req.params.id) {
      throw ApiError.badRequest('Cannot delete your own account');
    }

    const admin = await User.findById(req.params.id);

    if (!admin) {
      throw ApiError.notFound('Admin not found');
    }

    // Prevent deleting super_admin accounts
    if (admin.role === 'super_admin') {
      throw ApiError.forbidden('Cannot delete super admin accounts');
    }

    await User.findByIdAndDelete(req.params.id);

    res.json(ApiResponse.success(null, 'Admin deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAdmin,
  getAllAdmins,
  deleteAdmin
};