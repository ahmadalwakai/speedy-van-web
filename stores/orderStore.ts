import { create } from 'zustand';
import api from '@/services/api';
import { Order } from '@/types';
import { sanitizeInput } from '@/utils/sanitize';
import logger from '@/services/logger';

/**
 * Order store using Zustand
 */
interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  createOrder: (orderData: {
    username: string;
    pickupLocations: string[];
    dropoffLocations: string[];
    packageTypes: string[];
    paymentIntentId: string;
  }) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  fetchOrders: (username: string, page: number, limit: number) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  loading: false,
  error: null,
  createOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      const sanitizedData = {
        ...orderData,
        pickupLocations: orderData.pickupLocations.map(sanitizeInput),
        dropoffLocations: orderData.dropoffLocations.map(sanitizeInput),
        packageTypes: orderData.packageTypes.map(sanitizeInput),
      };
      const response = await api.post('/api/orders', sanitizedData);
      set((state) => ({ orders: [...state.orders, response.data], loading: false }));
      logger.info(`Order created: ${response.data.id}`);
    } catch (error) {
      logger.error(`Order creation failed: ${error}`);
      set({ loading: false, error: 'Failed to create order' });
      throw error;
    }
  },
  updateOrderStatus: async (orderId, status) => {
    set({ loading: true, error: null });
    try {
      await api.patch(`/api/orders/${orderId}`, { status });
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        ),
        loading: false,
      }));
      logger.info(`Order status updated: ${orderId} to ${status}`);
    } catch (error) {
      logger.error(`Order status update failed for ${orderId}: ${error}`);
      set({ loading: false, error: 'Failed to update order status' });
      throw error;
    }
  },
  cancelOrder: async (orderId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/api/orders/${orderId}`);
      set((state) => ({
        orders: state.orders.filter((order) => order.id !== orderId),
        loading: false,
      }));
      logger.info(`Order cancelled: ${orderId}`);
    } catch (error) {
      logger.error(`Order cancellation failed for ${orderId}: ${error}`);
      set({ loading: false, error: 'Failed to cancel order' });
      throw error;
    }
  },
  fetchOrders: async (username, page, limit) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/api/orders?username=${username}&page=${page}&limit=${limit}`);
      set({ orders: response.data, loading: false });
      logger.info(`Orders fetched for user: ${username}, page: ${page}, limit: ${limit}`);
    } catch (error) {
      logger.error(`Order fetch failed for ${username}: ${error}`);
      set({ loading: false, error: 'Failed to fetch orders' });
      throw error;
    }
  },
}));