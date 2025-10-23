const { Sequelize } = require('sequelize');
const path = require('path');

// For development - SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', '..', 'database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite Database connected successfully');

    // Sync all models
    await sequelize.sync({ 
      force: false, // Set to true to drop and recreate tables (development only)
      alter: true   // Auto-update tables to match models
    });
    console.log('Database synchronized');
    
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDB, sequelize };