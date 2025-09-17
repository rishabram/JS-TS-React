#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

console.log('🌐 Installing Chrome browser for Puppeteer...\n');

async function installBrowser() {
  try {
    // Check if Chrome is already installed
    try {
      await execAsync('google-chrome --version');
      console.log('✅ Chrome browser is already installed');
      return;
    } catch (error) {
      console.log('📥 Chrome not found, installing...');
    }

    // Install Chrome on Ubuntu/Debian systems
    const installCommands = [
      'sudo apt-get update',
      'sudo apt-get install -y wget gnupg',
      'wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -',
      'sudo sh -c \'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list\'',
      'sudo apt-get update',
      'sudo apt-get install -y google-chrome-stable'
    ];

    console.log('Installing Chrome browser...');
    for (const command of installCommands) {
      console.log(`Running: ${command}`);
      try {
        const { stdout, stderr } = await execAsync(command);
        if (stdout) console.log(stdout);
        if (stderr) console.log(stderr);
      } catch (error) {
        console.log(`⚠️  Command failed (continuing): ${error.message}`);
      }
    }

    // Verify installation
    try {
      const { stdout } = await execAsync('google-chrome --version');
      console.log(`✅ Chrome installed successfully: ${stdout.trim()}`);
    } catch (error) {
      console.log('⚠️  Chrome installation may have failed. Will try alternative method.');
      
      // Alternative: Try to download and install manually
      console.log('Trying alternative installation method...');
      await installChromeManually();
    }

    // Install additional dependencies
    const deps = [
      'libxss1',
      'libappindicator1',
      'libindicator7',
      'fonts-liberation',
      'libasound2',
      'libatk-bridge2.0-0',
      'libdrm2',
      'libgtk-3-0',
      'libgtk-4-1'
    ];

    console.log('Installing additional dependencies...');
    try {
      await execAsync(`sudo apt-get install -y ${deps.join(' ')}`);
      console.log('✅ Dependencies installed');
    } catch (error) {
      console.log('⚠️  Some dependencies may not have installed, but continuing...');
    }

    console.log('\n🎉 Browser installation completed!');
    console.log('You can now run the GTM automation system.');

  } catch (error) {
    console.error('❌ Browser installation failed:', error.message);
    console.log('\n📝 Manual installation instructions:');
    console.log('1. Install Chrome: sudo apt-get install google-chrome-stable');
    console.log('2. Or download from: https://www.google.com/chrome/');
    console.log('3. Make sure Chrome is in your PATH');
    process.exit(1);
  }
}

async function installChromeManually() {
  const downloadUrl = 'https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb';
  const filename = '/tmp/google-chrome-stable_current_amd64.deb';
  
  return new Promise((resolve, reject) => {
    console.log('Downloading Chrome package...');
    const file = fs.createWriteStream(filename);
    
    https.get(downloadUrl, (response) => {
      response.pipe(file);
      
      file.on('finish', async () => {
        file.close();
        console.log('Download completed, installing...');
        
        try {
          await execAsync(`sudo dpkg -i ${filename}`);
          await execAsync('sudo apt-get install -f'); // Fix dependencies
          console.log('✅ Chrome installed manually');
          resolve();
        } catch (error) {
          console.log('⚠️  Manual installation also failed');
          reject(error);
        }
      });
    }).on('error', (err) => {
      fs.unlink(filename, () => {}); // Delete the file async
      reject(err);
    });
  });
}

// Create browser configuration
async function createBrowserConfig() {
  const configDir = path.join(__dirname, '../config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const browserConfig = {
    executablePath: '/usr/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ],
    headless: 'new'
  };

  fs.writeFileSync(
    path.join(configDir, 'browser.json'),
    JSON.stringify(browserConfig, null, 2)
  );

  console.log('✅ Browser configuration created');
}

// Main execution
async function main() {
  await installBrowser();
  await createBrowserConfig();
  
  console.log('\n🚀 Next steps:');
  console.log('1. Run "npm run setup" to configure your account');
  console.log('2. Update .env file with your API keys');
  console.log('3. Run "npm run validate" to test the system');
  console.log('4. Start with "npm run research" to find firms');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { installBrowser, createBrowserConfig };