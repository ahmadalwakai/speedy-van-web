import axios from 'axios';
import logger from '@/services/logger';

/**
 * Calculate ETA using Google Maps Directions API
 * @param start - Starting coordinates [lat, lng]
 * @param end - Ending coordinates [lat, lng]
 * @returns Estimated time of arrival
 */
export const getETA = async (start: [number, number], end: [number, number]): Promise<string> => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${start[0]},${start[1]}&destination=${end[0]},${end[1]}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    const duration = response.data.routes[0]?.legs[0]?.duration.text;
    logger.info(`ETA calculated: ${duration}`);
    return duration || 'Unknown';
  } catch (error) {
    logger.error(`Error calculating ETA: ${error}`);
    throw new Error('Failed to calculate ETA');
  }
};