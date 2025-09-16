# Vektara GTM Automation

A comprehensive Go-To-Market automation system built specifically for Vektara Ventures to systematically research, target, and engage with private equity and venture capital firms through intelligent, multi-channel outreach.

## 🚀 Features

### Intelligent Research & Discovery
- **Automated Firm Discovery**: Scrapes and analyzes VC/PE firms from multiple sources
- **Contact Form Detection**: Automatically identifies and analyzes contact forms on firm websites
- **Comprehensive Data Collection**: Gathers firm details, investment focus, contact information, and recent activity
- **Smart Scoring**: AI-powered relevance scoring based on industry alignment, stage fit, and contactability

### Multi-Channel Outreach Automation
- **Email Automation**: Personalized email campaigns with AI-generated content
- **Contact Form Filling**: Automated submission of contact forms with relevant information
- **LinkedIn Integration**: Structured LinkedIn outreach (with proper authentication)
- **Follow-up Sequences**: Intelligent follow-up scheduling based on response patterns

### AI-Powered Personalization
- **Dynamic Message Generation**: Creates personalized outreach messages using OpenAI GPT-4
- **Subject Line Optimization**: Generates multiple subject line options optimized for engagement
- **Response Analysis**: Analyzes responses for sentiment, interest level, and next steps
- **Content Adaptation**: Learns from successful messages to improve future outreach

### Advanced Analytics & Insights
- **Real-time Dashboard**: Comprehensive analytics on outreach performance and firm engagement
- **Conversion Tracking**: Full funnel analysis from initial contact to meeting booking
- **Performance Insights**: Detailed breakdowns by firm type, campaign, and message variations
- **Predictive Scoring**: AI-powered predictions for likely responders and meeting opportunities

## 🛠 Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: OpenAI GPT-4 for content generation and analysis
- **Web Automation**: Puppeteer for web scraping and form automation
- **Email**: Nodemailer with SMTP integration
- **Scheduling**: Cron jobs for automated campaigns
- **Security**: JWT authentication, bcrypt password hashing
- **Logging**: Winston for comprehensive logging and monitoring

## 📦 Installation

1. **Clone and Navigate**
   ```bash
   cd vektara-gtm-automation
   npm install
   ```

2. **Setup Configuration**
   ```bash
   npm run setup
   ```
   Follow the interactive setup to create admin user and configuration.

3. **Configure Environment**
   Update the generated `.env` file with your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. **Start the System**
   ```bash
   npm start
   ```

## 🎯 Quick Start Guide

### 1. Initial Setup
```bash
# Install dependencies
npm install

# Run interactive setup
npm run setup

# Start the server
npm start
```

### 2. Research Firms
```bash
# Research VC firms in SF focusing on AI
npm run research --type vc --location "San Francisco" --focus ai --limit 25

# Research PE firms with minimum score threshold
npm run research --type pe --min-score 80 --limit 50
```

### 3. Run Outreach Campaign
```bash
# Start targeted email campaign (dry run)
npm run outreach --template initial_outreach --focus ai,fintech --max-firms 10

# Execute real campaign (requires --confirm)
npm run outreach --template initial_outreach --focus ai,fintech --max-firms 10 --confirm
```

### 4. Analyze Results
```bash
# Generate comprehensive analytics report
npm run analyze

# Analyze specific time period
npm run analyze --period 7
```

## 📊 API Endpoints

### Firms Management
- `GET /api/firms` - List all firms with filtering
- `POST /api/firms/research` - Start new firm research
- `GET /api/firms/:id` - Get firm details
- `PUT /api/firms/:id` - Update firm information
- `POST /api/firms/:id/analyze-contact-form` - Analyze firm's contact form

### Outreach Campaigns
- `GET /api/outreach` - List outreach records
- `POST /api/outreach/campaign` - Start new campaign
- `POST /api/outreach/send` - Send individual outreach
- `PUT /api/outreach/:id/status` - Update outreach status
- `POST /api/outreach/:id/response` - Record response

### Analytics & Insights
- `GET /api/analytics/dashboard` - Comprehensive dashboard data
- `GET /api/analytics/funnel` - Conversion funnel metrics
- `GET /api/analytics/trends` - Performance trends over time
- `GET /api/analytics/firms/performance` - Firm-specific performance data

