import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useServiceStore = create((set, get) => ({
  services: [],
  currentService: null,
  isLoading: false,
  error: null,

  // Fetch all services (for homepage)
  fetchServices: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await axios.get(`${API_URL}/services`);

      if (response.data.success) {
        set({
          services: response.data.services,
          isLoading: false,
          error: null,
        });
        return response.data.services;
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch services',
        services: [],
      });
      return [];
    }
  },

  // Fetch a single service by ID
  fetchServiceById: async (serviceId) => {
    try {
      set({ isLoading: true, error: null });

      const response = await axios.get(`${API_URL}/services/${serviceId}`);

      if (response.data.success) {
        set({
          currentService: response.data.service,
          isLoading: false,
          error: null,
        });
        return response.data.service;
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch service',
      });
      return null;
    }
  },

  // Search services
  searchServices: async (query) => {
    if (!query || !query.trim()) {
      // If query is empty, just fetch all services
      return get().fetchServices();
    }

    try {
      set({ isLoading: true, error: null });

      // First try to use the API search endpoint if it exists
      try {
        const response = await axios.get(
          `${API_URL}/services/search?query=${encodeURIComponent(query)}`
        );

        if (response.data.success) {
          set({
            services: response.data.services,
            isLoading: false,
            error: null,
          });
          return response.data.services;
        }
      } catch (apiError) {
        console.log(
          'API search endpoint not available, falling back to client-side search'
        );

        // If API search fails, fall back to client-side filtering
        // First make sure we have services loaded
        let services = get().services;
        if (!services.length) {
          // If no services loaded yet, fetch them all first
          services = await get().fetchServices();
        }

        // Now filter services client-side
        const filteredServices = services.filter(
          (service) =>
            service.name.toLowerCase().includes(query.toLowerCase()) ||
            service.description.toLowerCase().includes(query.toLowerCase()) ||
            service.type.toLowerCase().includes(query.toLowerCase())
        );

        set({
          isLoading: false,
          error: null,
          // Don't update the main services array when doing client-side filtering
        });

        return filteredServices;
      }
    } catch (error) {
      console.error('Search error:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Search failed',
      });
      return [];
    }
  },

  // Clear current service
  clearCurrentService: () => {
    set({ currentService: null });
  },

  // Clear errors
  clearErrors: () => {
    set({ error: null });
  },
}));
