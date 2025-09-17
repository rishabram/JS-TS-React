#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const Firm = require('../models/Firm');
const Outreach = require('../models/Outreach');
const logger = require('../utils/logger');

async function analyzeResults() {
  console.log('📊 Vektara GTM Analytics Report\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vektara-gtm');
    console.log('✅ Connected to MongoDB\n');

    const period = process.argv.includes('--period') 
      ? parseInt(process.argv[process.argv.indexOf('--period') + 1]) 
      : 30;

    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);

    console.log(`📈 Analytics for the last ${period} days (since ${startDate.toDateString()})\n`);

    // Firm Statistics
    const firmStats = await analyzeFirmStats(startDate);
    console.log('🏢 FIRM STATISTICS');
    console.log('='.repeat(50));
    console.log(`Total firms in database: ${firmStats.total}`);
    console.log(`New firms discovered: ${firmStats.newFirms}`);
    console.log(`Average firm score: ${firmStats.avgScore.toFixed(1)}/100`);
    console.log(`VC firms: ${firmStats.vcCount} | PE firms: ${firmStats.peCount}`);
    console.log(`Firms with contact forms: ${firmStats.withContactForms}`);
    console.log(`Firms with verified contacts: ${firmStats.withContacts}\n`);

    // Outreach Statistics
    const outreachStats = await analyzeOutreachStats(startDate);
    console.log('📧 OUTREACH STATISTICS');
    console.log('='.repeat(50));
    console.log(`Total outreach attempts: ${outreachStats.total}`);
    console.log(`Emails sent: ${outreachStats.emails}`);
    console.log(`Contact forms filled: ${outreachStats.forms}`);
    console.log(`Responses received: ${outreachStats.responses} (${outreachStats.responseRate}%)`);
    console.log(`Meetings booked: ${outreachStats.meetings} (${outreachStats.meetingRate}%)`);
    console.log(`Average response time: ${outreachStats.avgResponseTime} hours\n`);

    // Performance by Firm Type
    const performanceByType = await analyzePerformanceByType(startDate);
    console.log('🎯 PERFORMANCE BY FIRM TYPE');
    console.log('='.repeat(50));
    performanceByType.forEach(stat => {
      console.log(`${stat._id.toUpperCase()}:`);
      console.log(`  Outreach: ${stat.outreach} | Responses: ${stat.responses} (${stat.responseRate}%)`);
      console.log(`  Avg Score: ${stat.avgScore.toFixed(1)} | Meetings: ${stat.meetings}`);
    });
    console.log('');

    // Top Performing Campaigns
    const topCampaigns = await analyzeTopCampaigns(startDate);
    console.log('🏆 TOP PERFORMING CAMPAIGNS');
    console.log('='.repeat(50));
    topCampaigns.slice(0, 5).forEach((campaign, index) => {
      console.log(`${index + 1}. ${campaign._id}`);
      console.log(`   ${campaign.total} outreach | ${campaign.responses} responses (${campaign.responseRate}%)`);
    });
    console.log('');

    // Response Sentiment Analysis
    const sentimentAnalysis = await analyzeSentiment(startDate);
    console.log('😊 RESPONSE SENTIMENT ANALYSIS');
    console.log('='.repeat(50));
    console.log(`Positive responses: ${sentimentAnalysis.positive} (${sentimentAnalysis.positiveRate}%)`);
    console.log(`Neutral responses: ${sentimentAnalysis.neutral} (${sentimentAnalysis.neutralRate}%)`);
    console.log(`Negative responses: ${sentimentAnalysis.negative} (${sentimentAnalysis.negativeRate}%)`);
    console.log(`Average sentiment score: ${sentimentAnalysis.avgScore.toFixed(2)} (-1 to 1 scale)\n`);

    // Recent Activity Timeline
    const recentActivity = await analyzeRecentActivity();
    console.log('🕒 RECENT ACTIVITY (Last 7 days)');
    console.log('='.repeat(50));
    recentActivity.forEach(day => {
      console.log(`${day._id}: ${day.outreach} outreach | ${day.responses} responses`);
    });
    console.log('');

    // Recommendations
    generateRecommendations(firmStats, outreachStats, performanceByType, sentimentAnalysis);

  } catch (error) {
    console.error('❌ Analytics failed:', error.message);
    logger.error('Analytics script failed', error);
    process.exit(1);
  } finally {
    mongoose.disconnect();
  }
}

async function analyzeFirmStats(startDate) {
  const [total, newFirms, avgScore, typeCounts, formCounts, contactCounts] = await Promise.all([
    Firm.countDocuments(),
    Firm.countDocuments({ 'metadata.discoveredAt': { $gte: startDate } }),
    Firm.aggregate([{ $group: { _id: null, avg: { $avg: '$score.overall' } } }]),
    Firm.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
    Firm.countDocuments({ 'contactForm.hasForm': true }),
    Firm.countDocuments({ 'contacts.0': { $exists: true } })
  ]);

  const typeMap = {};
  typeCounts.forEach(t => typeMap[t._id] = t.count);

  return {
    total,
    newFirms,
    avgScore: avgScore[0]?.avg || 0,
    vcCount: typeMap.vc || 0,
    peCount: typeMap.pe || 0,
    withContactForms: formCounts,
    withContacts: contactCounts
  };
}

