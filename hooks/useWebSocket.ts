import { useEffect, useState } from 'react';
import logger from '@/services/logger';

/**
 * Hook for handling WebSocket connections
 * @param url - WebSocket URL
 * @returns Data received from WebSocket
 */
export const useWebSocket = (url: string) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    ws.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setData(parsedData);
        logger.info(`WebSocket data received: ${JSON.stringify(parsedData)}`);
      } catch (error) {
        logger.error(`WebSocket data parsing error: ${error}`);
      }
    };
    ws.onerror = (error) => {
      logger.error(`WebSocket error: ${error}`);
    };
    ws.onopen = () => {
      logger.info(`WebSocket connected to ${url}`);
    };
    return () => {
      ws.close();
      logger.info(`WebSocket disconnected from ${url}`);
    };
  }, [url]);

  return data;
};