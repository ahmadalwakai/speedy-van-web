// services/logger.ts
let logger: any = null;

if (typeof window === 'undefined') {
  const winston = require('winston');
  logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ level, message, timestamp }) => {
        return `[${timestamp}] ${level}: ${message}`;
      })
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
  });
} else {
  logger = {
    info: () => {},
    error: () => {},
    warn: () => {},
    debug: () => {},
  };
}

export default logger;
