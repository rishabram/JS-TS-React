const express = require('express');
const router = express.Router();
const Firm = require('../models/Firm');
const Outreach = require('../models/Outreach');
const logger = require('../utils/logger');

// Get comprehensive analytics dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    // Parallel queries for dashboard metrics
    const [
      firmStats,
      outreachStats,
      conversionFunnel,
      topPerformingFirms,
      recentActivity,
      responseAnalysis
    ] = await Promise.all([
      getFirmStats(startDate),
      getOutreachStats(startDate),
      getConversionFunnel(startDate),
      getTopPerformingFirms(startDate),
      getRecentActivity(),
      getResponseAnalysis(startDate)
    ]);

    res.json({
      period: `${period} days`,
      firms: firmStats,
      outreach: outreachStats,
      conversion: conversionFunnel,
      topFirms: topPerformingFirms,
      activity: recentActivity,
      responses: responseAnalysis,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Dashboard analytics failed', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get conversion funnel metrics
router.get('/funnel', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const funnel = await getDetailedConversionFunnel(startDate);

    res.json({
      period: `${period} days`,
      funnel,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Funnel analytics failed', error);
    res.status(500).json({ error: 'Failed to fetch funnel data' });
  }
});

// Get performance trends over time
router.get('/trends', async (req, res) => {
  try {
    const { period = '30', granularity = 'daily' } = req.query;
    const days = parseInt(period);
    
    let groupFormat;
    switch (granularity) {
      case 'hourly':
        groupFormat = '%Y-%m-%d-%H';
        break;
      case 'weekly':
        groupFormat = '%Y-%U';
        break;
      case 'monthly':
        groupFormat = '%Y-%m';
        break;
      default:
        groupFormat = '%Y-%m-%d';
    }

    const trends = await Outreach.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: groupFormat, date: '$createdAt' } },
            type: '$campaign.type'
          },
          count: { $sum: 1 },
          responses: {
            $sum: {
              $cond: ['$response.hasResponse', 1, 0]
            }
          },
          meetings: {
            $sum: {
              $cond: [{ $eq: ['$results.conversion', 'meeting_booked'] }, 1, 0]
            }
          }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          total: { $sum: '$count' },
          responses: { $sum: '$responses' },
          meetings: { $sum: '$meetings' },
          byType: {
            $push: {
              type: '$_id.type',
              count: '$count'
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      period: `${period} days`,
      granularity,
      trends,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Trends analytics failed', error);
    res.status(500).json({ error: 'Failed to fetch trends data' });
  }
});

// Get firm performance analysis
router.get('/firms/performance', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const firmPerformance = await Outreach.aggregate([
      {
        $group: {
          _id: '$firmId',
          totalOutreach: { $sum: 1 },
          responses: {
            $sum: {
              $cond: ['$response.hasResponse', 1, 0]
            }
          },
          meetings: {
            $sum: {
              $cond: [{ $eq: ['$results.conversion', 'meeting_booked'] }, 1, 0]
            }
          },
          avgSentiment: {
            $avg: '$response.sentiment.score'
          },
          lastContact: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'firms',
          localField: '_id',
          foreignField: '_id',
          as: 'firm'
        }
      },
      {
        $unwind: '$firm'
      },
      {
        $project: {
          firmName: '$firm.name',
          firmType: '$firm.type',
          firmScore: '$firm.score.overall',
          totalOutreach: 1,
          responses: 1,
          meetings: 1,
          responseRate: {
            $multiply: [
              { $divide: ['$responses', '$totalOutreach'] },
              100
            ]
          },
          meetingRate: {
            $multiply: [
              { $divide: ['$meetings', '$totalOutreach'] },
              100
            ]
          },
          avgSentiment: { $round: ['$avgSentiment', 2] },
          lastContact: 1
        }
      },
      {
        $sort: { responseRate: -1, meetingRate: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json({
      firms: firmPerformance,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Firm performance analytics failed', error);
    res.status(500).json({ error: 'Failed to fetch firm performance data' });
  }
});

// Helper functions
async function getFirmStats(startDate) {
  const [total, recent, byType, avgScore] = await Promise.all([
    Firm.countDocuments(),
    Firm.countDocuments({ 'metadata.discoveredAt': { $gte: startDate } }),
    Firm.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgScore: { $avg: '$score.overall' }
        }
      }
    ]),
    Firm.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$score.overall' }
        }
      }
    ])
  ]);

  return {
    total,
    recent,
    byType,
    avgScore: avgScore[0]?.avgScore || 0
  };
}

