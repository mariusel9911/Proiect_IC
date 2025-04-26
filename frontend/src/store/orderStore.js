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
            set({ isLoading: true, error: null, message: null });

            const response = await axios.post(
                `${API_URL}/orders`,
                orderData,
                { withCredentials: true }
            );

            if (response.data.success) {
                set({
                    currentOrder: response.data.order,
                    isLoading: false,
                    message: 'Order created successfully'
                });
                return response.data.order;
            }
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to create order'
            });
            return null;
        }
    },

    // Fetch user's orders
    fetchUserOrders: async () => {
        try {
            set({ isLoading: true, error: null });

            const response = await axios.get(
                `${API_URL}/orders/my-orders`,
                { withCredentials: true }
            );

            if (response.data.success) {
                set({
                    orders: response.data.orders,
                    isLoading: false,
                    error: null
                });
                return response.data.orders;
            }
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to fetch orders'
            });
            return [];
        }
    },

    // Fetch a single order by ID
    fetchOrderById: async (orderId) => {
        try {
            set({ isLoading: true, error: null });

            const response = await axios.get(
                `${API_URL}/orders/${orderId}`,
                { withCredentials: true }
            );

            if (response.data.success) {
                set({
                    currentOrder: response.data.order,
                    isLoading: false,
                    error: null
                });
                return response.data.order;
            }
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to fetch order'
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
                const updatedOrders = get().orders.map(order =>
                    order._id === orderId ? response.data.order : order
                );

                set({
                    orders: updatedOrders,
                    currentOrder: response.data.order,
                    isLoading: false,
                    message: 'Order status updated successfully'
                });
                return response.data.order;
            }
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to update order status'
            });
            return null;
        }
    },

    // Cancel order
    cancelOrder: async (orderId) => {
        try {
            set({ isLoading: true, error: null, message: null });

            const response = await axios.put(
                `${API_URL}/orders/${orderId}/cancel`,
                {},
                { withCredentials: true }
            );

            if (response.data.success) {
                // Update the order in the orders list
                const updatedOrders = get().orders.map(order =>
                    order._id === orderId ? response.data.order : order
                );

                set({
                    orders: updatedOrders,
                    currentOrder: response.data.order,
                    isLoading: false,
                    message: 'Order cancelled successfully'
                });
                return response.data.order;
            }
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to cancel order'
            });
            return null;
        }
    },

    // Update payment status
    updatePaymentStatus: async (orderId, paymentStatus) => {
        try {
            set({ isLoading: true, error: null, message: null });

            const response = await axios.put(
                `${API_URL}/orders/${orderId}/payment`,
                { paymentStatus },
                { withCredentials: true }
            );

            if (response.data.success) {
                // Update the order in the orders list
                const updatedOrders = get().orders.map(order =>
                    order._id === orderId ? response.data.order : order
                );

                set({
                    orders: updatedOrders,
                    currentOrder: response.data.order,
                    isLoading: false,
                    message: 'Payment status updated successfully'
                });
                return response.data.order;
            }
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to update payment status'
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
    }
}));