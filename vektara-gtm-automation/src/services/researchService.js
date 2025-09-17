const puppeteer = require('puppeteer-core');
const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const Firm = require('../models/Firm');

// Add stealth plugin to avoid detection
puppeteerExtra.use(StealthPlugin());

class ResearchService {
  constructor() {
    this.browser = null;
    this.browserConfig = this.loadBrowserConfig();
    this.sources = {
      crunchbase: 'https://www.crunchbase.com',
      pitchbook: 'https://pitchbook.com',
      vcList: 'https://vclist.com',
      angelList: 'https://angel.co',
      googleSearch: 'https://www.google.com/search'
    };
    
    // Enhanced firm databases and search patterns
    this.firmSearchPatterns = [
      'venture capital firms',
      'private equity firms', 
      'investment banks',
      'VC firms funding',
      'PE firms investing',
      'investment management companies',
      'growth equity firms',
      'seed stage investors',
      'series A investors',
      'institutional investors'
    ];

    // Common contact form selectors
    this.contactFormSelectors = [
      'form[action*="contact"]',
      'form[id*="contact"]',
      'form[class*="contact"]',
      'form[action*="inquiry"]',
      'form[action*="message"]',
      '.contact-form',
      '#contact-form',
      '.inquiry-form',
      '.message-form'
    ];
  }

  loadBrowserConfig() {
    try {
      const configPath = path.join(__dirname, '../config/browser.json');
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (error) {
      logger.warn('Could not load browser config, using defaults');
    }

    return {
      executablePath: '/usr/bin/google-chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ],
      headless: process.env.PUPPETEER_HEADLESS !== 'false'
    };
  }

  async initBrowser() {
    if (!this.browser) {
      try {
        this.browser = await puppeteer.launch(this.browserConfig);
        logger.automation('Browser initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize browser:', error);
        throw new Error(`Browser initialization failed: ${error.message}\nRun 'npm run install-browser' to set up Chrome browser.`);
      }
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Enhanced firm research with multiple discovery methods
  async researchFirms(criteria = {}) {
    logger.research('Starting enhanced firm research', criteria);
    const results = [];

    try {
      // Multiple research approaches
      const [
        googleResults,
        linkedinResults,
        directoryResults,
        industryResults
      ] = await Promise.allSettled([
        this.researchFromGoogleSearch(criteria),
        this.researchFromLinkedIn(criteria),
        this.researchFromDirectories(criteria),
        this.researchFromIndustryPages(criteria)
      ]);

      // Collect all results
      if (googleResults.status === 'fulfilled') results.push(...googleResults.value);
      if (linkedinResults.status === 'fulfilled') results.push(...linkedinResults.value);
      if (directoryResults.status === 'fulfilled') results.push(...directoryResults.value);
      if (industryResults.status === 'fulfilled') results.push(...industryResults.value);

      // Deduplicate and score results
      const uniqueFirms = this.deduplicateFirms(results);
      const scoredFirms = await this.scoreFirms(uniqueFirms, criteria);

      // Enhanced contact form analysis for each firm
      for (const firm of scoredFirms) {
        try {
          const contactForms = await this.analyzeContactForm(firm.website);
          if (contactForms.length > 0) {
            firm.contactForm = {
              hasForm: true,
              formUrl: contactForms[0].action || firm.website,
              fields: contactForms[0].fields || []
            };
          }
        } catch (error) {
          logger.warn(`Failed to analyze contact form for ${firm.name}:`, error.message);
        }
      }

      // Save to database
      for (const firm of scoredFirms) {
        await this.saveFirm(firm);
      }

      logger.research(`Enhanced research completed`, {
        criteria,
        totalFound: scoredFirms.length,
        withContactForms: scoredFirms.filter(f => f.contactForm?.hasForm).length,
        avgScore: scoredFirms.reduce((sum, f) => sum + f.score.overall, 0) / scoredFirms.length || 0
      });

      return scoredFirms;
    } catch (error) {
      logger.error('Enhanced firm research failed', error);
      throw error;
    }
  }

  // Google search for firms
  async researchFromGoogleSearch(criteria) {
    const firms = [];
    const browser = await this.initBrowser();
    
    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Build search queries based on criteria
      const queries = this.buildSearchQueries(criteria);
      
      for (const query of queries.slice(0, 3)) { // Limit to 3 queries to avoid rate limiting
        try {
          const searchUrl = `${this.sources.googleSearch}?q=${encodeURIComponent(query)}&num=20`;
          await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 30000 });
          
          // Extract search results
          const searchResults = await page.evaluate(() => {
            const results = [];
            const resultElements = document.querySelectorAll('div[data-ved] h3');
            
            resultElements.forEach(element => {
              const link = element.closest('a');
              if (link && link.href && !link.href.includes('google.com')) {
                results.push({
                  title: element.textContent.trim(),
                  url: link.href,
                  description: ''
                });
              }
            });
            
            return results;
          });

          // Filter for investment firms
          const investmentResults = searchResults.filter(result => 
            this.isInvestmentFirm(result.title) || this.isInvestmentFirm(result.url)
          );

          // Get detailed info for each firm
          for (const result of investmentResults.slice(0, 5)) {
            try {
              const firmData = await this.extractFirmFromWebsite(result.url);
              if (firmData) {
                firmData.discoveryMethod = 'google_search';
                firmData.searchQuery = query;
                firms.push(firmData);
              }
            } catch (error) {
              logger.warn(`Failed to extract firm data from ${result.url}:`, error.message);
            }
          }

          // Add delay between searches
          await page.waitForTimeout(2000);
        } catch (error) {
          logger.warn(`Google search failed for query "${query}":`, error.message);
        }
      }

      await page.close();
    } catch (error) {
      logger.error('Google search research failed', error);
    }

    return firms;
  }

