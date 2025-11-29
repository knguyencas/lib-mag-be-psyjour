require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const SUPER_ADMIN = {
  username: 'superadmin',
  email: 'superadmin@psychelibrary.com',
  password: 'SuperAdmin@2025',
  role: 'super_admin',
  displayName: 'Super Administrator'
};

async function seedSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    
    if (existingSuperAdmin) {
      console.log('Super Admin already exists:', existingSuperAdmin.username);
      console.log('Email:', existingSuperAdmin.email);
      process.exit(0);
    }

    const existingUser = await User.findOne({
      $or: [
        { username: SUPER_ADMIN.username },
        { email: SUPER_ADMIN.email }
      ]
    });

    if (existingUser) {
      console.log('Username or email already exists. Updating role to super_admin...');
      existingUser.role = 'super_admin';
      await existingUser.save();
      console.log('Updated existing user to super_admin');
      process.exit(0);
    }

    // Hash 
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN.password, salt);

    const superAdmin = new User({
      username: SUPER_ADMIN.username,
      email: SUPER_ADMIN.email,
      password: hashedPassword,
      role: 'super_admin',
      displayName: SUPER_ADMIN.displayName,
      createdAt: new Date()
    });

    await superAdmin.save();

    console.log('Super Admin created successfully.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Login Credentials:');
    console.log('   Username:', SUPER_ADMIN.username);
    console.log('   Password:', SUPER_ADMIN.password);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('IMPORTANT: Change this password immediately after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding super admin:', error);
    process.exit(1);
  }
}

seedSuperAdmin();