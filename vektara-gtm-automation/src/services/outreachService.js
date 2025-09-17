const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const logger = require('../utils/logger');
const aiService = require('./aiService');
const researchService = require('./researchService');
const Firm = require('../models/Firm');
const Outreach = require('../models/Outreach');
const { RateLimiterMemory } = require('rate-limiter-flexible');

class OutreachService {
  constructor() {
    this.emailTransporter = null;
    this.rateLimiter = new RateLimiterMemory({
      keyGenerator: () => 'outreach',
      points: parseInt(process.env.MAX_OUTREACH_PER_DAY) || 50,
      duration: 24 * 60 * 60, // 24 hours
    });
    
    this.browser = null;
    this.templates = new Map();
    this.loadTemplates();
  }

  // Initialize email transporter
  async initEmailTransporter() {
    if (!this.emailTransporter) {
      this.emailTransporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // Verify connection
      await this.emailTransporter.verify();
      logger.automation('Email transporter initialized');
    }
    return this.emailTransporter;
  }

  // Initialize browser for form automation
  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: process.env.PUPPETEER_HEADLESS !== 'false',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      logger.automation('Browser initialized for form automation');
    }
    return this.browser;
  }

  // Load message templates
  loadTemplates() {
    this.templates.set('initial_outreach', {
      subject: 'Partnership opportunity with {firmName}',
      template: `
Hi {contactName},

I hope this message finds you well. I'm reaching out from Vektara Ventures because of {firmName}'s impressive work in {focusArea}.

{personalization}

We're currently {companyStage} and would love to explore potential partnership opportunities. Our {valueProposition} aligns well with your investment thesis, particularly your focus on {relevantFocus}.

Would you be open to a brief 15-minute conversation to discuss how we might work together?

Best regards,
{senderName}
{senderTitle}
Vektara Ventures
{senderEmail}
{senderPhone}
      `.trim()
    });

    this.templates.set('follow_up', {
      subject: 'Following up on our partnership discussion',
      template: `
Hi {contactName},

I wanted to follow up on my previous message regarding potential partnership opportunities between Vektara Ventures and {firmName}.

{followUpContext}

I understand you're likely reviewing many opportunities, but I believe our {valueProposition} could be particularly relevant given {firmName}'s focus on {focusArea}.

Would next week work for a brief call?

Best regards,
{senderName}
      `.trim()
    });

    this.templates.set('meeting_request', {
      subject: 'Meeting request - Vektara Ventures partnership',
      template: `
Hi {contactName},

Thank you for your interest in learning more about Vektara Ventures.

Based on our conversation and {firmName}'s investment focus, I'd love to schedule a more detailed discussion. 

I'm available:
- {timeSlot1}
- {timeSlot2}
- {timeSlot3}

Please let me know what works best for you, or feel free to suggest alternative times.

Looking forward to our conversation.

Best regards,
{senderName}
      `.trim()
    });
  }

  // Main orchestration method for outreach campaigns
  async runOutreachCampaign(criteria = {}) {
    logger.automation('Starting outreach campaign', criteria);

    try {
      // Check rate limits
      await this.rateLimiter.consume('outreach');

      // Get qualified firms
      const firms = await this.getQualifiedFirms(criteria);
      logger.automation(`Found ${firms.length} qualified firms for outreach`);

      const results = {
        attempted: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
        details: []
      };

      // Process each firm
      for (const firm of firms) {
        try {
          const result = await this.processFirmOutreach(firm, criteria);
          results.attempted++;
          
          if (result.success) {
            results.successful++;
          } else {
            results.failed++;
          }
          
          results.details.push(result);

          // Add delay between requests
          await this.delay(parseInt(process.env.MIN_DELAY_BETWEEN_REQUESTS) || 5000);

        } catch (error) {
          logger.error(`Failed to process outreach for firm ${firm.name}`, error);
          results.failed++;
          results.details.push({
            firmId: firm._id,
            firmName: firm.name,
            success: false,
            error: error.message
          });
        }
      }

      logger.automation('Outreach campaign completed', results);
      return results;

    } catch (error) {
      if (error.remainingPoints !== undefined) {
        logger.warn('Rate limit exceeded for outreach campaigns');
        throw new Error('Daily outreach limit reached. Please try again tomorrow.');
      }
      
      logger.error('Outreach campaign failed', error);
      throw error;
    }
  }

  // Process outreach for a single firm
  async processFirmOutreach(firm, criteria) {
    logger.outreach(`Processing outreach for ${firm.name}`);

    // Check if we've already reached out recently
    const recentOutreach = await Outreach.findOne({
      firmId: firm._id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 30 days
    });

    if (recentOutreach) {
      logger.outreach(`Skipping ${firm.name} - recent outreach exists`);
      return {
        firmId: firm._id,
        firmName: firm.name,
        success: false,
        skipped: true,
        reason: 'Recent outreach exists'
      };
    }

    // Determine outreach method priority
    const methods = this.prioritizeOutreachMethods(firm);
    
    for (const method of methods) {
      try {
        const result = await this.executeOutreach(firm, method, criteria);
        
        if (result.success) {
          return {
            firmId: firm._id,
            firmName: firm.name,
            success: true,
            method: method.type,
            outreachId: result.outreachId
          };
        }
      } catch (error) {
        logger.error(`${method.type} outreach failed for ${firm.name}`, error);
        continue; // Try next method
      }
    }

    return {
      firmId: firm._id,
      firmName: firm.name,
      success: false,
      reason: 'All outreach methods failed'
    };
  }

  // Execute specific outreach method
  async executeOutreach(firm, method, criteria) {
    switch (method.type) {
      case 'email':
        return await this.sendEmail(firm, method.contact, criteria);
      
      case 'contact_form':
        return await this.fillContactForm(firm, method.form, criteria);
      
      case 'linkedin':
        return await this.sendLinkedInMessage(firm, method.contact, criteria);
      
      default:
        throw new Error(`Unsupported outreach method: ${method.type}`);
    }
  }

  // Send personalized email
  async sendEmail(firm, contact, criteria) {
    const transporter = await this.initEmailTransporter();
    
    // Generate personalized content
    const template = this.templates.get(criteria.templateType || 'initial_outreach');
    const personalizedContent = await aiService.generatePersonalizedMessage(
      firm, 
      contact, 
      template.template,
      {
        companyStage: criteria.companyStage || 'growth stage',
        industry: criteria.industry || 'technology',
        valueProposition: criteria.valueProposition || 'innovative AI solutions',
        senderName: process.env.SENDER_NAME,
        senderEmail: process.env.SENDER_EMAIL,
        senderPhone: process.env.SENDER_PHONE
      }
    );

    // Generate subject lines and pick the best one
    const subjectLines = await aiService.generateSubjectLines(
      firm, 
      contact, 
      personalizedContent.content
    );

    const emailData = {
      from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
      to: contact?.email || `info@${new URL(firm.website).hostname}`,
      subject: subjectLines[0] || template.subject.replace('{firmName}', firm.name),
      text: personalizedContent.content,
      html: this.convertToHtml(personalizedContent.content),
      headers: {
        'X-Campaign': 'vektara-outreach',
        'X-Firm-ID': firm._id.toString()
      }
    };

    // Send email
    const info = await transporter.sendMail(emailData);
    
    // Record outreach
    const outreach = new Outreach({
      firmId: firm._id,
      contactId: contact?._id,
      campaign: {
        name: criteria.campaignName || 'Initial Outreach',
        type: 'email'
      },
      status: 'sent',
      subject: emailData.subject,
      content: {
        text: personalizedContent.content,
        html: emailData.html,
        personalizations: personalizedContent.personalizations
      },
      scheduling: {
        sentAt: new Date()
      },
      tracking: {
        messageId: info.messageId
      },
      automation: {
        isAutomated: true,
        sequence: {
          name: criteria.sequenceName || 'default',
          step: 1,
          totalSteps: 3
        }
      }
    });

    await outreach.save();

    logger.outreach(`Email sent to ${firm.name}`, {
      messageId: info.messageId,
      to: emailData.to,
      subject: emailData.subject,
      personalizations: personalizedContent.personalizations.length
    });

    return {
      success: true,
      outreachId: outreach._id,
      messageId: info.messageId
    };
  }

  // Fill contact form automatically with enhanced capabilities
  async fillContactForm(firm, formConfig, criteria) {
    try {
      const formUrl = formConfig.formUrl || `${firm.website}/contact`;
      logger.outreach(`Auto-filling contact form for ${firm.name} at ${formUrl}`);

      // Prepare company information for form filling
      const companyInfo = {
        name: process.env.SENDER_NAME || 'John Doe',
        firstName: (process.env.SENDER_NAME || 'John').split(' ')[0],
        lastName: (process.env.SENDER_NAME || 'John Doe').split(' ').slice(1).join(' ') || 'Doe',
        email: process.env.SENDER_EMAIL || 'contact@vektaraventures.com',
        phone: process.env.SENDER_PHONE || '+1-555-123-4567',
        company: process.env.COMPANY_NAME || 'Vektara Ventures',
        website: process.env.COMPANY_WEBSITE || 'https://vektaraventures.com',
        stage: criteria.companyStage || 'growth stage',
        industry: criteria.industry || 'technology',
        valueProposition: criteria.valueProposition || 'AI-powered solutions that drive efficiency and growth',
        subject: `Partnership Inquiry - ${process.env.COMPANY_NAME || 'Vektara Ventures'}`
      };

      // Use the enhanced research service for form auto-filling
      const researchService = require('./researchService');
      const result = await researchService.autoFillContactForm(formUrl, formConfig, companyInfo);

      if (result.success) {
        // Record successful form submission
        const outreach = new Outreach({
          firmId: firm._id,
          campaign: {
            name: criteria.campaignName || 'Contact Form Outreach',
            type: 'contact_form'
          },
          status: 'sent',
          content: {
            text: JSON.stringify(result.formData, null, 2),
            personalizations: [
              { field: 'company_name', value: companyInfo.company, confidence: 1.0 },
              { field: 'value_proposition', value: companyInfo.valueProposition, confidence: 0.9 }
            ]
          },
          scheduling: {
            sentAt: new Date()
          },
          automation: {
            isAutomated: true,
            sequence: {
              name: criteria.sequenceName || 'contact_form_sequence',
              step: 1,
              totalSteps: 1
            }
          }
        });

        await outreach.save();

        logger.outreach(`Contact form successfully submitted for ${firm.name}`, {
          formUrl,
          fieldsCount: Object.keys(result.formData).length
        });

        return {
          success: true,
          outreachId: outreach._id,
          fieldsSubmitted: Object.keys(result.formData).length
        };
      } else {
        throw new Error(result.error || 'Form submission failed');
      }

    } catch (error) {
      logger.error(`Contact form submission failed for ${firm.name}`, error);
      throw error;
    }
  }

  // Get qualified firms for outreach
  async getQualifiedFirms(criteria) {
    const query = {
      'score.overall': { $gte: criteria.minScore || 60 }
    };

    // Add filters based on criteria
    if (criteria.type) {
      query.type = criteria.type;
    }

    if (criteria.focusAreas) {
      query.focusAreas = { $in: criteria.focusAreas };
    }

    if (criteria.location) {
      query.$or = [
        { 'location.city': new RegExp(criteria.location, 'i') },
        { 'location.state': new RegExp(criteria.location, 'i') }
      ];
    }

    // Exclude firms we've contacted recently
    const recentlyContacted = await Outreach.distinct('firmId', {
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    query._id = { $nin: recentlyContacted };

    const firms = await Firm.find(query)
      .sort({ 'score.overall': -1 })
      .limit(criteria.maxFirms || 20);

    return firms;
  }

  // Prioritize outreach methods based on firm data
  prioritizeOutreachMethods(firm) {
    const methods = [];

    // Email (highest priority if we have contact info)
    const emailContact = firm.contacts?.find(c => c.email && c.isDecisionMaker) ||
                         firm.contacts?.find(c => c.email);
    
    if (emailContact) {
      methods.push({
        type: 'email',
        contact: emailContact,
        priority: 1
      });
    }

    // Contact form (good alternative)
    if (firm.contactForm?.hasForm) {
      methods.push({
        type: 'contact_form',
        form: firm.contactForm,
        priority: 2
      });
    }

    // LinkedIn (lower priority, requires more manual work)
    const linkedinContact = firm.contacts?.find(c => c.linkedin);
    if (linkedinContact) {
      methods.push({
        type: 'linkedin',
        contact: linkedinContact,
        priority: 3
      });
    }

    return methods.sort((a, b) => a.priority - b.priority);
  }

  // Convert text to HTML
  convertToHtml(text) {
    return text
      .split('\n\n')
      .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Clean up resources
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    
    if (this.emailTransporter) {
      this.emailTransporter.close();
      this.emailTransporter = null;
    }

    logger.automation('Outreach service cleaned up');
  }
}

module.exports = new OutreachService();