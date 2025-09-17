const mongoose = require('mongoose');

const firmSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  website: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['vc', 'pe', 'family_office', 'corporate_vc'],
    required: true
  },
  stage: {
    type: String,
    enum: ['seed', 'series_a', 'series_b', 'series_c', 'growth', 'late_stage'],
    default: 'seed'
  },
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  aum: {
    type: Number, // Assets under management in millions
    default: 0
  },
  focusAreas: [{
    type: String,
    enum: ['ai', 'fintech', 'healthcare', 'enterprise', 'consumer', 'biotech', 'climate', 'crypto', 'other']
  }],
  contacts: [{
    name: String,
    title: String,
    email: String,
    linkedin: String,
    phone: String,
    isDecisionMaker: {
      type: Boolean,
      default: false
    }
  }],
  contactForm: {
    hasForm: {
      type: Boolean,
      default: false
    },
    formUrl: String,
    fields: [{
      name: String,
      selector: String,
      type: {
        type: String,
        enum: ['text', 'email', 'select', 'textarea', 'checkbox']
      },
      required: Boolean
    }]
  },
  socialMedia: {
    linkedin: String,
    twitter: String,
    crunchbase: String
  },
  recentInvestments: [{
    company: String,
    amount: Number,
    stage: String,
    date: Date,
    source: String
  }],
  score: {
    overall: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    relevance: Number,
    contactability: Number,
    timing: Number
  },
  metadata: {
    discoveredAt: {
      type: Date,
      default: Date.now
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    source: {
      type: String,
      enum: ['crunchbase', 'pitchbook', 'manual', 'linkedin', 'website_scrape'],
      default: 'website_scrape'
    },
    verified: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
firmSchema.index({ type: 1, 'score.overall': -1 });
firmSchema.index({ 'location.city': 1, 'location.state': 1 });
firmSchema.index({ focusAreas: 1 });
firmSchema.index({ 'metadata.discoveredAt': -1 });

// Calculate overall score before saving
firmSchema.pre('save', function(next) {
  if (this.score.relevance && this.score.contactability && this.score.timing) {
    this.score.overall = Math.round(
      (this.score.relevance * 0.4) + 
      (this.score.contactability * 0.3) + 
      (this.score.timing * 0.3)
    );
  }
  this.metadata.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Firm', firmSchema);