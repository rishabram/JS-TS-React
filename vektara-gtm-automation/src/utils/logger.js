const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for logs
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'vektara-gtm' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 10
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10
    }),
    // Write automation-specific logs
    new winston.transports.File({
      filename: path.join(logsDir, 'automation.log'),
      level: 'info',
      format: winston.format.combine(
        winston.format.label({ label: 'automation' }),
        logFormat
      ),
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
      })
    )
  }));
}

// Helper methods for specific log types
logger.automation = (message, meta = {}) => {
  logger.info(message, { label: 'automation', ...meta });
};

logger.outreach = (message, meta = {}) => {
  logger.info(message, { label: 'outreach', ...meta });
};

logger.research = (message, meta = {}) => {
  logger.info(message, { label: 'research', ...meta });
};

logger.performance = (message, meta = {}) => {
  logger.info(message, { label: 'performance', ...meta });
};

module.exports = logger;