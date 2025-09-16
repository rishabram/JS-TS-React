const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const logger = require('../utils/logger');
const Firm = require('../models/Firm');

class ResearchService {
  constructor() {
    this.browser = null;
    this.sources = {
      crunchbase: 'https://www.crunchbase.com',
      pitchbook: 'https://pitchbook.com',
      vcList: 'https://vclist.com',
      angelList: 'https://angel.co'
    };
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: process.env.PUPPETEER_HEADLESS !== 'false',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Research firms from multiple sources
  async researchFirms(criteria = {}) {
    logger.research('Starting firm research', criteria);
    const results = [];

    try {
      // Research from different sources
      const crunchbaseResults = await this.researchFromCrunchbase(criteria);
      const webResults = await this.researchFromWebSearch(criteria);
      const linkedinResults = await this.researchFromLinkedIn(criteria);

      results.push(...crunchbaseResults, ...webResults, ...linkedinResults);

      // Deduplicate and score results
      const uniqueFirms = this.deduplicateFirms(results);
      const scoredFirms = await this.scoreFirms(uniqueFirms, criteria);

      // Save to database
      for (const firm of scoredFirms) {
        await this.saveFirm(firm);
      }

      logger.research(`Research completed. Found ${scoredFirms.length} firms`, {
        criteria,
        count: scoredFirms.length
      });

      return scoredFirms;
    } catch (error) {
      logger.error('Firm research failed', error);
      throw error;
    }
  }

  // Research from Crunchbase (public data)
  async researchFromCrunchbase(criteria) {
    const firms = [];
    const browser = await this.initBrowser();
    
    try {
      const page = await browser.newPage();
      
      // Search for VCs/PEs with specific criteria
      const searchUrl = this.buildCrunchbaseSearchUrl(criteria);
      await page.goto(searchUrl, { waitUntil: 'networkidle0' });

      // Extract firm data
      const firmData = await page.evaluate(() => {
        const firms = [];
        const firmElements = document.querySelectorAll('[data-testid="search-result-item"]');
        
        firmElements.forEach(element => {
          const nameEl = element.querySelector('h3 a');
          const descEl = element.querySelector('.description');
          const locationEl = element.querySelector('.location');
          
          if (nameEl) {
            firms.push({
              name: nameEl.textContent.trim(),
              url: nameEl.href,
              description: descEl ? descEl.textContent.trim() : '',
              location: locationEl ? locationEl.textContent.trim() : '',
              source: 'crunchbase'
            });
          }
        });
        
        return firms;
      });

      // Get detailed info for each firm
      for (const firm of firmData.slice(0, 20)) { // Limit to prevent rate limiting
        const detailedFirm = await this.getDetailedFirmInfo(page, firm);
        if (detailedFirm) {
          firms.push(detailedFirm);
        }
      }

      await page.close();
    } catch (error) {
      logger.error('Crunchbase research failed', error);
    }

    return firms;
  }

  // Research from web search
  async researchFromWebSearch(criteria) {
    const firms = [];
    
    try {
      // Use search queries to find VC/PE firms
      const queries = this.buildSearchQueries(criteria);
      
      for (const query of queries) {
        const searchResults = await this.performWebSearch(query);
        
        for (const result of searchResults.slice(0, 10)) {
          const firmData = await this.extractFirmFromWebsite(result.url);
          if (firmData) {
            firms.push({
              ...firmData,
              source: 'web_search'
            });
          }
        }
      }
    } catch (error) {
      logger.error('Web search research failed', error);
    }

    return firms;
  }

  // Research from LinkedIn
  async researchFromLinkedIn(criteria) {
    const firms = [];
    const browser = await this.initBrowser();
    
    try {
      const page = await browser.newPage();
      
      // LinkedIn company search (requires authentication in real implementation)
      const searchUrl = this.buildLinkedInSearchUrl(criteria);
      
      // Note: LinkedIn scraping requires authentication and is subject to terms of service
      // This is a simplified example - in production, use LinkedIn API
      
      await page.close();
    } catch (error) {
      logger.error('LinkedIn research failed', error);
    }

    return firms;
  }

  // Extract detailed information from a firm's website
  async extractFirmFromWebsite(url) {
    const browser = await this.initBrowser();
    
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      const firmData = await page.evaluate(() => {
        const getTextContent = (selector) => {
          const el = document.querySelector(selector);
          return el ? el.textContent.trim() : '';
        };

        const getAllTextContent = (selector) => {
          const elements = document.querySelectorAll(selector);
          return Array.from(elements).map(el => el.textContent.trim());
        };

        // Extract common firm information
        const name = getTextContent('h1') || 
                    getTextContent('.company-name') ||
                    getTextContent('title');

        const description = getTextContent('.description') ||
                           getTextContent('.about') ||
                           getTextContent('meta[name="description"]');

        // Look for contact information
        const emails = Array.from(document.querySelectorAll('a[href^="mailto:"]'))
                            .map(a => a.href.replace('mailto:', ''));

        // Look for team members
        const teamMembers = getAllTextContent('.team-member, .partner, .principal')
                                .filter(text => text.length > 2);

        // Look for focus areas/industries
        const focusAreas = getAllTextContent('.focus-area, .industry, .sector')
                               .filter(text => text.length > 2);

        return {
          name: name.length > 0 ? name : null,
          description,
          emails,
          teamMembers,
          focusAreas,
          url: window.location.href
        };
      });

      await page.close();

      if (firmData.name) {
        return this.normalizeFirmData(firmData);
      }

    } catch (error) {
      logger.error(`Failed to extract firm data from ${url}`, error);
    }

    return null;
  }

