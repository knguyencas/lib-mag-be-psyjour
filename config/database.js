const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://admin:jkjkkmmk2002@cluster0.j0puvpr.mongodb.net/lib", {
      // These options are no longer needed in Mongoose 6+
      // but keeping them won't cause errors
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;