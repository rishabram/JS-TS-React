const mongoose = require('mongoose');

const outreachSchema = new mongoose.Schema({
  firmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Firm',
    required: true
  },
  contactId: String, // Reference to specific contact within firm
  campaign: {
    name: String,
    type: {
      type: String,
      enum: ['email', 'linkedin', 'contact_form', 'phone', 'direct_mail'],
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'failed'],
    default: 'pending'
  },
  subject: String,
  content: {
    text: String,
    html: String,
    personalizations: [{
      field: String,
      value: String,
      confidence: Number
    }]
  },
  scheduling: {
    scheduledFor: Date,
    sentAt: Date,
    deliveredAt: Date,
    openedAt: Date,
    clickedAt: Date,
    repliedAt: Date
  },
  tracking: {
    messageId: String,
    opens: [{
      timestamp: Date,
      userAgent: String,
      ip: String
    }],
    clicks: [{
      timestamp: Date,
      url: String,
      userAgent: String,
      ip: String
    }]
  },
  response: {
    hasResponse: {
      type: Boolean,
      default: false
    },
    responseType: {
      type: String,
      enum: ['positive', 'negative', 'neutral', 'auto_reply']
    },
    content: String,
    sentiment: {
      score: Number,
      label: String
    },
    extractedInfo: {
      isInterested: Boolean,
      meetingRequested: Boolean,
      nextSteps: String,
      concerns: [String]
    }
  },
  automation: {
    isAutomated: {
      type: Boolean,
      default: true
    },
    sequence: {
      name: String,
      step: Number,
      totalSteps: Number
    },
    followUpScheduled: Date,
    suppressions: [{
      reason: String,
      timestamp: Date
    }]
  },
  results: {
    conversion: {
      type: String,
      enum: ['meeting_booked', 'interest_expressed', 'declined', 'no_response', 'unsubscribed']
    },
    notes: String,
    meetingDetails: {
      scheduledDate: Date,
      attendees: [String],
      outcome: String
    }
  }
}, {
  timestamps: true
});

// Indexes
outreachSchema.index({ firmId: 1, 'campaign.type': 1 });
outreachSchema.index({ status: 1, 'scheduling.scheduledFor': 1 });
outreachSchema.index({ 'automation.sequence.name': 1, 'automation.sequence.step': 1 });
outreachSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Outreach', outreachSchema);