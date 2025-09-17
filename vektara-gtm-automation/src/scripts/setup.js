#!/usr/bin/env node

const mongoose = require('mongoose');
const readline = require('readline');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const logger = require('../utils/logger');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('🚀 Vektara GTM Automation Setup\n');

  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vektara-gtm');
    console.log('✅ Connected to MongoDB\n');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists. Setup already completed.\n');
      
      const recreate = await question('Do you want to create a new admin user? (y/N): ');
      if (recreate.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        process.exit(0);
      }
    }

    console.log('Creating admin user...');
    
    // Get user details
    const username = await question('Enter admin username: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    const confirmPassword = await question('Confirm password: ');

    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match!');
      process.exit(1);
    }

    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters long!');
      process.exit(1);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const admin = new User({
      username,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    
    console.log('✅ Admin user created successfully!\n');

    // Setup environment file if it doesn't exist
    const fs = require('fs');
    const envPath = path.join(__dirname, '../../.env');
    
    if (!fs.existsSync(envPath)) {
      console.log('Creating .env file...');
      
      const envContent = `# Vektara GTM Automation Configuration
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/vektara-gtm

# OpenAI API (Required for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Email Configuration (Required for email outreach)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Puppeteer Configuration
PUPPETEER_HEADLESS=true
PUPPETEER_TIMEOUT=30000

# Rate Limiting
RATE_LIMIT_REQUESTS=50
RATE_LIMIT_WINDOW=3600000

# JWT Secret
JWT_SECRET=${require('crypto').randomBytes(64).toString('hex')}

# Setup Key (for initial user creation)
SETUP_KEY=${require('crypto').randomBytes(32).toString('hex')}

# Company Information
COMPANY_NAME=Vektara Ventures
COMPANY_WEBSITE=https://vektaraventures.com
SENDER_NAME=${username}
SENDER_EMAIL=${email}
SENDER_PHONE=+1-555-123-4567
SENDER_LINKEDIN=https://linkedin.com/in/yourprofile

# Target Settings
MAX_OUTREACH_PER_DAY=50
MIN_DELAY_BETWEEN_REQUESTS=5000
`;

      fs.writeFileSync(envPath, envContent);
      console.log('✅ .env file created\n');
    }

    console.log('🎉 Setup completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Update the .env file with your API keys and email configuration');
    console.log('2. Run "npm start" to start the server');
    console.log('3. Visit http://localhost:3000 to access the dashboard');
    console.log('4. Login with the credentials you just created\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    logger.error('Setup failed', error);
    process.exit(1);
  } finally {
    rl.close();
    mongoose.disconnect();
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\nSetup cancelled by user');
  rl.close();
  mongoose.disconnect();
  process.exit(0);
});

setup();