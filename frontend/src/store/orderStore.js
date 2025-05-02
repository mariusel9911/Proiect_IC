import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  message: null,

  // Create a new order
  createOrder: async (orderData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post(`${API_URL}/orders`, orderData, {
        withCredentials: true,
      });

      if (response.data.success) {
        set({
          currentOrder: response.data.order,
          isLoading: false,
          error: null,
        });
        return response.data.order;
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Error creating order',
      });
      throw error; // Throw error to be caught in component
    }
  },

  // Update payment status
  updatePaymentStatus: async (orderId, paymentStatus, paymentDetails = {}) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.put(
        `${API_URL}/orders/${orderId}/payment`,
        { paymentStatus, ...paymentDetails },
        { withCredentials: true }
      );

      if (response.data.success) {
        const updatedOrders = get().orders.map((order) =>
          order._id === orderId ? response.data.order : order
        );
        set({
          orders: updatedOrders,
          currentOrder: response.data.order,
          isLoading: false,
        });
        return response.data.order;
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Payment update failed',
      });
      throw error;
    }
  },

  // Fetch user's orders
  fetchUserOrders: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await axios.get(`${API_URL}/orders/my-orders`, {
        withCredentials: true,
      });

      if (response.data.success) {
        set({
          orders: response.data.orders,
          isLoading: false,
          error: null,
        });
        return response.data.orders;
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch orders',
      });
      return [];
    }
  },

  // In orderStore.js
  fetchOrderById: async (orderId) => {
    try {
      set({ isLoading: true, error: null, message: null }); // Clear messages on fetch

      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        set({
          currentOrder: response.data.order,
          isLoading: false,
          error: null,
        });
        return response.data.order;
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch order',
      });
      return null;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      set({ isLoading: true, error: null, message: null });

      const response = await axios.put(
        `${API_URL}/orders/${orderId}/status`,
        { status },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update the order in the orders list
        const updatedOrders = get().orders.map((order) =>
          order._id === orderId ? response.data.order : order
        );

        set({
          orders: updatedOrders,
          currentOrder: response.data.order,
          isLoading: false,
          message: 'Order status updated successfully',
        });
        return response.data.order;
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to update order status',
      });
      return null;
    }
  },

  // Cancel order
  // In useOrderStore.js cancelOrder action
  cancelOrder: async (orderId) => {
    try {
      set({ isLoading: true, error: null, message: null });

      const response = await axios.put(
        `${API_URL}/orders/${orderId}/cancel`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        const updatedOrders = get().orders.map((order) =>
          order._id === orderId ? response.data.order : order
        );

        set({
          orders: updatedOrders,
          currentOrder: response.data.order,
          isLoading: false,
          message: 'Order cancelled successfully', // This will trigger the toast
        });

        // Clear the message after 2 seconds
        setTimeout(() => {
          set({ message: null });
        }, 2000);

        return response.data.order;
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to cancel order',
      });
      return null;
    }
  },

  // Update payment status
  updatePaymentStatus: async (orderId, paymentStatus, paymentDetails = {}) => {
    try {
      set({ isLoading: true, error: null, message: null });

      const response = await axios.put(
        `${API_URL}/orders/${orderId}/payment`,
        {
          paymentStatus,
          ...paymentDetails,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update the order in the orders list
        const updatedOrders = get().orders.map((order) =>
          order._id === orderId ? response.data.order : order
        );

        set({
          orders: updatedOrders,
          currentOrder: response.data.order,
          isLoading: false,
          message: 'Payment status updated successfully',
        });
        return response.data.order;
      }
    } catch (error) {
      set({
        isLoading: false,
        error:
          error.response?.data?.message || 'Failed to update payment status',
      });
      return null;
    }
  },

  // Clear current order
  clearCurrentOrder: () => {
    set({ currentOrder: null });
  },

  // Clear errors
  clearErrors: () => {
    set({ error: null });
  },

  // Clear messages
  clearMessages: () => {
    set({ message: null });
  },
}));