  // Research from industry directories and lists
  async researchFromDirectories(criteria) {
    const firms = [];
    const browser = await this.initBrowser();
    
    try {
      const page = await browser.newPage();
      
      // List of industry directories
      const directories = [
        'https://vclist.com',
        'https://www.cbinsights.com/investors',
        'https://angel.co/investors',
        'https://www.f6s.com/investors'
      ];

      for (const directoryUrl of directories) {
        try {
          await page.goto(directoryUrl, { waitUntil: 'networkidle0', timeout: 30000 });
          
          // Extract firm links from directory
          const firmLinks = await page.evaluate(() => {
            const links = [];
            const linkElements = document.querySelectorAll('a[href*="investor"], a[href*="fund"], a[href*="capital"], a[href*="ventures"]');
            
            linkElements.forEach(link => {
              if (link.href && !link.href.includes(window.location.hostname)) {
                links.push({
                  url: link.href,
                  title: link.textContent.trim()
                });
              }
            });
            
            return links.slice(0, 10); // Limit results
          });

          // Process each firm link
          for (const firmLink of firmLinks) {
            try {
              const firmData = await this.extractFirmFromWebsite(firmLink.url);
              if (firmData) {
                firmData.discoveryMethod = 'directory';
                firmData.sourceDirectory = directoryUrl;
                firms.push(firmData);
              }
            } catch (error) {
              logger.warn(`Failed to extract firm from directory link ${firmLink.url}:`, error.message);
            }
          }

        } catch (error) {
          logger.warn(`Failed to research directory ${directoryUrl}:`, error.message);
        }
      }

      await page.close();
    } catch (error) {
      logger.error('Directory research failed', error);
    }

    return firms;
  }

  // Research from industry-specific pages
  async researchFromIndustryPages(criteria) {
    const firms = [];
    
    if (!criteria.focusAreas) return firms;

    const browser = await this.initBrowser();
    
    try {
      const page = await browser.newPage();
      
      // Industry-specific searches
      for (const focusArea of criteria.focusAreas.slice(0, 2)) {
        const industryQueries = [
          `${focusArea} venture capital investors`,
          `${focusArea} private equity funds`,
          `${focusArea} investment firms list`
        ];

        for (const query of industryQueries) {
          try {
            const searchUrl = `${this.sources.googleSearch}?q=${encodeURIComponent(query)}&num=15`;
            await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 30000 });
            
            const industryResults = await page.evaluate(() => {
              const results = [];
              const resultElements = document.querySelectorAll('div[data-ved] h3');
              
              resultElements.forEach(element => {
                const link = element.closest('a');
                if (link && link.href && !link.href.includes('google.com')) {
                  results.push({
                    title: element.textContent.trim(),
                    url: link.href
                  });
                }
              });
              
              return results.slice(0, 5);
            });

            for (const result of industryResults) {
              try {
                const firmData = await this.extractFirmFromWebsite(result.url);
                if (firmData) {
                  firmData.discoveryMethod = 'industry_search';
                  firmData.industryFocus = focusArea;
                  firms.push(firmData);
                }
              } catch (error) {
                logger.warn(`Failed to extract industry firm from ${result.url}:`, error.message);
              }
            }

            await page.waitForTimeout(1500);
          } catch (error) {
            logger.warn(`Industry search failed for "${query}":`, error.message);
          }
        }
      }