  // Detect and analyze contact forms
  async analyzeContactForm(url) {
    const browser = await this.initBrowser();
    
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle0' });

      const formData = await page.evaluate(() => {
        const forms = document.querySelectorAll('form');
        const contactForms = [];

        forms.forEach(form => {
          const inputs = form.querySelectorAll('input, textarea, select');
          const hasEmailField = Array.from(inputs).some(input => 
            input.type === 'email' || input.name.includes('email')
          );
          
          const hasMessageField = Array.from(inputs).some(input =>
            input.type === 'textarea' || input.name.includes('message')
          );

          if (hasEmailField || hasMessageField) {
            const fields = Array.from(inputs).map(input => ({
              name: input.name || input.id,
              type: input.type || input.tagName.toLowerCase(),
              selector: this.getElementSelector(input),
              required: input.required,
              placeholder: input.placeholder
            }));

            contactForms.push({
              action: form.action,
              method: form.method,
              fields,
              selector: this.getElementSelector(form)
            });
          }
        });

        return contactForms;
      });

      await page.close();
      return formData;

    } catch (error) {
      logger.error(`Failed to analyze contact form at ${url}`, error);
      return [];
    }
  }

  // Helper methods
  buildCrunchbaseSearchUrl(criteria) {
    const baseUrl = 'https://www.crunchbase.com/discover/organization.companies';
    const params = new URLSearchParams({
      organization_types: 'investor',
      investor_types: criteria.type || 'venture_capital',
      location_identifiers: criteria.location || '',
      industry_groups: criteria.industry || ''
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  buildSearchQueries(criteria) {
    const baseQueries = [
      'venture capital firms',
      'private equity firms',
      'investment firms',
      'VC firms'
    ];

    if (criteria.location) {
      return baseQueries.map(q => `${q} ${criteria.location}`);
    }

    if (criteria.industry) {
      return baseQueries.map(q => `${q} ${criteria.industry}`);
    }

    return baseQueries;
  }

  async performWebSearch(query) {
    // In a real implementation, use a search API like Google Custom Search
    // For now, return mock results
    return [
      { title: 'Sample VC Firm', url: 'https://example-vc.com' },
      { title: 'Another PE Firm', url: 'https://example-pe.com' }
    ];
  }

  deduplicateFirms(firms) {
    const seen = new Set();
    return firms.filter(firm => {
      const key = firm.website || firm.name.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  async scoreFirms(firms, criteria) {
    return firms.map(firm => ({
      ...firm,
      score: {
        relevance: this.calculateRelevanceScore(firm, criteria),
        contactability: this.calculateContactabilityScore(firm),
        timing: this.calculateTimingScore(firm)
      }
    }));
  }

  calculateRelevanceScore(firm, criteria) {
    let score = 50; // Base score

    // Industry match
    if (criteria.industry && firm.focusAreas) {
      const match = firm.focusAreas.some(area => 
        area.toLowerCase().includes(criteria.industry.toLowerCase())
      );
      if (match) score += 30;
    }

    // Location match
    if (criteria.location && firm.location) {
      if (firm.location.toLowerCase().includes(criteria.location.toLowerCase())) {
        score += 20;
      }
    }

    return Math.min(score, 100);
  }

  calculateContactabilityScore(firm) {
    let score = 30; // Base score

    if (firm.contacts && firm.contacts.length > 0) score += 30;
    if (firm.contactForm && firm.contactForm.hasForm) score += 25;
    if (firm.socialMedia && firm.socialMedia.linkedin) score += 15;

    return Math.min(score, 100);
  }

  calculateTimingScore(firm) {
    let score = 50; // Base score

    // Recent investment activity
    if (firm.recentInvestments && firm.recentInvestments.length > 0) {
      const recentActivity = firm.recentInvestments.filter(inv => {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return new Date(inv.date) > sixMonthsAgo;
      });
      
      if (recentActivity.length > 0) score += 30;
    }

    return Math.min(score, 100);
  }

  normalizeFirmData(rawData) {
    return {
      name: rawData.name,
      website: rawData.url,
      type: this.inferFirmType(rawData),
      contacts: this.extractContacts(rawData),
      focusAreas: this.normalizeFocusAreas(rawData.focusAreas),
      metadata: {
        source: rawData.source || 'website_scrape',
        discoveredAt: new Date()
      }
    };
  }

  inferFirmType(data) {
    const text = (data.description + ' ' + data.name).toLowerCase();
    
    if (text.includes('private equity') || text.includes(' pe ')) return 'pe';
    if (text.includes('venture capital') || text.includes(' vc ')) return 'vc';
    if (text.includes('family office')) return 'family_office';
    if (text.includes('corporate venture')) return 'corporate_vc';
    
    return 'vc'; // Default
  }

  extractContacts(data) {
    const contacts = [];
    
    // Extract from emails
    if (data.emails) {
      data.emails.forEach(email => {
        contacts.push({
          email,
          isDecisionMaker: email.includes('partner') || email.includes('managing')
        });
      });
    }

    // Extract from team members
    if (data.teamMembers) {
      data.teamMembers.forEach(member => {
        const isDecisionMaker = member.toLowerCase().includes('partner') ||
                               member.toLowerCase().includes('managing') ||
                               member.toLowerCase().includes('principal');
        
        contacts.push({
          name: member,
          isDecisionMaker
        });
      });
    }

    return contacts;
  }

  normalizeFocusAreas(areas) {
    if (!areas) return [];
    
    const mapping = {
      'artificial intelligence': 'ai',
      'machine learning': 'ai',
      'financial technology': 'fintech',
      'financial services': 'fintech',
      'health technology': 'healthcare',
      'medical': 'healthcare',
      'enterprise software': 'enterprise',
      'b2b': 'enterprise',
      'consumer': 'consumer',
      'b2c': 'consumer',
      'biotechnology': 'biotech',
      'life sciences': 'biotech',
      'climate tech': 'climate',
      'clean energy': 'climate',
      'cryptocurrency': 'crypto',
      'blockchain': 'crypto'
    };

    return areas.map(area => {
      const normalized = area.toLowerCase();
      for (const [key, value] of Object.entries(mapping)) {
        if (normalized.includes(key)) return value;
      }
      return 'other';
    }).filter((area, index, self) => self.indexOf(area) === index);
  }

  async saveFirm(firmData) {
    try {
      const existingFirm = await Firm.findOne({ website: firmData.website });
      
      if (existingFirm) {
        // Update existing firm
        Object.assign(existingFirm, firmData);
        await existingFirm.save();
        logger.research(`Updated existing firm: ${firmData.name}`);
        return existingFirm;
      } else {
        // Create new firm
        const firm = new Firm(firmData);
        await firm.save();
        logger.research(`Saved new firm: ${firmData.name}`);
        return firm;
      }
    } catch (error) {
      logger.error(`Failed to save firm: ${firmData.name}`, error);
      throw error;
    }
  }
}

module.exports = new ResearchService();