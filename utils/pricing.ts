import logger from '@/services/logger';

export async function calculatePrice({ distance, items, workers }: { distance: number; items: { type: string; size: string; quantity: number }[]; workers: number }) {
  try {
    logger.info('Calculating price with inputs:', { distance, items, workers });

    const basePrice = 20;
    const distanceCost = distance * 1.5;
    const itemCost = items.reduce((sum, item) => {
      if (!item.type || !item.size) {
        logger.warn('Invalid item detected:', item);
        return sum;
      }
      return sum + item.quantity * 10;
    }, 0);
    const workerCost = workers * 15;

    const total = basePrice + distanceCost + itemCost + workerCost;

    if (total <= 0) {
      logger.error('Calculated total price is invalid:', { total, basePrice, distanceCost, itemCost, workerCost });
      throw new Error('Invalid total price calculated');
    }

    logger.info('Price calculation details:', { basePrice, distanceCost, itemCost, workerCost, total });
    return { total, details: { basePrice, distanceCost, itemCost, workerCost } };
  } catch (error) {
    logger.error('Error in calculatePrice:', error);
    throw error;
  }
}