const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging require issue...\n');

const targetPath = './src/config/database.js';
const absolutePath = path.resolve(targetPath);

console.log('Target path:', targetPath);
console.log('Absolute path:', absolutePath);
console.log('File exists:', fs.existsSync(absolutePath));
console.log('Is file:', fs.existsSync(absolutePath) ? fs.statSync(absolutePath).isFile() : 'N/A');
console.log('File size:', fs.existsSync(absolutePath) ? fs.statSync(absolutePath).size + ' bytes' : 'N/A');

if (fs.existsSync(absolutePath)) {
  console.log('\n📄 File content (first 200 chars):');
  const content = fs.readFileSync(absolutePath, 'utf8');
  console.log(content.substring(0, 200) + '...');
  
  console.log('\n📦 Trying to require...');
  try {
    const module = require(absolutePath);
    console.log('✅ Require successful!');
    console.log('Exports:', Object.keys(module));
  } catch (e) {
    console.log('❌ Require failed:', e.message);
  }
}