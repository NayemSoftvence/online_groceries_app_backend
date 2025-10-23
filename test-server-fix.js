// Test the exact same import as server.js
console.log('Testing server.js import pattern...\n');

try {
  // This should match exactly what's in your server.js
  const { connectDB } = require('./src/config/database');
  
  console.log('✅ Destructuring import works');
  console.log('connectDB is function:', typeof connectDB === 'function');
  
  // Test calling it
  console.log('Calling connectDB...');
  connectDB().then(() => {
    console.log('✅ connectDB executed successfully');
    process.exit(0);
  }).catch(err => {
    console.log('❌ connectDB failed:', err.message);
    process.exit(1);
  });
  
} catch (error) {
  console.log('❌ Import failed:', error.message);
}