      await page.close();
    } catch (error) {
      logger.error('Industry research failed', error);
    }

    return firms;
  }

  // Helper method to identify investment firms
  isInvestmentFirm(text) {
    const keywords = [
      'venture capital', 'private equity', 'investment', 'capital', 'ventures',
      'partners', 'fund', 'equity', 'investments', 'vc', 'pe'
    ];
    
    const lowercaseText = text.toLowerCase();
    return keywords.some(keyword => lowercaseText.includes(keyword));
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

  // Enhanced contact form detection and analysis
  async analyzeContactForm(url) {
    const browser = await this.initBrowser();
    
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      const formData = await page.evaluate((selectors) => {
        const forms = [];
        
        // Try multiple selector strategies
        const formElements = document.querySelectorAll([
          'form',
          '.contact-form',
          '#contact-form',
          '[class*="contact"]',
          '[id*="contact"]',
          '.inquiry-form',
          '.message-form'
        ].join(', '));

        formElements.forEach(form => {
          const inputs = form.querySelectorAll('input, textarea, select');
          const hasEmailField = Array.from(inputs).some(input => 
            input.type === 'email' || 
            input.name?.toLowerCase().includes('email') ||
            input.placeholder?.toLowerCase().includes('email')
          );
          
          const hasMessageField = Array.from(inputs).some(input =>
            input.tagName.toLowerCase() === 'textarea' || 
            input.name?.toLowerCase().includes('message') ||
            input.name?.toLowerCase().includes('inquiry') ||
            input.placeholder?.toLowerCase().includes('message')
          );

          const hasNameField = Array.from(inputs).some(input =>
            input.name?.toLowerCase().includes('name') ||
            input.placeholder?.toLowerCase().includes('name')
          );

          // Only consider forms with essential fields
          if (hasEmailField || (hasMessageField && hasNameField)) {
            const fields = Array.from(inputs).map(input => {
              // Generate a more specific selector
              let selector = input.tagName.toLowerCase();
              if (input.id) {
                selector = `#${input.id}`;
              } else if (input.name) {
                selector = `[name="${input.name}"]`;
              } else if (input.className) {
                selector = `.${input.className.split(' ')[0]}`;
              }

              return {
                name: input.name || input.id || `field_${Math.random().toString(36).substr(2, 9)}`,
                type: input.type || input.tagName.toLowerCase(),
                selector: selector,
                placeholder: input.placeholder || '',
                required: input.required || input.hasAttribute('required'),
                label: this.getFieldLabel(input)
              };
            });

            // Get form action and method
            let formAction = form.action;
            if (!formAction || formAction === window.location.href) {
              // Look for submit button to determine likely endpoint
              const submitBtn = form.querySelector('input[type="submit"], button[type="submit"], button');
              formAction = form.action || window.location.href;
            }

            forms.push({
              action: formAction,
              method: form.method || 'POST',
              fields: fields,
              selector: this.getElementSelector(form),
              hasEmailField,
              hasMessageField,
              hasNameField,
              score: this.calculateFormScore(hasEmailField, hasMessageField, hasNameField, fields.length)
            });
          }
        });

        // Helper function to get field label
        function getFieldLabel(input) {
          // Look for associated label
          if (input.id) {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label) return label.textContent.trim();
          }

          // Look for parent label
          const parentLabel = input.closest('label');
          if (parentLabel) return parentLabel.textContent.replace(input.value, '').trim();

          // Look for preceding text
          const prevSibling = input.previousElementSibling;
          if (prevSibling && (prevSibling.tagName === 'LABEL' || prevSibling.textContent.length < 50)) {
            return prevSibling.textContent.trim();
          }

          return input.placeholder || input.name || '';
        }

        // Helper function to generate element selector
        function getElementSelector(element) {
          if (element.id) return `#${element.id}`;
          if (element.className) return `.${element.className.split(' ')[0]}`;
          
          let path = [];
          while (element && element.nodeType === Node.ELEMENT_NODE) {
            let selector = element.nodeName.toLowerCase();
            if (element.id) {
              selector += `#${element.id}`;
              path.unshift(selector);
              break;
            } else if (element.className) {
              selector += `.${element.className.split(' ')[0]}`;
            }
            path.unshift(selector);
            element = element.parentNode;
          }
          return path.join(' > ');
        }

        // Calculate form quality score
        function calculateFormScore(hasEmail, hasMessage, hasName, fieldCount) {
          let score = 0;
          if (hasEmail) score += 40;
          if (hasMessage) score += 30;
          if (hasName) score += 20;
          if (fieldCount <= 6) score += 10; // Prefer simpler forms
          return Math.min(score, 100);
        }

        return forms.sort((a, b) => b.score - a.score);
      }, this.contactFormSelectors);

      await page.close();
      return formData;

    } catch (error) {
      logger.error(`Failed to analyze contact form at ${url}`, error);
      return [];
    }
  }

  // Auto-fill contact form with company information
  async autoFillContactForm(url, formConfig, companyInfo) {
    const browser = await this.initBrowser();
    
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      logger.automation(`Auto-filling contact form at ${url}`);

      // Prepare form data based on field types and names
      const formData = this.generateFormData(formConfig.fields, companyInfo);

      // Fill each field
      for (const field of formConfig.fields) {
        const value = formData[field.name];
        if (value && field.selector) {
          try {
            await page.waitForSelector(field.selector, { timeout: 5000 });
            
            if (field.type === 'select') {
              // Handle select dropdowns
              await page.select(field.selector, value);
            } else if (field.type === 'checkbox') {
              // Handle checkboxes
              if (value === true || value === 'true' || value === 'yes') {
                await page.click(field.selector);
              }
            } else if (field.type === 'radio') {
              // Handle radio buttons
              await page.click(`${field.selector}[value="${value}"]`);
            } else {
              // Handle text inputs and textareas
              await page.focus(field.selector);
              await page.keyboard.down('Control');
              await page.keyboard.press('KeyA');
              await page.keyboard.up('Control');
              await page.type(field.selector, value);
            }
            
            logger.automation(`Filled field ${field.name} with value: ${value}`);
          } catch (error) {
            logger.warn(`Failed to fill field ${field.name}:`, error.message);
          }
        }
      }

      // Look for and handle CAPTCHA if present
      const hasCaptcha = await page.$('.g-recaptcha, .recaptcha, [class*="captcha"]');
      if (hasCaptcha) {
        logger.warn('CAPTCHA detected - manual intervention required');
        // In a real implementation, you might want to pause here or use a CAPTCHA solving service
      }

      // Submit the form
      const submitButton = await page.$(
        'input[type="submit"], button[type="submit"], .submit-btn, .send-btn, button:contains("Send"), button:contains("Submit")'
      );
      
      if (submitButton) {
        await submitButton.click();
        
        // Wait for form submission response
        try {
          await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
          logger.automation('Form submitted successfully');
        } catch (error) {
          // Check if there's a success message on the same page
          const successMessage = await page.$('.success, .thank-you, [class*="success"], [class*="thank"]');
          if (successMessage) {
            logger.automation('Form submitted successfully (same page)');
          } else {
            logger.warn('Form submission status unclear');
          }
        }
      } else {
        logger.warn('Submit button not found');
      }

      await page.close();
      return { success: true, formData };

    } catch (error) {
      logger.error(`Contact form auto-fill failed for ${url}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Generate appropriate form data based on field analysis
  generateFormData(fields, companyInfo) {
    const data = {};
    
    for (const field of fields) {
      const fieldName = field.name.toLowerCase();
      const fieldLabel = (field.label || '').toLowerCase();
      const fieldPlaceholder = (field.placeholder || '').toLowerCase();
      
      // Determine field purpose and fill with appropriate data
      if (this.isEmailField(fieldName, fieldLabel, fieldPlaceholder)) {
        data[field.name] = companyInfo.email || process.env.SENDER_EMAIL;
      } else if (this.isNameField(fieldName, fieldLabel, fieldPlaceholder)) {
        if (fieldName.includes('first') || fieldLabel.includes('first')) {
          data[field.name] = companyInfo.firstName || companyInfo.name?.split(' ')[0] || 'John';
        } else if (fieldName.includes('last') || fieldLabel.includes('last')) {
          data[field.name] = companyInfo.lastName || companyInfo.name?.split(' ').slice(1).join(' ') || 'Doe';
        } else {
          data[field.name] = companyInfo.name || process.env.SENDER_NAME || 'John Doe';
        }
      } else if (this.isCompanyField(fieldName, fieldLabel, fieldPlaceholder)) {
        data[field.name] = companyInfo.company || process.env.COMPANY_NAME || 'Vektara Ventures';
      } else if (this.isPhoneField(fieldName, fieldLabel, fieldPlaceholder)) {
        data[field.name] = companyInfo.phone || process.env.SENDER_PHONE || '+1-555-123-4567';
      } else if (this.isMessageField(fieldName, fieldLabel, fieldPlaceholder)) {
        data[field.name] = this.generatePersonalizedMessage(companyInfo);
      } else if (this.isSubjectField(fieldName, fieldLabel, fieldPlaceholder)) {
        data[field.name] = companyInfo.subject || 'Partnership Inquiry - Vektara Ventures';
      } else if (this.isWebsiteField(fieldName, fieldLabel, fieldPlaceholder)) {
        data[field.name] = companyInfo.website || process.env.COMPANY_WEBSITE || 'https://vektaraventures.com';
      } else if (field.type === 'select') {
        // Handle select fields with best guess
        data[field.name] = this.selectBestOption(field, companyInfo);
      }
    }
    
    return data;
  }

  // Field type detection helpers
  isEmailField(name, label, placeholder) {
    return ['email', 'e-mail', 'mail'].some(term => 
      name.includes(term) || label.includes(term) || placeholder.includes(term)
    );
  }

  isNameField(name, label, placeholder) {
    return ['name', 'fullname', 'full_name'].some(term => 
      name.includes(term) || label.includes(term) || placeholder.includes(term)
    );
  }

  isCompanyField(name, label, placeholder) {
    return ['company', 'organization', 'business', 'firm'].some(term => 
      name.includes(term) || label.includes(term) || placeholder.includes(term)
    );
  }

  isPhoneField(name, label, placeholder) {
    return ['phone', 'tel', 'mobile', 'number'].some(term => 
      name.includes(term) || label.includes(term) || placeholder.includes(term)
    );
  }

  isMessageField(name, label, placeholder) {
    return ['message', 'inquiry', 'comment', 'description', 'details'].some(term => 
      name.includes(term) || label.includes(term) || placeholder.includes(term)
    );
  }

  isSubjectField(name, label, placeholder) {
    return ['subject', 'topic', 'regarding'].some(term => 
      name.includes(term) || label.includes(term) || placeholder.includes(term)
    );
  }

  isWebsiteField(name, label, placeholder) {
    return ['website', 'url', 'site', 'web'].some(term => 
      name.includes(term) || label.includes(term) || placeholder.includes(term)
    );
  }

  selectBestOption(field, companyInfo) {
    // This would analyze select options and choose the best match
    // For now, return a default that's likely to work
    return 'general inquiry';
  }

  generatePersonalizedMessage(companyInfo) {
    return `Hello,

I hope this message finds you well. I'm reaching out from ${companyInfo.company || 'Vektara Ventures'} regarding potential partnership opportunities.

We're a ${companyInfo.stage || 'growth-stage'} company focused on ${companyInfo.industry || 'innovative technology solutions'} and believe there could be strong alignment with your investment thesis.

Would you be open to a brief conversation to explore how we might work together?

Best regards,
${companyInfo.name || 'The Team'}`;
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