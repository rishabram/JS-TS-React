const express = require('express');
const router = express.Router();
const Firm = require('../models/Firm');
const researchService = require('../services/researchService');
const logger = require('../utils/logger');

// Get all firms with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      focusAreas,
      location,
      minScore,
      sortBy = 'score.overall',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (type) query.type = type;
    if (focusAreas) query.focusAreas = { $in: focusAreas.split(',') };
    if (location) {
      query.$or = [
        { 'location.city': new RegExp(location, 'i') },
        { 'location.state': new RegExp(location, 'i') },
        { 'location.country': new RegExp(location, 'i') }
      ];
    }
    if (minScore) query['score.overall'] = { $gte: parseInt(minScore) };

    // Execute query
    const firms = await Firm.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Firm.countDocuments(query);

    res.json({
      firms,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    logger.error('Failed to fetch firms', error);
    res.status(500).json({ error: 'Failed to fetch firms' });
  }
});

// Get single firm by ID
router.get('/:id', async (req, res) => {
  try {
    const firm = await Firm.findById(req.params.id);
    
    if (!firm) {
      return res.status(404).json({ error: 'Firm not found' });
    }

    res.json(firm);
  } catch (error) {
    logger.error('Failed to fetch firm', error);
    res.status(500).json({ error: 'Failed to fetch firm' });
  }
});

// Start research for new firms
router.post('/research', async (req, res) => {
  try {
    const criteria = req.body;
    
    // Start research in background
    const results = await researchService.researchFirms(criteria);
    
    res.json({
      message: 'Research completed',
      results: {
        firmsFound: results.length,
        criteria
      }
    });

  } catch (error) {
    logger.error('Research failed', error);
    res.status(500).json({ error: 'Research failed', message: error.message });
  }
});

// Analyze contact form for a firm
router.post('/:id/analyze-contact-form', async (req, res) => {
  try {
    const firm = await Firm.findById(req.params.id);
    
    if (!firm) {
      return res.status(404).json({ error: 'Firm not found' });
    }

    const formData = await researchService.analyzeContactForm(firm.website);
    
    // Update firm with contact form info
    if (formData.length > 0) {
      firm.contactForm = {
        hasForm: true,
        formUrl: formData[0].action || firm.website,
        fields: formData[0].fields
      };
      await firm.save();
    }

    res.json({
      firm: firm.name,
      contactForms: formData,
      updated: formData.length > 0
    });

  } catch (error) {
    logger.error('Contact form analysis failed', error);
    res.status(500).json({ error: 'Contact form analysis failed' });
  }
});

// Update firm manually
router.put('/:id', async (req, res) => {
  try {
    const firm = await Firm.findByIdAndUpdate(
      req.params.id,
      { ...req.body, 'metadata.lastUpdated': new Date() },
      { new: true, runValidators: true }
    );

    if (!firm) {
      return res.status(404).json({ error: 'Firm not found' });
    }

    logger.research(`Firm updated manually: ${firm.name}`);
    res.json(firm);

  } catch (error) {
    logger.error('Failed to update firm', error);
    res.status(500).json({ error: 'Failed to update firm' });
  }
});

// Delete firm
router.delete('/:id', async (req, res) => {
  try {
    const firm = await Firm.findByIdAndDelete(req.params.id);

    if (!firm) {
      return res.status(404).json({ error: 'Firm not found' });
    }

    logger.research(`Firm deleted: ${firm.name}`);
    res.json({ message: 'Firm deleted successfully' });

  } catch (error) {
    logger.error('Failed to delete firm', error);
    res.status(500).json({ error: 'Failed to delete firm' });
  }
});

// Get firm statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Firm.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          avgScore: { $avg: '$score.overall' },
          byType: {
            $push: {
              type: '$type',
              score: '$score.overall'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          avgScore: { $round: ['$avgScore', 1] },
          vcCount: {
            $size: {
              $filter: {
                input: '$byType',
                cond: { $eq: ['$$this.type', 'vc'] }
              }
            }
          },
          peCount: {
            $size: {
              $filter: {
                input: '$byType',
                cond: { $eq: ['$$this.type', 'pe'] }
              }
            }
          }
        }
      }
    ]);

    const recentFirms = await Firm.countDocuments({
      'metadata.discoveredAt': { 
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
      }
    });

    const topScoring = await Firm.find()
      .sort({ 'score.overall': -1 })
      .limit(5)
      .select('name score.overall type');

    res.json({
      overview: stats[0] || { total: 0, avgScore: 0, vcCount: 0, peCount: 0 },
      recentFirms,
      topScoring
    });

  } catch (error) {
    logger.error('Failed to fetch firm statistics', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;