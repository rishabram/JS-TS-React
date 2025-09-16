#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const outreachService = require('../services/outreachService');
const logger = require('../utils/logger');

async function runOutreach() {
  console.log('📧 Starting Vektara GTM Outreach Campaign\n');

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
          case 'template':
            criteria.templateType = value;
            break;
          case 'campaign':
            criteria.campaignName = value;
            break;
          case 'type':
            criteria.type = value;
            break;
          case 'focus':
            criteria.focusAreas = value.split(',');
            break;
          case 'location':
            criteria.location = value;
            break;
          case 'min-score':
            criteria.minScore = parseInt(value);
            break;
          case 'max-firms':
            criteria.maxFirms = parseInt(value);
            break;
          case 'stage':
            criteria.companyStage = value;
            break;
          case 'value-prop':
            criteria.valueProposition = value;
            break;
          default:
            criteria[key] = value;
        }
      }
    }

    // Set defaults
    criteria.templateType = criteria.templateType || 'initial_outreach';
    criteria.campaignName = criteria.campaignName || 'Manual Campaign';
    criteria.minScore = criteria.minScore || 60;
    criteria.maxFirms = criteria.maxFirms || 20;
    criteria.companyStage = criteria.companyStage || 'growth stage';
    criteria.valueProposition = criteria.valueProposition || 'AI-powered solutions that drive efficiency and growth';

    console.log('Campaign Criteria:');
    console.log(JSON.stringify(criteria, null, 2));
    console.log('');

    // Confirm before sending
    if (!process.argv.includes('--confirm')) {
      console.log('⚠️  This will send real outreach messages!');
      console.log('Add --confirm flag to proceed with the campaign.');
      process.exit(0);
    }

    // Start outreach campaign
    console.log('🚀 Starting outreach campaign...');
    const startTime = Date.now();
    const results = await outreachService.runOutreachCampaign(criteria);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n📊 Campaign Results:');
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📧 Attempted: ${results.attempted}`);
    console.log(`✅ Successful: ${results.successful}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`⏭️  Skipped: ${results.skipped}`);
    
    if (results.successful > 0) {
      const successRate = ((results.successful / results.attempted) * 100).toFixed(1);
      console.log(`📈 Success Rate: ${successRate}%`);
    }

    // Show detailed results
    if (results.details.length > 0) {
      console.log('\n📋 Detailed Results:');
      results.details.forEach((detail, index) => {
        const status = detail.success ? '✅' : (detail.skipped ? '⏭️' : '❌');
        const reason = detail.reason ? ` (${detail.reason})` : '';
        console.log(`${index + 1}. ${status} ${detail.firmName}${reason}`);
      });
    }

    console.log('\n✅ Campaign completed successfully!');

  } catch (error) {
    console.error('❌ Outreach campaign failed:', error.message);
    logger.error('Outreach script failed', error);
    process.exit(1);
  } finally {
    await outreachService.cleanup();
    mongoose.disconnect();
  }
}

// Show help
function showHelp() {
  console.log(`
📧 Vektara GTM Outreach Tool

Usage: npm run outreach [options] --confirm

Options:
  --template <type>     Template type (initial_outreach, follow_up, meeting_request)
  --campaign <name>     Campaign name for tracking
  --type <type>         Firm type filter (vc, pe, family_office, corporate_vc)
  --focus <areas>       Focus areas filter (ai,fintech,healthcare,etc.)
  --location <location> Geographic location filter
  --min-score <number>  Minimum firm score (default: 60)
  --max-firms <number>  Maximum firms to contact (default: 20)
  --stage <stage>       Company stage description
  --value-prop <text>   Value proposition text
  --confirm             Required flag to send real messages

Examples:
  npm run outreach --template initial_outreach --focus ai,fintech --max-firms 10 --confirm
  npm run outreach --campaign "Q1 Outreach" --type vc --location "Bay Area" --confirm
  npm run outreach --min-score 80 --value-prop "Revolutionary AI platform" --confirm

Templates:
  initial_outreach - First contact message
  follow_up        - Follow-up to previous outreach
  meeting_request  - Direct meeting request

⚠️  Important: This tool sends real outreach messages. Always use --confirm flag.
  `);
}

// Handle help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Handle Ctrl+C gracefully
process.on('SIGINT', async () => {
  console.log('\n\nOutreach cancelled by user');
  await outreachService.cleanup();
  mongoose.disconnect();
  process.exit(0);
});

runOutreach();