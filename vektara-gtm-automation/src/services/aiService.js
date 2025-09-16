const OpenAI = require('openai');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  // Generate personalized outreach message
  async generatePersonalizedMessage(firm, contact, template, context = {}) {
    try {
      const prompt = this.buildPersonalizationPrompt(firm, contact, template, context);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert GTM engineer creating personalized outreach messages for Vektara Ventures. Your messages should be professional, concise, and value-focused. Always include specific details about the recipient\'s firm and recent activities when possible.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      });

      const generatedMessage = response.choices[0].message.content;
      
      // Extract personalization elements used
      const personalizations = this.extractPersonalizations(generatedMessage, firm, contact);

      logger.automation('Generated personalized message', {
        firmName: firm.name,
        contactName: contact?.name,
        messageLength: generatedMessage.length,
        personalizations: personalizations.length
      });

      return {
        content: generatedMessage,
        personalizations,
        confidence: this.calculatePersonalizationConfidence(personalizations, firm, contact)
      };

    } catch (error) {
      logger.error('Failed to generate personalized message', error);
      throw error;
    }
  }

  // Generate subject lines
  async generateSubjectLines(firm, contact, messageContent, count = 5) {
    try {
      const prompt = `
        Generate ${count} compelling email subject lines for this outreach message to ${firm.name}:
        
        Firm: ${firm.name}
        Type: ${firm.type}
        Focus Areas: ${firm.focusAreas?.join(', ') || 'N/A'}
        Contact: ${contact?.name || 'Team'}
        
        Message excerpt: "${messageContent.substring(0, 200)}..."
        
        Requirements:
        - 6-10 words maximum
        - Personalized when possible
        - Professional but engaging
        - Avoid spam triggers
        - Include value proposition hint
        
        Return as numbered list.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.8
      });

      const subjectLines = response.choices[0].message.content
        .split('\n')
        .filter(line => line.trim() && /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim());

      return subjectLines;

    } catch (error) {
      logger.error('Failed to generate subject lines', error);
      return [`Partnership opportunity with ${firm.name}`];
    }
  }

  // Analyze response sentiment and extract information
  async analyzeResponse(responseText, originalMessage) {
    try {
      const prompt = `
        Analyze this email response to determine sentiment and extract key information:
        
        Original message: "${originalMessage.substring(0, 300)}..."
        Response: "${responseText}"
        
        Return JSON with:
        {
          "sentiment": {
            "score": number (-1 to 1),
            "label": "positive|negative|neutral"
          },
          "isInterested": boolean,
          "meetingRequested": boolean,
          "concerns": [array of strings],
          "nextSteps": "string description",
          "autoReply": boolean
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.3
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      
      logger.automation('Analyzed response', {
        sentiment: analysis.sentiment.label,
        isInterested: analysis.isInterested,
        meetingRequested: analysis.meetingRequested
      });

      return analysis;

    } catch (error) {
      logger.error('Failed to analyze response', error);
      return {
        sentiment: { score: 0, label: 'neutral' },
        isInterested: false,
        meetingRequested: false,
        concerns: [],
        nextSteps: 'Manual review required',
        autoReply: false
      };
    }
  }

  // Generate follow-up message based on response
  async generateFollowUp(originalMessage, response, analysis, firm, contact) {
    try {
      const prompt = `
        Generate a follow-up message based on this conversation:
        
        Original message: "${originalMessage}"
        Their response: "${response}"
        Analysis: ${JSON.stringify(analysis)}
        
        Firm: ${firm.name} (${firm.type})
        Contact: ${contact?.name || 'Team'}
        
        Requirements:
        - Address their specific response
        - ${analysis.isInterested ? 'Build on their interest' : 'Address concerns professionally'}
        - ${analysis.meetingRequested ? 'Propose specific meeting times' : 'Provide more value'}
        - Keep it concise (under 150 words)
        - Maintain professional tone
      `;

      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.7
      });

      return aiResponse.choices[0].message.content;

    } catch (error) {
      logger.error('Failed to generate follow-up message', error);
      throw error;
    }
  }

  // Score firm fit and timing
  async scoreFirmFit(firm, companyProfile) {
    try {
      const prompt = `
        Score this VC/PE firm for fit with our company (0-100):
        
        Our Company: ${companyProfile.name}
        Stage: ${companyProfile.stage}
        Industry: ${companyProfile.industry}
        Focus: ${companyProfile.description}
        
        Firm: ${firm.name}
        Type: ${firm.type}
        Focus Areas: ${firm.focusAreas?.join(', ') || 'Unknown'}
        Stage: ${firm.stage || 'Unknown'}
        Recent Investments: ${firm.recentInvestments?.length || 0}
        
        Consider:
        - Industry alignment
        - Stage fit
        - Investment thesis match
        - Recent activity
        - Geographic preferences
        
        Return JSON:
        {
          "score": number,
          "reasoning": "brief explanation",
          "strengths": [array],
          "concerns": [array]
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content);

    } catch (error) {
      logger.error('Failed to score firm fit', error);
      return {
        score: 50,
        reasoning: 'Unable to analyze fit',
        strengths: [],
        concerns: ['Analysis failed']
      };
    }
  }

  // Build personalization prompt
  buildPersonalizationPrompt(firm, contact, template, context) {
    return `
      Create a personalized outreach message using this information:
      
      RECIPIENT FIRM:
      - Name: ${firm.name}
      - Type: ${firm.type}
      - Focus Areas: ${firm.focusAreas?.join(', ') || 'Unknown'}
      - Location: ${firm.location?.city || 'Unknown'}, ${firm.location?.state || ''}
      - Recent Investments: ${firm.recentInvestments?.slice(0, 3).map(inv => inv.company).join(', ') || 'None available'}
      - Website: ${firm.website}
      
      CONTACT:
      - Name: ${contact?.name || 'Team'}
      - Title: ${contact?.title || 'Unknown'}
      - Decision Maker: ${contact?.isDecisionMaker ? 'Yes' : 'No'}
      
      OUR COMPANY (Vektara Ventures):
      - Stage: ${context.companyStage || 'Growth stage'}
      - Industry: ${context.industry || 'Technology'}
      - Value Proposition: ${context.valueProposition || 'Innovative technology solutions'}
      - Recent Milestones: ${context.recentMilestones || 'Strong growth metrics'}
      
      MESSAGE TEMPLATE:
      ${template}
      
      REQUIREMENTS:
      - Personalize with specific firm details
      - Reference recent investments or focus areas when relevant
      - Keep under 200 words
      - Include clear call-to-action
      - Professional but warm tone
      - Avoid generic language
      - Include specific reason for reaching out
      
      Generate the personalized message:
    `;
  }

  // Extract personalizations used in message
  extractPersonalizations(message, firm, contact) {
    const personalizations = [];
    
    // Check for firm name usage
    if (message.includes(firm.name)) {
      personalizations.push({
        field: 'firm_name',
        value: firm.name,
        confidence: 1.0
      });
    }

    // Check for contact name
    if (contact?.name && message.includes(contact.name)) {
      personalizations.push({
        field: 'contact_name',
        value: contact.name,
        confidence: 1.0
      });
    }

    // Check for focus areas
    if (firm.focusAreas) {
      firm.focusAreas.forEach(area => {
        if (message.toLowerCase().includes(area.toLowerCase())) {
          personalizations.push({
            field: 'focus_area',
            value: area,
            confidence: 0.8
          });
        }
      });
    }

    // Check for location
    if (firm.location?.city && message.includes(firm.location.city)) {
      personalizations.push({
        field: 'location',
        value: firm.location.city,
        confidence: 0.7
      });
    }

    // Check for recent investments
    if (firm.recentInvestments) {
      firm.recentInvestments.forEach(investment => {
        if (message.includes(investment.company)) {
          personalizations.push({
            field: 'recent_investment',
            value: investment.company,
            confidence: 0.9
          });
        }
      });
    }

    return personalizations;
  }

  // Calculate personalization confidence score
  calculatePersonalizationConfidence(personalizations, firm, contact) {
    if (personalizations.length === 0) return 0.2;

    const totalConfidence = personalizations.reduce((sum, p) => sum + p.confidence, 0);
    const avgConfidence = totalConfidence / personalizations.length;
    
    // Bonus for having multiple types of personalization
    const typeBonus = Math.min(personalizations.length * 0.1, 0.3);
    
    // Bonus for decision maker contact
    const contactBonus = contact?.isDecisionMaker ? 0.1 : 0;

    return Math.min(avgConfidence + typeBonus + contactBonus, 1.0);
  }

  // Generate automated contact form filling data
  async generateFormData(firm, formFields, context) {
    try {
      const prompt = `
        Generate data to fill a contact form for ${firm.name}:
        
        Form fields: ${JSON.stringify(formFields)}
        
        Our info:
        - Company: Vektara Ventures
        - Contact: ${context.senderName || process.env.SENDER_NAME}
        - Email: ${context.senderEmail || process.env.SENDER_EMAIL}
        - Phone: ${context.senderPhone || process.env.SENDER_PHONE}
        - Website: ${context.companyWebsite || process.env.COMPANY_WEBSITE}
        
        Generate appropriate values for each field. For message/inquiry fields, 
        create a brief professional message (2-3 sentences) expressing interest 
        in partnership opportunities.
        
        Return JSON mapping field names to values.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.5
      });

      return JSON.parse(response.choices[0].message.content);

    } catch (error) {
      logger.error('Failed to generate form data', error);
      throw error;
    }
  }
}

module.exports = new AIService();