async function analyzeOutreachStats(startDate) {
  const stats = await Outreach.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        emails: { $sum: { $cond: [{ $eq: ['$campaign.type', 'email'] }, 1, 0] } },
        forms: { $sum: { $cond: [{ $eq: ['$campaign.type', 'contact_form'] }, 1, 0] } },
        responses: { $sum: { $cond: ['$response.hasResponse', 1, 0] } },
        meetings: { $sum: { $cond: [{ $eq: ['$results.conversion', 'meeting_booked'] }, 1, 0] } },
        responseTime: { 
          $avg: { 
            $divide: [
              { $subtract: ['$scheduling.repliedAt', '$scheduling.sentAt'] },
              1000 * 60 * 60
            ]
          }
        }
      }
    }
  ]);

  const result = stats[0] || { total: 0, emails: 0, forms: 0, responses: 0, meetings: 0, responseTime: 0 };
  result.responseRate = result.total > 0 ? ((result.responses / result.total) * 100).toFixed(1) : '0.0';
  result.meetingRate = result.total > 0 ? ((result.meetings / result.total) * 100).toFixed(1) : '0.0';
  result.avgResponseTime = (result.responseTime || 0).toFixed(1);

  return result;
}

async function analyzePerformanceByType(startDate) {
  return await Outreach.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $lookup: { from: 'firms', localField: 'firmId', foreignField: '_id', as: 'firm' } },
    { $unwind: '$firm' },
    {
      $group: {
        _id: '$firm.type',
        outreach: { $sum: 1 },
        responses: { $sum: { $cond: ['$response.hasResponse', 1, 0] } },
        meetings: { $sum: { $cond: [{ $eq: ['$results.conversion', 'meeting_booked'] }, 1, 0] } },
        avgScore: { $avg: '$firm.score.overall' }
      }
    },
    {
      $addFields: {
        responseRate: { $multiply: [{ $divide: ['$responses', '$outreach'] }, 100] }
      }
    },
    { $sort: { responseRate: -1 } }
  ]);
}

async function analyzeTopCampaigns(startDate) {
  return await Outreach.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$campaign.name',
        total: { $sum: 1 },
        responses: { $sum: { $cond: ['$response.hasResponse', 1, 0] } },
        meetings: { $sum: { $cond: [{ $eq: ['$results.conversion', 'meeting_booked'] }, 1, 0] } }
      }
    },
    {
      $addFields: {
        responseRate: { $multiply: [{ $divide: ['$responses', '$total'] }, 100] }
      }
    },
    { $sort: { responseRate: -1, total: -1 } }
  ]);
}

async function analyzeSentiment(startDate) {
  const sentiments = await Outreach.aggregate([
    { 
      $match: { 
        createdAt: { $gte: startDate },
        'response.hasResponse': true 
      } 
    },
    {
      $group: {
        _id: '$response.responseType',
        count: { $sum: 1 },
        avgScore: { $avg: '$response.sentiment.score' }
      }
    }
  ]);

  const total = sentiments.reduce((sum, s) => sum + s.count, 0);
  const result = {
    positive: 0,
    neutral: 0,
    negative: 0,
    avgScore: 0
  };

  sentiments.forEach(s => {
    result[s._id] = s.count;
    result.avgScore += s.avgScore * s.count;
  });

  if (total > 0) {
    result.avgScore /= total;
    result.positiveRate = ((result.positive / total) * 100).toFixed(1);
    result.neutralRate = ((result.neutral / total) * 100).toFixed(1);
    result.negativeRate = ((result.negative / total) * 100).toFixed(1);
  } else {
    result.positiveRate = result.neutralRate = result.negativeRate = '0.0';
  }

  return result;
}

async function analyzeRecentActivity() {
  return await Outreach.aggregate([
    { 
      $match: { 
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      } 
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        outreach: { $sum: 1 },
        responses: { $sum: { $cond: ['$response.hasResponse', 1, 0] } }
      }
    },
    { $sort: { _id: -1 } }
  ]);
}

function generateRecommendations(firmStats, outreachStats, performanceByType, sentimentAnalysis) {
  console.log('💡 RECOMMENDATIONS');
  console.log('='.repeat(50));

  // Firm quality recommendations
  if (firmStats.avgScore < 70) {
    console.log('🎯 Consider improving firm targeting criteria - average score is below 70');
  }

  // Outreach volume recommendations
  if (outreachStats.total < 50) {
    console.log('📈 Consider increasing outreach volume for better results');
  }

  // Response rate recommendations
  const responseRate = parseFloat(outreachStats.responseRate);
  if (responseRate < 5) {
    console.log('📧 Response rate is low - consider improving message personalization');
  } else if (responseRate > 15) {
    console.log('🎉 Excellent response rate! Scale up successful campaigns');
  }

  // Sentiment recommendations
  if (sentimentAnalysis.avgScore < 0) {
    console.log('😟 Negative average sentiment - review and improve messaging');
  } else if (sentimentAnalysis.avgScore > 0.3) {
    console.log('😊 Positive sentiment! Current messaging is working well');
  }

  // Performance by type recommendations
  const bestType = performanceByType[0];
  if (bestType && bestType.responseRate > 10) {
    console.log(`🏆 ${bestType._id.toUpperCase()} firms are performing best - focus more effort here`);
  }

  console.log('');
}

// Show help
function showHelp() {
  console.log(`
📊 Vektara GTM Analytics Tool

Usage: npm run analyze [options]

Options:
  --period <days>   Analysis period in days (default: 30)

Examples:
  npm run analyze
  npm run analyze --period 7
  npm run analyze --period 90
  `);
}

// Handle help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

analyzeResults();