async function getOutreachStats(startDate) {
  const stats = await Outreach.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        responses: {
          $sum: {
            $cond: ['$response.hasResponse', 1, 0]
          }
        },
        meetings: {
          $sum: {
            $cond: [{ $eq: ['$results.conversion', 'meeting_booked'] }, 1, 0]
          }
        },
        byStatus: {
          $push: '$status'
        },
        byType: {
          $push: '$campaign.type'
        }
      }
    }
  ]);

  const result = stats[0] || { total: 0, responses: 0, meetings: 0, byStatus: [], byType: [] };
  
  result.responseRate = result.total > 0 ? ((result.responses / result.total) * 100).toFixed(1) : '0.0';
  result.meetingRate = result.total > 0 ? ((result.meetings / result.total) * 100).toFixed(1) : '0.0';

  return result;
}

async function getConversionFunnel(startDate) {
  const funnel = await Outreach.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        initiated: { $sum: 1 },
        sent: {
          $sum: {
            $cond: [{ $in: ['$status', ['sent', 'delivered', 'opened', 'clicked', 'replied']] }, 1, 0]
          }
        },
        delivered: {
          $sum: {
            $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0]
          }
        },
        opened: {
          $sum: {
            $cond: [{ $eq: ['$status', 'opened'] }, 1, 0]
          }
        },
        responded: {
          $sum: {
            $cond: ['$response.hasResponse', 1, 0]
          }
        },
        meetings: {
          $sum: {
            $cond: [{ $eq: ['$results.conversion', 'meeting_booked'] }, 1, 0]
          }
        }
      }
    }
  ]);

  return funnel[0] || {
    initiated: 0, sent: 0, delivered: 0, opened: 0, responded: 0, meetings: 0
  };
}

async function getTopPerformingFirms(startDate) {
  return await Outreach.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        'response.hasResponse': true
      }
    },
    {
      $group: {
        _id: '$firmId',
        responseCount: { $sum: 1 },
        avgSentiment: { $avg: '$response.sentiment.score' },
        meetings: {
          $sum: {
            $cond: [{ $eq: ['$results.conversion', 'meeting_booked'] }, 1, 0]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'firms',
        localField: '_id',
        foreignField: '_id',
        as: 'firm'
      }
    },
    {
      $unwind: '$firm'
    },
    {
      $project: {
        firmName: '$firm.name',
        firmType: '$firm.type',
        responseCount: 1,
        meetings: 1,
        avgSentiment: { $round: ['$avgSentiment', 2] }
      }
    },
    {
      $sort: { responseCount: -1, avgSentiment: -1 }
    },
    {
      $limit: 10
    }
  ]);
}

async function getRecentActivity() {
  return await Outreach.find()
    .populate('firmId', 'name type')
    .sort({ createdAt: -1 })
    .limit(20)
    .select('firmId campaign.type status response.hasResponse results.conversion createdAt');
}

async function getResponseAnalysis(startDate) {
  const analysis = await Outreach.aggregate([
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
        avgSentiment: { $avg: '$response.sentiment.score' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  return analysis;
}

async function getDetailedConversionFunnel(startDate) {
  // Implementation for detailed funnel with drop-off analysis
  return await getConversionFunnel(startDate);
}

module.exports = router;