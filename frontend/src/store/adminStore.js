import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAdminStore = create((set, get) => ({
  // Services
  services: [],
  currentService: null,

  // Providers
  providers: [],
  currentProvider: null,

  // Users
  users: [],
  currentUser: null,

  // Orders
  adminOrders: [],
  currentOrder: null,

  // Common state
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },

  // Set pagination
  setPagination: (newPagination) => {
    set({ pagination: { ...get().pagination, ...newPagination } });
  },

  // Service Actions
  fetchServices: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await axios.get(`${API_URL}/services`);

      if (response.data.success) {
        set({
          services: response.data.services || [],
          isLoading: false,
          error: null,
        });
        return response.data.services;
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to load services',
        services: [],
      });
      return [];
    }
  },
  // In adminStore.js - update the createService function
  createService: async (serviceData) => {
    try {
      set({ isLoading: true, error: null });

      console.log('Sending service data to API:', serviceData);

      const response = await axios.post(`${API_URL}/services`, serviceData, {
        withCredentials: true,
      });

      if (response.data.success) {
        // Update services list with the new service
        const updatedServices = [...get().services, response.data.service];
        set({
          services: updatedServices,
          isLoading: false,
          error: null,
        });
        return response.data.service;
      }
    } catch (error) {
      console.error('Error creating service:', error);
      console.error('Error response:', error.response?.data);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to create service',
      });
      throw error;
    }
  },

  updateService: async (serviceId, serviceData) => {
    try {
      set({ isLoading: true, error: null });

      const response = await axios.put(
        `${API_URL}/services/${serviceId}`,
        serviceData,
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update service in the services list
        const updatedServices = get().services.map((service) =>
          service._id === serviceId ? response.data.service : service
        );

        set({
          services: updatedServices,
          currentService: response.data.service,
          isLoading: false,
          error: null,
        });
        return response.data.service;
      }
    } catch (error) {
      console.error('Error updating service:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to update service',
      });
      throw error;
    }
  },

  deleteService: async (serviceId) => {
    try {
      set({ isLoading: true, error: null });

      const response = await axios.delete(`${API_URL}/services/${serviceId}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        // Remove service from services list
        const updatedServices = get().services.filter(
          (service) => service._id !== serviceId
        );

        set({
          services: updatedServices,
          isLoading: false,
          error: null,
        });
        return true;
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to delete service',
      });
      throw error;
    }
  },

  // Provider Actions
  fetchProviders: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await axios.get(`${API_URL}/providers`);

      if (response.data.success) {
        set({
          providers: response.data.providers || [],
          isLoading: false,
          error: null,
        });
        return response.data.providers;
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to load providers',
        providers: [],
      });
      return [];
    }
  },

  createProvider: async (providerData) => {
    try {
      set({ isLoading: true, error: null });

      const response = await axios.post(`${API_URL}/providers`, providerData, {
        withCredentials: true,
      });

      if (response.data.success) {
        // Update providers list with the new provider
        const updatedProviders = [...get().providers, response.data.provider];
        set({
          providers: updatedProviders,
          isLoading: false,
          error: null,
        });
        return response.data.provider;
      }
    } catch (error) {
      console.error('Error creating provider:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to create provider',
      });
      throw error;
    }
  },

  updateProvider: async (providerId, providerData) => {
    try {
      set({ isLoading: true, error: null });

      const response = await axios.put(
        `${API_URL}/providers/${providerId}`,
        providerData,
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update provider in the providers list
        const updatedProviders = get().providers.map((provider) =>
          provider._id === providerId ? response.data.provider : provider
        );

        set({
          providers: updatedProviders,
          currentProvider: response.data.provider,
          isLoading: false,
          error: null,
        });
        return response.data.provider;
      }
    } catch (error) {
      console.error('Error updating provider:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to update provider',
      });
      throw error;
    }
  },

  deleteProvider: async (providerId) => {
    try {
      set({ isLoading: true, error: null });

      const response = await axios.delete(
        `${API_URL}/providers/${providerId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        // Remove provider from providers list
        const updatedProviders = get().providers.filter(
          (provider) => provider._id !== providerId
        );

        set({
          providers: updatedProviders,
          isLoading: false,
          error: null,
        });
        return true;
      }
    } catch (error) {
      console.error('Error deleting provider:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to delete provider',
      });
      throw error;
    }
  },

  // User Management Actions
  fetchUsers: async () => {
    try {
      const { pagination } = get();
      set({ isLoading: true, error: null });

      const response = await axios.get(
        `${API_URL}/users/admin?page=${pagination.page}&limit=${pagination.limit}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        set({
          users: response.data.users || [],
          pagination: response.data.pagination || pagination,
          isLoading: false,
          error: null,
        });
        return response.data.users;
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to load users',
        users: [],
      });
      return [];
    }
  },

  updateUser: async (userId, userData) => {
    try {
      set({ isLoading: true, error: null });

      const response = await axios.put(
        `${API_URL}/users/admin/${userId}`,
        userData,
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update user in the users list
        const updatedUsers = get().users.map((user) =>
          user._id === userId ? response.data.user : user
        );

        set({
          users: updatedUsers,
          currentUser: response.data.user,
          isLoading: false,
          error: null,
        });
        return response.data.user;
      }
    } catch (error) {
      console.error('Error updating user:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to update user',
      });
      throw error;
    }
  },

  // Admin Order Management
  fetchAdminOrders: async (statusFilter = 'all') => {
    try {
      const { pagination } = get();
      set({ isLoading: true, error: null });

      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      });

      if (statusFilter !== 'all') {
        queryParams.append('status', statusFilter);
      }

      const response = await axios.get(
        `${API_URL}/orders/admin/all?${queryParams.toString()}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        set({
          adminOrders: response.data.orders || [],
          pagination: response.data.pagination || pagination,
          isLoading: false,
          error: null,
        });
        return response.data.orders;
      }
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to load orders',
        adminOrders: [],
      });
      return [];
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      set({ isLoading: true, error: null });

      const response = await axios.put(
        `${API_URL}/orders/${orderId}/status`,
        { status },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update order in the orders list
        const updatedOrders = get().adminOrders.map((order) =>
          order._id === orderId ? response.data.order : order
        );

        set({
          adminOrders: updatedOrders,
          currentOrder: response.data.order,
          isLoading: false,
          error: null,
        });
        return response.data.order;
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to update order status',
      });
      throw error;
    }
  },

  // Common actions
  setCurrentItem: (itemType, item) => {
    switch (itemType) {
      case 'service':
        set({ currentService: item });
        break;
      case 'provider':
        set({ currentProvider: item });
        break;
      case 'user':
        set({ currentUser: item });
        break;
      case 'order':
        set({ currentOrder: item });
        break;
      default:
        console.error('Unknown item type:', itemType);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
