# 🚀 Vektara GTM Automation - Complete Setup Guide

This guide will walk you through setting up the Vektara GTM automation system step-by-step to automatically find and contact VC, PE, and IB firms.

## 📋 Prerequisites

Before starting, make sure you have:
- Node.js (version 16 or higher)
- MongoDB (local or cloud instance)
- OpenAI API key (for AI-powered messaging)
- Email account with app password (Gmail recommended)
- Ubuntu/Debian system (for browser automation)

## 🛠 Step 1: Initial Installation

```bash
# Navigate to the project directory
cd vektara-gtm-automation

# Install dependencies (this will skip browser download initially)
npm install

# Install Chrome browser for web automation
npm run install-browser

# Run quick setup
npm run quick-start
```

## ⚙️ Step 2: Configuration

### A. Create Admin Account
The setup script will prompt you to create an admin account:
```bash
npm run setup
```
Follow the prompts to enter:
- Admin username
- Email address  
- Password
- Confirm password

### B. Configure Environment Variables
Edit the `.env` file that was created:

```bash
# Copy the example file
cp .env.example .env

# Edit with your settings
nano .env
```

**Required Configuration:**
```env
# OpenAI API (Required for AI features)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Email Configuration (Required for email outreach)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Company Information (Used in outreach messages)
COMPANY_NAME=Vektara Ventures
COMPANY_WEBSITE=https://vektaraventures.com
SENDER_NAME=Your Name
SENDER_EMAIL=your_email@vektaraventures.com
SENDER_PHONE=+1-555-123-4567
SENDER_LINKEDIN=https://linkedin.com/in/yourprofile

# Database (MongoDB)
MONGODB_URI=mongodb://localhost:27017/vektara-gtm
```

### C. Gmail App Password Setup
1. Go to Google Account settings
2. Enable 2-factor authentication
3. Generate an App Password for "Mail"
4. Use this app password in the `EMAIL_PASS` field

## 🧪 Step 3: Validation

Verify everything is working:
```bash
npm run validate
```

This will check:
- ✅ File structure
- ✅ Dependencies 
- ✅ Browser installation
- ✅ Database connection
- ✅ API configurations

## 🔍 Step 4: Research Firms

Now you can start finding VC, PE, and IB firms:

### Basic Research
```bash
# Find 25 VC firms focused on AI
npm run research --type vc --focus ai --limit 25

# Find PE firms in San Francisco  
npm run research --type pe --location "San Francisco" --limit 20

# Find investment banks
npm run research --type ib --limit 15
```

### Advanced Research Options
```bash
# Multiple criteria
npm run research --type vc,pe --focus ai,fintech --location "New York" --limit 30

# All available options:
# --type: vc, pe, ib, family_office, corporate_vc
# --focus: ai, fintech, healthcare, enterprise, consumer, biotech, climate, crypto
# --location: any city/region
# --limit: number of firms to find (default: 50)
```

## 📧 Step 5: Launch Outreach Campaigns

### Test Campaign (Recommended First)
```bash
# Small test campaign (5 firms)
npm run outreach --template initial_outreach --focus ai --max-firms 5 --confirm
```

### Production Campaigns  
```bash
# AI-focused VC outreach
npm run outreach --template initial_outreach --type vc --focus ai --max-firms 15 --confirm

# Custom campaign with specific message
npm run outreach --template initial_outreach --focus fintech --value-prop "Revolutionary AI-powered financial platform" --max-firms 20 --confirm
```

**Campaign Options:**
- `--template`: initial_outreach, follow_up, meeting_request
- `--type`: vc, pe, ib (firm type filter)  
- `--focus`: ai, fintech, etc. (focus area filter)
- `--max-firms`: maximum number of firms to contact
- `--min-score`: minimum firm relevance score (0-100)
- `--value-prop`: your value proposition text
- `--confirm`: REQUIRED flag to send real messages

## 📊 Step 6: Monitor Results

### View Analytics
```bash
# Comprehensive analytics report
npm run analyze

# Specific time period
npm run analyze --period 7    # Last 7 days
npm run analyze --period 30   # Last 30 days
```

### Web Dashboard
Start the server and visit the web dashboard:
```bash
npm start
```
Then open: http://localhost:3000

## 🔄 Step 7: Automated Scheduling

The system includes automated tasks that run daily:

- **9:00 AM**: Research new firms
- **10:00 AM**: Send outreach campaigns  
- **2:00 PM**: Process follow-ups
- **Monday 9:00 AM**: Weekly analytics report

To manually trigger any task:
```bash
# Manual research
npm run research

# Manual outreach  
npm run outreach --confirm

# Manual analytics
npm run analyze
```

## 🎯 Advanced Features

### Contact Form Auto-Filling
The system automatically:
1. Detects contact forms on firm websites
2. Analyzes form fields and requirements
3. Fills forms with your company information  
4. Submits forms with personalized messages

### AI-Powered Personalization
Every message is uniquely generated using:
- Firm-specific information (focus areas, recent investments)
- Your company details and value proposition
- Industry-relevant talking points
- Professional tone and structure

### Multi-Channel Coordination
The system coordinates outreach across:
- Email campaigns
- Contact form submissions
- LinkedIn messaging (with authentication)
- Phone outreach (tracking only)

## 🔧 Troubleshooting

### Common Issues

**Browser Installation Failed:**
```bash
# Manual Chrome installation
sudo apt-get update
sudo apt-get install -y google-chrome-stable

# Or download directly
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
```

**MongoDB Connection Error:**
```bash
# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env with your Atlas connection string
```

**Email Sending Failed:**
- Verify Gmail app password is correct
- Check that 2FA is enabled on Gmail
- Ensure EMAIL_USER and EMAIL_PASS are set correctly

**Research Finds No Firms:**
- Check internet connection
- Verify browser installation with `npm run install-browser`
- Try broader search criteria

### Debug Mode
```bash
# Run with debug logging
DEBUG=* npm start

# Check log files
tail -f logs/combined.log
tail -f logs/automation.log
```

## 📞 Support

If you encounter issues:

1. **Check Logs**: Look in the `logs/` directory for error details
2. **Validate System**: Run `npm run validate` to check configuration
3. **Review Settings**: Verify all environment variables in `.env`
4. **Test Components**: Try individual scripts (research, outreach) separately

## 🎉 Success Metrics

After setup, you should see:
- ✅ Firms being discovered and scored
- ✅ Contact forms detected and analyzed  
- ✅ Personalized messages generated
- ✅ Outreach campaigns executing successfully
- ✅ Analytics showing campaign performance

**Expected Results:**
- 20-50 new firms discovered per research run
- 60-80% contact form detection rate
- 5-15% response rate on outreach campaigns
- 1-3% meeting booking rate

Ready to revolutionize your GTM outreach! 🚀