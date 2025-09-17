const express = require('express');
const router = express.Router();
const Outreach = require('../models/Outreach');
const outreachService = require('../services/outreachService');
const { schedulerService } = require('../services/scheduler');
const logger = require('../utils/logger');

// Get all outreach records with filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      campaignType,
      firmId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (campaignType) query['campaign.type'] = campaignType;
    if (firmId) query.firmId = firmId;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Execute query with population
    const outreach = await Outreach.find(query)
      .populate('firmId', 'name type website location score')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Outreach.countDocuments(query);

    res.json({
      outreach,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    logger.error('Failed to fetch outreach records', error);
    res.status(500).json({ error: 'Failed to fetch outreach records' });
  }
});

// Get single outreach record
router.get('/:id', async (req, res) => {
  try {
    const outreach = await Outreach.findById(req.params.id)
      .populate('firmId');
    
    if (!outreach) {
      return res.status(404).json({ error: 'Outreach record not found' });
    }

    res.json(outreach);
  } catch (error) {
    logger.error('Failed to fetch outreach record', error);
    res.status(500).json({ error: 'Failed to fetch outreach record' });
  }
});

// Start outreach campaign
router.post('/campaign', async (req, res) => {
  try {
    const criteria = {
      templateType: 'initial_outreach',
      campaignName: 'Manual Campaign',
      minScore: 60,
      maxFirms: 20,
      ...req.body
    };

    // Start campaign
    const results = await outreachService.runOutreachCampaign(criteria);
    
    res.json({
      message: 'Campaign completed',
      results
    });

  } catch (error) {
    logger.error('Campaign failed', error);
    res.status(500).json({ 
      error: 'Campaign failed', 
      message: error.message 
    });
  }
});

// Send individual outreach
router.post('/send', async (req, res) => {
  try {
    const { firmId, method, templateType = 'initial_outreach' } = req.body;

    if (!firmId || !method) {
      return res.status(400).json({ 
        error: 'firmId and method are required' 
      });
    }

    const Firm = require('../models/Firm');
    const firm = await Firm.findById(firmId);
    
    if (!firm) {
      return res.status(404).json({ error: 'Firm not found' });
    }

    // Determine method configuration
    let methodConfig;
    switch (method) {
      case 'email':
        const emailContact = firm.contacts?.find(c => c.email);
        if (!emailContact) {
          return res.status(400).json({ 
            error: 'No email contact found for firm' 
          });
        }
        methodConfig = { type: 'email', contact: emailContact };
        break;
        
      case 'contact_form':
        if (!firm.contactForm?.hasForm) {
          return res.status(400).json({ 
            error: 'No contact form found for firm' 
          });
        }
        methodConfig = { type: 'contact_form', form: firm.contactForm };
        break;
        
      default:
        return res.status(400).json({ 
          error: 'Unsupported outreach method' 
        });
    }

    const result = await outreachService.executeOutreach(
      firm, 
      methodConfig, 
      { templateType, campaignName: 'Manual Outreach' }
    );

    res.json({
      message: 'Outreach sent successfully',
      result
    });

  } catch (error) {
    logger.error('Individual outreach failed', error);
    res.status(500).json({ 
      error: 'Outreach failed', 
      message: error.message 
    });
  }
});

// Update outreach status (for manual updates)
router.put('/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const outreach = await Outreach.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(notes && { 'results.notes': notes }),
        ...(status === 'replied' && { 
          'response.hasResponse': true,
          'scheduling.repliedAt': new Date()
        })
      },
      { new: true }
    );

    if (!outreach) {
      return res.status(404).json({ error: 'Outreach record not found' });
    }

    logger.outreach(`Outreach status updated: ${outreach._id} -> ${status}`);
    res.json(outreach);

  } catch (error) {
    logger.error('Failed to update outreach status', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Record response to outreach
router.post('/:id/response', async (req, res) => {
  try {
    const { responseText, responseType, sentiment } = req.body;
    
    const outreach = await Outreach.findById(req.params.id);
    
    if (!outreach) {
      return res.status(404).json({ error: 'Outreach record not found' });
    }

    // Update response information
    outreach.response = {
      hasResponse: true,
      responseType: responseType || 'neutral',
      content: responseText,
      sentiment: sentiment || { score: 0, label: 'neutral' }
    };
    
    outreach.status = 'replied';
    outreach.scheduling.repliedAt = new Date();

    await outreach.save();

    logger.outreach(`Response recorded for outreach: ${outreach._id}`);
    res.json(outreach);

  } catch (error) {
    logger.error('Failed to record response', error);
    res.status(500).json({ error: 'Failed to record response' });
  }
});

// Get outreach statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

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
          replied: {
            $sum: {
              $cond: [{ $eq: ['$status', 'replied'] }, 1, 0]
            }
          },
          meetings: {
            $sum: {
              $cond: [{ $eq: ['$results.conversion', 'meeting_booked'] }, 1, 0]
            }
          },
          byType: {
            $push: '$campaign.type'
          }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0, sent: 0, delivered: 0, opened: 0, replied: 0, meetings: 0, byType: []
    };

    // Calculate rates
    result.deliveryRate = result.sent > 0 ? ((result.delivered / result.sent) * 100).toFixed(1) : '0.0';
    result.openRate = result.delivered > 0 ? ((result.opened / result.delivered) * 100).toFixed(1) : '0.0';
    result.responseRate = result.sent > 0 ? ((result.replied / result.sent) * 100).toFixed(1) : '0.0';
    result.meetingRate = result.sent > 0 ? ((result.meetings / result.sent) * 100).toFixed(1) : '0.0';

    // Count by type
    const typeCounts = {};
    result.byType.forEach(type => {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    result.byType = typeCounts;

    // Get recent activity
    const recentActivity = await Outreach.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
    .populate('firmId', 'name')
    .sort({ createdAt: -1 })
    .limit(10)
    .select('firmId campaign.type status createdAt');

    res.json({
      period: `${period} days`,
      stats: result,
      recentActivity
    });

  } catch (error) {
    logger.error('Failed to fetch outreach statistics', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Manual trigger for scheduled tasks
router.post('/automation/trigger/:task', async (req, res) => {
  try {
    const { task } = req.params;
    
    const result = await schedulerService.manualTrigger(task);
    
    res.json({
      message: `Task '${task}' completed successfully`,
      result
    });

  } catch (error) {
    logger.error(`Manual task trigger failed: ${req.params.task}`, error);
    res.status(500).json({ 
      error: 'Task execution failed', 
      message: error.message 
    });
  }
});

// Get automation status
router.get('/automation/status', async (req, res) => {
  try {
    const status = schedulerService.getJobStatus();
    
    res.json({
      jobs: status,
      serverTime: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to fetch automation status', error);
    res.status(500).json({ error: 'Failed to fetch automation status' });
  }
});

module.exports = router;