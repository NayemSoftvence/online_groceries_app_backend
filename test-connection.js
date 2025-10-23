require('dotenv').config();

console.log('🧪 Testing database connection...\n');

try {
  const { connectDB } = require('./src/config/database');
  console.log('✅ connectDB is a function:', typeof connectDB === 'function');
  
  connectDB().then(() => {
    console.log('✅ Database connected successfully!');
    process.exit(0);
  });
  
} catch (error) {
  console.log('❌ Error:', error.message);
}