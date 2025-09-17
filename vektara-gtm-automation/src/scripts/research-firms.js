#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const researchService = require('../services/researchService');
const logger = require('../utils/logger');

async function runResearch() {
  console.log('🔍 Starting Vektara GTM Research\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vektara-gtm');
    console.log('✅ Connected to MongoDB\n');

    // Get command line arguments
    const args = process.argv.slice(2);
    const criteria = {};

    // Parse arguments
    for (let i = 0; i < args.length; i += 2) {
      const key = args[i]?.replace('--', '');
      const value = args[i + 1];
      
      if (key && value) {
        switch (key) {
          case 'type':
            criteria.type = value.split(',');
            break;
          case 'location':
            criteria.location = value;
            break;
          case 'industry':
            criteria.industry = value;
            break;
          case 'focus':
            criteria.focusAreas = value.split(',');
            break;
          case 'limit':
            criteria.maxFirms = parseInt(value);
            break;
          default:
            criteria[key] = value;
        }
      }
    }

    // Set defaults
    criteria.type = criteria.type || ['vc', 'pe'];
    criteria.maxFirms = criteria.maxFirms || 50;

    console.log('Research Criteria:');
    console.log(JSON.stringify(criteria, null, 2));
    console.log('');

    // Start research
    const startTime = Date.now();
    const results = await researchService.researchFirms(criteria);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n🎉 Research completed!');
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📊 Total firms found: ${results.length}`);
    
    if (results.length > 0) {
      const newFirms = results.filter(f => 
        f.metadata.discoveredAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      
      console.log(`🆕 New firms: ${newFirms.length}`);
      console.log(`📈 Average score: ${(results.reduce((sum, f) => sum + f.score.overall, 0) / results.length).toFixed(1)}`);
      
      // Show top 5 firms
      const topFirms = results
        .sort((a, b) => b.score.overall - a.score.overall)
        .slice(0, 5);
      
      console.log('\n🏆 Top 5 firms by score:');
      topFirms.forEach((firm, index) => {
        console.log(`${index + 1}. ${firm.name} (${firm.score.overall}/100) - ${firm.type}`);
      });
    }

    console.log('\n✅ Research data saved to database');

  } catch (error) {
    console.error('❌ Research failed:', error.message);
    logger.error('Research script failed', error);
    process.exit(1);
  } finally {
    await researchService.closeBrowser();
    mongoose.disconnect();
  }
}

// Show help
function showHelp() {
  console.log(`
🔍 Vektara GTM Research Tool

Usage: npm run research [options]

Options:
  --type <types>        Firm types (vc,pe,family_office,corporate_vc)
  --location <location> Geographic location filter
  --industry <industry> Industry focus filter
  --focus <areas>       Focus areas (ai,fintech,healthcare,enterprise,etc.)
  --limit <number>      Maximum number of firms to research (default: 50)

Examples:
  npm run research --type vc,pe --location "San Francisco" --limit 25
  npm run research --focus ai,fintech --type vc
  npm run research --location "New York" --industry fintech

Focus Areas:
  ai, fintech, healthcare, enterprise, consumer, biotech, climate, crypto, other
  `);
}

// Handle help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Handle Ctrl+C gracefully
process.on('SIGINT', async () => {
  console.log('\n\nResearch cancelled by user');
  await researchService.closeBrowser();
  mongoose.disconnect();
  process.exit(0);
});

runResearch();