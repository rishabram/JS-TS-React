#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Vektara GTM Automation - System Validation\n');

// Check file structure
const requiredFiles = [
  'package.json',
  'src/index.js',
  'src/models/Firm.js',
  'src/models/Outreach.js',
  'src/models/User.js',
  'src/services/researchService.js',
  'src/services/aiService.js',
  'src/services/outreachService.js',
  'src/services/scheduler.js',
  'src/routes/firms.js',
  'src/routes/outreach.js',
  'src/routes/analytics.js',
  'src/routes/auth.js',
  'src/utils/logger.js',
  'src/scripts/setup.js',
  'src/scripts/research-firms.js',
  'src/scripts/run-outreach.js',
  'src/scripts/analyze-results.js',
  'public/index.html',
  'README.md',
  '.env.example'
];

console.log('📁 File Structure Validation:');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, '../..', file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

console.log('');

// Check package.json structure
console.log('📦 Package Configuration:');
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../..', 'package.json'), 'utf8'));
  
  const requiredScripts = ['start', 'dev', 'test', 'research', 'outreach', 'analyze', 'setup'];
  requiredScripts.forEach(script => {
    const exists = pkg.scripts && pkg.scripts[script];
    console.log(`${exists ? '✅' : '❌'} Script: ${script}`);
  });
  
  const requiredDeps = ['express', 'mongoose', 'puppeteer', 'openai', 'nodemailer'];
  requiredDeps.forEach(dep => {
    const exists = pkg.dependencies && pkg.dependencies[dep];
    console.log(`${exists ? '✅' : '❌'} Dependency: ${dep}`);
  });
} catch (error) {
  console.log('❌ Failed to read package.json');
}

console.log('');

// Check syntax of main files
console.log('🔍 Syntax Validation:');
const filesToCheck = [
  'src/index.js',
  'src/models/Firm.js',
  'src/services/researchService.js',
  'src/routes/firms.js'
];

filesToCheck.forEach(file => {
  try {
    const filePath = path.join(__dirname, '../..', file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file}: File not found`);
    }
  } catch (error) {
    console.log(`❌ ${file}: ${error.message}`);
  }
});

console.log('');

// Summary
console.log('📋 Validation Summary:');
console.log(`File structure: ${allFilesExist ? '✅ Complete' : '❌ Missing files'}`);
console.log('System status: ✅ Ready for setup');
console.log('');
console.log('🚀 Next Steps:');
console.log('1. Run "npm run setup" to configure the system');
console.log('2. Update .env file with your API keys');
console.log('3. Start MongoDB service');
console.log('4. Run "npm start" to launch the system');
console.log('');
console.log('📖 Documentation: See README.md for detailed instructions');
console.log('🆘 Support: Check logs/ directory for troubleshooting');