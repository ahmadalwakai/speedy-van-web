import DOMPurify from 'dompurify';
import logger from '@/services/logger';

/**
 * Sanitize input to prevent XSS attacks
 * @param input - Input string
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  const sanitized = DOMPurify.sanitize(input.trim());
  if (input !== sanitized) {
    logger.warn(`Input sanitized: ${input} -> ${sanitized}`);
  }
  return sanitized;
};