const { Sequelize } = require('sequelize');
const path = require('path');

// SQLite configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', '..', 'database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite Database connected successfully');

    // Sync all models
    await sequelize.sync({ 
      force: false, // Don't drop tables
      alter: true   // Update tables to match models
    });
    console.log('✅ Database synchronized');
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDB, sequelize };