### Automation Control
- `POST /api/outreach/automation/trigger/:task` - Manual trigger scheduled tasks
- `GET /api/outreach/automation/status` - Get automation status

## ⚙️ Configuration Options

### Research Configuration
```javascript
const researchCriteria = {
  type: ['vc', 'pe', 'family_office', 'corporate_vc'],
  focusAreas: ['ai', 'fintech', 'healthcare', 'enterprise'],
  location: 'San Francisco',
  maxFirms: 50,
  minScore: 70
};
```

### Outreach Configuration
```javascript
const outreachCriteria = {
  templateType: 'initial_outreach',
  campaignName: 'Q1 AI Focus Campaign',
  minScore: 75,
  maxFirms: 25,
  companyStage: 'Series A',
  valueProposition: 'AI-powered productivity platform'
};
```

### Automation Schedule
- **Daily Research**: 9:00 AM - Discover new firms
- **Daily Outreach**: 10:00 AM - Execute campaigns
- **Follow-up Processing**: 2:00 PM - Process responses and send follow-ups
- **Weekly Analytics**: Monday 9:00 AM - Generate performance reports

## 🔒 Security & Compliance

### Data Protection
- Encrypted password storage with bcrypt
- JWT-based authentication
- Rate limiting to prevent abuse
- Secure API key management

### Email Compliance
- Built-in unsubscribe handling
- Deliverability best practices
- SPF/DKIM configuration support
- Bounce and complaint processing

### Privacy Considerations
- GDPR-compliant data handling
- Opt-out mechanism implementation
- Data retention policies
- Audit trail logging

## 📈 Performance Optimization

### Rate Limiting
- Maximum 50 outreach attempts per day (configurable)
- 5-second delays between requests
- Exponential backoff for failed requests
- Intelligent retry mechanisms

### Scalability Features
- Database indexing for fast queries
- Parallel processing for bulk operations
- Caching for frequently accessed data
- Background job processing

## 🎛 Advanced Features

### AI-Powered Scoring
The system uses multiple factors to score firms:
- **Relevance Score (40%)**: Industry alignment, investment thesis match
- **Contactability Score (30%)**: Available contact methods, decision maker access
- **Timing Score (30%)**: Recent activity, investment cycles, market timing

### Multi-Channel Coordination
- Prevents duplicate outreach across channels
- Coordinates timing for maximum impact
- Tracks engagement across all touchpoints
- Optimizes channel selection per firm

### Learning & Adaptation
- Learns from successful message patterns
- Adapts timing based on response data
- Improves scoring models over time
- Personalizes approaches per firm type

## 🔧 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Ensure MongoDB is running
sudo systemctl start mongod

# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/vektara-gtm
```

**Email Sending Failures**
```bash
# Verify email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password  # Use app password, not regular password
```

**Puppeteer Issues**
```bash
# Install required dependencies
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2
```

### Debug Mode
```bash
# Run with debug logging
DEBUG=* npm start

# Check logs
tail -f logs/combined.log
```

## 📝 Example Workflows

### Workflow 1: New Market Research
```bash
# 1. Research fintech-focused VCs in NYC
npm run research --type vc --location "New York" --focus fintech --limit 30

# 2. Analyze top prospects
npm run analyze --period 1

# 3. Launch targeted campaign
npm run outreach --focus fintech --min-score 80 --template initial_outreach --confirm
```

### Workflow 2: Follow-up Campaign
```bash
# 1. Analyze response patterns
npm run analyze --period 14

# 2. Send follow-ups to non-responders
npm run outreach --template follow_up --min-score 70 --confirm

# 3. Track results
npm run analyze --period 7
```

## 🤝 Contributing

This system is designed for Vektara Ventures' specific needs but can be adapted for other companies:

1. **Customize Firm Criteria**: Modify research parameters in `src/services/researchService.js`
2. **Update Message Templates**: Edit templates in `src/services/outreachService.js`
3. **Add New Sources**: Extend research sources in research service
4. **Custom Scoring**: Modify scoring algorithms in AI service

## 📄 License

MIT License - See LICENSE file for details.

## 🆘 Support

For questions or issues:
1. Check the troubleshooting section above
2. Review logs in the `logs/` directory
3. Use the analytics dashboard to identify issues
4. Contact the development team

---

**Built with ❤️ for Vektara Ventures GTM Success**