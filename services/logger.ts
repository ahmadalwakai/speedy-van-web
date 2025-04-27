// services/logger.ts
import type { Logger } from 'winston';

let logger: Logger | any = null;

if (typeof window === 'undefined') {
  const winston = require('winston');
  logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ level, message, timestamp }: { level: string; message: string; timestamp: string }) => {
        return `[${timestamp}] ${level}: ${message}`;
      })
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
  });
} else {
  // Dummy logger for client-side to avoid errors
  logger = {
    info: () => {},
    error: () => {},
    warn: () => {},
    debug: () => {},
  };
}

export default logger;
