#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const researchService = require('../services/researchService');
const outreachService = require('../services/outreachService');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

async function runDemo() {
  console.log('🎯 Vektara GTM Automation - Full System Demo\n');
  console.log('This demo will show you the complete capabilities of the system:\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vektara-gtm');
    console.log('✅ Connected to database\n');

    // Check if demo mode is enabled
    const isDemoMode = process.argv.includes('--demo-mode');
    if (!isDemoMode) {
      console.log('⚠️  This is a DEMO that will show real system capabilities.');
      console.log('Add --demo-mode flag to run actual operations.\n');
    }

    console.log('📋 Demo Overview:');
    console.log('1. 🔍 Intelligent Firm Research');
    console.log('2. 🤖 AI-Powered Message Generation');
    console.log('3. 📧 Multi-Channel Outreach Automation');
    console.log('4. 📊 Analytics and Performance Tracking\n');

    // Demo 1: Intelligent Firm Research
    console.log('=' .repeat(60));
    console.log('🔍 DEMO 1: INTELLIGENT FIRM RESEARCH');
    console.log('=' .repeat(60));
    
    console.log('Searching for AI-focused VC firms...\n');
    
    const researchCriteria = {
      type: ['vc'],
      focusAreas: ['ai', 'fintech'],
      location: 'San Francisco',
      maxFirms: isDemoMode ? 10 : 5
    };

    if (isDemoMode) {
      const firms = await researchService.researchFirms(researchCriteria);
      console.log(`✅ Found ${firms.length} firms`);
      
      if (firms.length > 0) {
        console.log('\n📊 Sample Firm Data:');
        const sampleFirm = firms[0];
        console.log(`Name: ${sampleFirm.name}`);
        console.log(`Type: ${sampleFirm.type}`);
        console.log(`Score: ${sampleFirm.score?.overall || 'N/A'}/100`);
        console.log(`Contact Form: ${sampleFirm.contactForm?.hasForm ? 'Yes' : 'No'}`);
        console.log(`Focus Areas: ${sampleFirm.focusAreas?.join(', ') || 'N/A'}`);
      }
    } else {
      console.log('🎭 [DEMO MODE] Would search for firms with criteria:');
      console.log(JSON.stringify(researchCriteria, null, 2));
      console.log('📈 Expected results: 5-15 relevant firms with scoring and contact analysis');
    }

    console.log('\n');

    // Demo 2: AI-Powered Message Generation
    console.log('=' .repeat(60));
    console.log('🤖 DEMO 2: AI-POWERED MESSAGE GENERATION');
    console.log('=' .repeat(60));

    console.log('Generating personalized outreach message...\n');

    const demoFirm = {
      name: 'Acme Ventures',
      type: 'vc',
      focusAreas: ['ai', 'enterprise'],
      website: 'https://acmeventures.com',
      location: { city: 'San Francisco', state: 'CA' },
      recentInvestments: [
        { company: 'TechStartup AI', stage: 'Series A', date: new Date() }
      ]
    };

    const demoContact = {
      name: 'John Partner',
      title: 'Managing Partner',
      email: 'john@acmeventures.com',
      isDecisionMaker: true
    };

    const template = `
Hi {contactName},

I hope this message finds you well. I'm reaching out from Vektara Ventures because of {firmName}'s impressive work in {focusArea}.

{personalization}

We're currently {companyStage} and would love to explore potential partnership opportunities. Our {valueProposition} aligns well with your investment thesis.

Would you be open to a brief 15-minute conversation?

Best regards,
{senderName}
    `.trim();

    if (isDemoMode && process.env.OPENAI_API_KEY) {
      try {
        const personalizedMessage = await aiService.generatePersonalizedMessage(
          demoFirm, 
          demoContact, 
          template,
          {
            companyStage: 'Series A stage',
            valueProposition: 'AI-powered GTM automation platform',
            senderName: process.env.SENDER_NAME || 'Demo User'
          }
        );

        console.log('✅ Generated Personalized Message:');
        console.log('-'.repeat(40));
        console.log(personalizedMessage.content);
        console.log('-'.repeat(40));
        console.log(`🎯 Personalization Score: ${(personalizedMessage.confidence * 100).toFixed(1)}%`);
        console.log(`📝 Personalizations Used: ${personalizedMessage.personalizations.length}`);
      } catch (error) {
        console.log('⚠️  AI message generation requires OpenAI API key');
        console.log('🎭 [DEMO MODE] Would generate personalized message with firm-specific details');
      }
    } else {
      console.log('🎭 [DEMO MODE] AI would generate a personalized message like:');
      console.log('-'.repeat(40));
      console.log(`Hi John,

I hope this message finds you well. I'm reaching out from Vektara Ventures because of Acme Ventures' impressive work in AI and enterprise solutions.

I noticed your recent investment in TechStartup AI and your focus on AI-powered enterprise tools aligns perfectly with what we're building.

We're currently at Series A stage and would love to explore potential partnership opportunities. Our AI-powered GTM automation platform aligns well with your investment thesis, particularly your focus on enterprise AI solutions.

Would you be open to a brief 15-minute conversation?

Best regards,
${process.env.SENDER_NAME || 'Demo User'}`);
      console.log('-'.repeat(40));
      console.log('🎯 Personalization Score: 92.5%');
      console.log('📝 Personalizations: Firm name, focus areas, recent investments, decision maker name');
    }

    console.log('\n');

    // Demo 3: Multi-Channel Outreach
    console.log('=' .repeat(60));
    console.log('📧 DEMO 3: MULTI-CHANNEL OUTREACH AUTOMATION');
    console.log('=' .repeat(60));

    console.log('Demonstrating contact form auto-filling...\n');

    if (isDemoMode) {
      console.log('⚠️  Real contact form submission would require --confirm flag');
      console.log('🎭 Showing capabilities in demo mode...\n');
    }

    // Simulate contact form analysis
    console.log('🔍 Contact Form Analysis:');
    console.log('✅ Form detected at: https://acmeventures.com/contact');
    console.log('📋 Fields identified:');
    console.log('  - Name (text, required)');
    console.log('  - Email (email, required)');  
    console.log('  - Company (text, optional)');
    console.log('  - Message (textarea, required)');
    console.log('  - Industry (select, optional)');

    console.log('\n📝 Auto-Fill Mapping:');
    console.log(`  Name → "${process.env.SENDER_NAME || 'Demo User'}"`);
    console.log(`  Email → "${process.env.SENDER_EMAIL || 'demo@vektaraventures.com'}"`);
    console.log(`  Company → "${process.env.COMPANY_NAME || 'Vektara Ventures'}"`);
    console.log('  Message → [AI-generated personalized message]');
    console.log('  Industry → "Technology"');

    console.log('\n📊 Outreach Channel Priority:');
    console.log('1. 📧 Email (if decision maker email available)');
    console.log('2. 📝 Contact Form (if form detected and analyzed)');
    console.log('3. 💼 LinkedIn (if profile links found)');

    console.log('\n');

    // Demo 4: Analytics
    console.log('=' .repeat(60));
    console.log('📊 DEMO 4: ANALYTICS AND PERFORMANCE TRACKING');
    console.log('=' .repeat(60));

    console.log('Sample Analytics Dashboard:\n');

    console.log('📈 Campaign Performance (Last 30 Days):');
    console.log('  Total Outreach: 127');
    console.log('  Emails Sent: 89');
    console.log('  Forms Submitted: 38');  
    console.log('  Responses Received: 19 (15.0%)');
    console.log('  Meetings Booked: 4 (3.1%)');
    console.log('  Avg Response Time: 2.3 days');

    console.log('\n🎯 Firm Type Performance:');
    console.log('  VC Firms: 67 outreach, 12 responses (17.9%)');
    console.log('  PE Firms: 43 outreach, 5 responses (11.6%)');
    console.log('  IB Firms: 17 outreach, 2 responses (11.8%)');

    console.log('\n🏆 Top Performing Messages:');
    console.log('  "AI Partnership Opportunity": 23.1% response rate');
    console.log('  "Series A Growth Discussion": 18.7% response rate');
    console.log('  "Technology Investment Inquiry": 14.2% response rate');

    console.log('\n😊 Response Sentiment Analysis:');
    console.log('  Positive: 12 responses (63.2%)');
    console.log('  Neutral: 5 responses (26.3%)');
    console.log('  Negative: 2 responses (10.5%)');
    console.log('  Avg Sentiment Score: +0.42');

    console.log('\n');

    // Summary and Next Steps
    console.log('=' .repeat(60));
    console.log('🎉 DEMO COMPLETED - SYSTEM CAPABILITIES OVERVIEW');
    console.log('=' .repeat(60));

    console.log('\n✨ What You Just Saw:');
    console.log('✅ Intelligent firm discovery from multiple sources');
    console.log('✅ Contact form detection and analysis');
    console.log('✅ AI-powered personalized message generation');
    console.log('✅ Multi-channel outreach coordination');
    console.log('✅ Comprehensive analytics and performance tracking');

    console.log('\n🚀 Ready to Get Started?');
    console.log('1. Complete setup: npm run setup');
    console.log('2. Add API keys to .env file');
    console.log('3. Research firms: npm run research --type vc --focus ai --limit 20');
    console.log('4. Launch outreach: npm run outreach --template initial_outreach --max-firms 10 --confirm');
    console.log('5. Monitor results: npm run analyze');

    console.log('\n📖 Documentation:');
    console.log('- Setup Guide: ./SETUP_GUIDE.md');
    console.log('- Full Documentation: ./README.md');
    console.log('- Web Dashboard: http://localhost:3000 (when server is running)');

    console.log('\n💡 Pro Tips:');
    console.log('- Start with small test campaigns (5-10 firms)');
    console.log('- Monitor response rates and adjust messaging');
    console.log('- Use analytics to optimize your targeting');
    console.log('- Set up automated daily campaigns for consistent outreach');

    console.log('\n🎯 Expected Results:');
    console.log('- 20-50 relevant firms discovered per research session');
    console.log('- 60-80% contact form detection rate');
    console.log('- 5-15% typical response rate (vs 1-3% for generic outreach)');
    console.log('- 1-3% meeting booking rate');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    logger.error('Demo script failed', error);
  } finally {
    mongoose.disconnect();
  }
}

// Show help
function showHelp() {
  console.log(`
🎯 Vektara GTM Automation Demo

This demo showcases the complete capabilities of the GTM automation system
including firm research, AI-powered messaging, contact form automation, and analytics.

Usage: npm run demo [options]

Options:
  --demo-mode    Run actual operations (otherwise shows simulated results)
  --help, -h     Show this help message

Examples:
  npm run demo                    # Show simulated demo
  npm run demo --demo-mode        # Run actual operations (requires setup)

The demo will show:
1. 🔍 Intelligent firm research and discovery
2. 🤖 AI-powered personalized message generation  
3. 📧 Multi-channel outreach automation
4. 📊 Advanced analytics and performance tracking

Make sure you have completed the setup (npm run setup) and configured
your .env file before running with --demo-mode.
  `);
}

// Handle help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Handle Ctrl+C gracefully
process.on('SIGINT', async () => {
  console.log('\n\nDemo cancelled by user');
  mongoose.disconnect();
  process.exit(0);
});

runDemo();