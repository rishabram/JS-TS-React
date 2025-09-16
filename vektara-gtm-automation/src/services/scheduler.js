const cron = require('cron');
const logger = require('../utils/logger');
const researchService = require('./researchService');
const outreachService = require('./outreachService');
const Firm = require('../models/Firm');
const Outreach = require('../models/Outreach');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
  }

  // Setup all scheduled tasks
  setupScheduledTasks() {
    logger.automation('Setting up scheduled tasks');

    // Daily firm research (9 AM)
    this.scheduleJob('daily_research', '0 9 * * *', () => {
      this.runDailyResearch();
    });

    // Daily outreach campaign (10 AM)
    this.scheduleJob('daily_outreach', '0 10 * * *', () => {
      this.runDailyOutreach();
    });

    // Follow-up processing (2 PM)
    this.scheduleJob('follow_up_processing', '0 14 * * *', () => {
      this.processFollowUps();
    });

    // Weekly analytics report (Monday 9 AM)
    this.scheduleJob('weekly_analytics', '0 9 * * 1', () => {
      this.generateWeeklyReport();
    });

    // Data cleanup (daily at midnight)
    this.scheduleJob('data_cleanup', '0 0 * * *', () => {
      this.cleanupOldData();
    });

    // Response monitoring (every 2 hours during business hours)
    this.scheduleJob('response_monitoring', '0 9-17/2 * * 1-5', () => {
      this.monitorResponses();
    });

    logger.automation(`Scheduled ${this.jobs.size} automation tasks`);
  }

  // Schedule a new job
  scheduleJob(name, cronPattern, taskFunction) {
    if (this.jobs.has(name)) {
      this.jobs.get(name).stop();
    }

    const job = new cron.CronJob(cronPattern, async () => {
      logger.automation(`Starting scheduled task: ${name}`);
      
      try {
        await taskFunction();
        logger.automation(`Completed scheduled task: ${name}`);
      } catch (error) {
        logger.error(`Scheduled task failed: ${name}`, error);
      }
    });

    this.jobs.set(name, job);
    job.start();

    logger.automation(`Scheduled job '${name}' with pattern '${cronPattern}'`);
  }

  // Daily firm research task
  async runDailyResearch() {
    logger.automation('Running daily firm research');

    try {
      const researchCriteria = {
        type: ['vc', 'pe'],
        focusAreas: ['ai', 'fintech', 'enterprise'],
        location: 'United States',
        maxFirms: 50
      };

      const results = await researchService.researchFirms(researchCriteria);
      
      logger.automation(`Daily research completed`, {
        firmsFound: results.length,
        newFirms: results.filter(f => f.metadata.discoveredAt > new Date(Date.now() - 24 * 60 * 60 * 1000)).length
      });

      return results;
    } catch (error) {
      logger.error('Daily research failed', error);
      throw error;
    }
  }

  // Daily outreach campaign
  async runDailyOutreach() {
    logger.automation('Running daily outreach campaign');

    try {
      const outreachCriteria = {
        templateType: 'initial_outreach',
        campaignName: 'Daily Automated Outreach',
        minScore: 70,
        maxFirms: 25,
        companyStage: 'growth stage',
        valueProposition: 'AI-powered solutions that drive efficiency and growth'
      };

      const results = await outreachService.runOutreachCampaign(outreachCriteria);
      
      logger.automation('Daily outreach completed', results);
      return results;
    } catch (error) {
      logger.error('Daily outreach failed', error);
      throw error;
    }
  }

  // Process follow-ups
  async processFollowUps() {
    logger.automation('Processing follow-ups');

    try {
      // Find outreach that needs follow-up
      const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      
      const pendingFollowUps = await Outreach.find({
        status: 'sent',
        'scheduling.sentAt': { $lte: cutoffDate },
        'response.hasResponse': false,
        'automation.followUpScheduled': { $exists: false }
      }).populate('firmId');

      let followUpsSent = 0;

      for (const outreach of pendingFollowUps) {
        try {
          await this.sendFollowUp(outreach);
          followUpsSent++;
        } catch (error) {
          logger.error(`Failed to send follow-up for outreach ${outreach._id}`, error);
        }
      }

      logger.automation(`Follow-up processing completed`, {
        pendingFollowUps: pendingFollowUps.length,
        followUpsSent
      });

      return { processed: pendingFollowUps.length, sent: followUpsSent };
    } catch (error) {
      logger.error('Follow-up processing failed', error);
      throw error;
    }
  }

  // Send individual follow-up
  async sendFollowUp(originalOutreach) {
    const firm = originalOutreach.firmId;
    const contact = firm.contacts?.find(c => c._id?.toString() === originalOutreach.contactId);

    // Create follow-up outreach
    const followUpCriteria = {
      templateType: 'follow_up',
      campaignName: 'Automated Follow-up',
      isFollowUp: true,
      originalOutreachId: originalOutreach._id
    };

    const result = await outreachService.executeOutreach(firm, {
      type: 'email',
      contact: contact
    }, followUpCriteria);

    // Mark original outreach as having follow-up scheduled
    originalOutreach.automation.followUpScheduled = new Date();
    await originalOutreach.save();

    logger.automation(`Follow-up sent for ${firm.name}`, {
      originalOutreachId: originalOutreach._id,
      followUpOutreachId: result.outreachId
    });

    return result;
  }

  // Generate weekly analytics report
  async generateWeeklyReport() {
    logger.automation('Generating weekly analytics report');

    try {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Gather statistics
      const stats = {
        period: {
          start: weekAgo,
          end: new Date()
        },
        research: {
          firmsAdded: await Firm.countDocuments({
            'metadata.discoveredAt': { $gte: weekAgo }
          }),
          totalFirms: await Firm.countDocuments()
        },
        outreach: {
          emailsSent: await Outreach.countDocuments({
            'campaign.type': 'email',
            'scheduling.sentAt': { $gte: weekAgo }
          }),
          formsFilled: await Outreach.countDocuments({
            'campaign.type': 'contact_form',
            'scheduling.sentAt': { $gte: weekAgo }
          }),
          responses: await Outreach.countDocuments({
            'response.hasResponse': true,
            'scheduling.repliedAt': { $gte: weekAgo }
          }),
          meetings: await Outreach.countDocuments({
            'results.conversion': 'meeting_booked',
            updatedAt: { $gte: weekAgo }
          })
        }
      };

      // Calculate conversion rates
      const totalOutreach = stats.outreach.emailsSent + stats.outreach.formsFilled;
      stats.outreach.responseRate = totalOutreach > 0 ? 
        ((stats.outreach.responses / totalOutreach) * 100).toFixed(2) + '%' : '0%';
      
      stats.outreach.meetingRate = totalOutreach > 0 ? 
        ((stats.outreach.meetings / totalOutreach) * 100).toFixed(2) + '%' : '0%';

      // Get top performing firms
      const topFirms = await Outreach.aggregate([
        {
          $match: {
            'scheduling.sentAt': { $gte: weekAgo },
            'response.hasResponse': true
          }
        },
        {
          $lookup: {
            from: 'firms',
            localField: 'firmId',
            foreignField: '_id',
            as: 'firm'
          }
        },
        {
          $group: {
            _id: '$firmId',
            firmName: { $first: { $arrayElemAt: ['$firm.name', 0] } },
            responseCount: { $sum: 1 },
            avgSentiment: { $avg: '$response.sentiment.score' }
          }
        },
        {
          $sort: { responseCount: -1, avgSentiment: -1 }
        },
        {
          $limit: 5
        }
      ]);

      stats.topPerformingFirms = topFirms;

      logger.automation('Weekly report generated', stats);

      // In a real implementation, send this report via email or dashboard
      // For now, just log it
      return stats;
    } catch (error) {
      logger.error('Weekly report generation failed', error);
      throw error;
    }
  }

  // Clean up old data
  async cleanupOldData() {
    logger.automation('Running data cleanup');

    try {
      const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

      // Remove old outreach records (keep for 6 months)
      const deletedOutreach = await Outreach.deleteMany({
        createdAt: { $lt: sixMonthsAgo },
        'response.hasResponse': false,
        'results.conversion': { $exists: false }
      });

      // Remove unverified firms older than 1 year
      const deletedFirms = await Firm.deleteMany({
        'metadata.verified': false,
        'metadata.discoveredAt': { $lt: oneYearAgo }
      });

      logger.automation('Data cleanup completed', {
        deletedOutreach: deletedOutreach.deletedCount,
        deletedFirms: deletedFirms.deletedCount
      });

      return {
        deletedOutreach: deletedOutreach.deletedCount,
        deletedFirms: deletedFirms.deletedCount
      };
    } catch (error) {
      logger.error('Data cleanup failed', error);
      throw error;
    }
  }

  // Monitor for responses
  async monitorResponses() {
    logger.automation('Monitoring responses');

    try {
      // In a real implementation, this would:
      // 1. Check email inbox for replies
      // 2. Parse and analyze responses
      // 3. Update outreach records
      // 4. Trigger appropriate follow-up actions

      // For now, just log that we're monitoring
      const pendingOutreach = await Outreach.countDocuments({
        status: 'sent',
        'response.hasResponse': false
      });

      logger.automation(`Monitoring ${pendingOutreach} pending outreach records`);

      return { pendingOutreach };
    } catch (error) {
      logger.error('Response monitoring failed', error);
      throw error;
    }
  }

  // Stop a specific job
  stopJob(name) {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      this.jobs.delete(name);
      logger.automation(`Stopped scheduled job: ${name}`);
    }
  }

  // Stop all jobs
  stopAllJobs() {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.automation(`Stopped scheduled job: ${name}`);
    });
    this.jobs.clear();
    logger.automation('All scheduled jobs stopped');
  }

  // Get job status
  getJobStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running,
        lastDate: job.lastDate(),
        nextDate: job.nextDate()
      };
    });
    return status;
  }

  // Manual trigger for any task
  async manualTrigger(taskName) {
    logger.automation(`Manually triggering task: ${taskName}`);

    switch (taskName) {
      case 'research':
        return await this.runDailyResearch();
      case 'outreach':
        return await this.runDailyOutreach();
      case 'follow_ups':
        return await this.processFollowUps();
      case 'analytics':
        return await this.generateWeeklyReport();
      case 'cleanup':
        return await this.cleanupOldData();
      case 'monitor':
        return await this.monitorResponses();
      default:
        throw new Error(`Unknown task: ${taskName}`);
    }
  }
}

module.exports = {
  schedulerService: new SchedulerService(),
  setupScheduledTasks: () => {
    const scheduler = new SchedulerService();
    scheduler.setupScheduledTasks();
    return scheduler;
  }
};