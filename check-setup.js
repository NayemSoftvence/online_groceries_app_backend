require('dotenv').config();

console.log('🔍 Checking project setup...\n');

const filesToCheck = [
  'src/config/database.js',
  'src/middleware/authMiddleware.js', 
  'src/utils/auth.js',
  'src/features/auth/auth.middleware.js'
];

filesToCheck.forEach(file => {
  try {
    require(`./${file}`);
    console.log(`✅ ${file} - EXISTS`);
  } catch (e) {
    console.log(`❌ ${file} - MISSING: ${e.message}`);
  }
});

console.log('\n📦 Checking environment variables...');
console.log('PORT:', process.env.PORT || '3000 (default)');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development (default)');