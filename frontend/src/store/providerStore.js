import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useProviderStore = create((set, get) => ({
  providers: [],
  currentProvider: null,
  isLoading: false,
  error: null,

  // Fetch all providers
  fetchProviders: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null });

      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.search) queryParams.append('search', filters.search);

      // Try API first
      try {
        const response = await axios.get(
          `${API_URL}/providers?${queryParams.toString()}`
        );

        if (response.data.success) {
          set({
            providers: response.data.providers,
            isLoading: false,
            error: null,
          });
          return response.data.providers;
        }
      } catch (error) {
        console.log(
          'Error fetching providers from API, falling back to mock data:',
          error.message
        );
      }

      // Fallback to mock data
      const mockProviders = [
        {
          id: 1,
          name: 'John Smith Mock',
          title: 'Professional Cleaning Expert',
          description:
            'Experienced professional with 10+ years in the cleaning industry',
          price: 'FREE',
          type: 'person',
          rating: 4.8,
          isPopular: true,
          isVerified: true,
          image: '/api/placeholder/80/80',
        },
        {
          id: 2,
          name: 'ABC Cleaning Solutions Mock',
          title: 'Enterprise Cleaning Services',
          description:
            'Leading company providing comprehensive cleaning solutions for homes and offices',
          price: 'FREE',
          type: 'company',
          rating: 4.5,
          isVerified: true,
          image: '/api/placeholder/80/80',
        },
        {
          id: 3,
          name: 'Clean & Fresh Mock',
          title: 'Eco-friendly Cleaning',
          description:
            'Specialized in eco-friendly cleaning solutions for environmentally conscious clients',
          price: 'FREE',
          type: 'company',
          rating: 4.7,
          isPopular: true,
          isVerified: true,
          image: '/api/placeholder/80/80',
        },
      ];

      // Apply filters to mock data
      let filteredProviders = [...mockProviders];

      if (filters.type) {
        filteredProviders = filteredProviders.filter(
          (provider) => provider.type === filters.type
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProviders = filteredProviders.filter(
          (provider) =>
            provider.name.toLowerCase().includes(searchLower) ||
            provider.description.toLowerCase().includes(searchLower) ||
            provider.title.toLowerCase().includes(searchLower)
        );
      }

      set({
        providers: filteredProviders,
        isLoading: false,
        error: null,
      });

      return filteredProviders;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch providers',
      });
      return [];
    }
  },

  // Fetch a single provider by ID
  fetchProviderById: async (providerId) => {
    try {
      set({ isLoading: true, error: null });

      // Try API first
      try {
        const response = await axios.get(`${API_URL}/providers/${providerId}`);

        if (response.data.success) {
          set({
            currentProvider: response.data.provider,
            isLoading: false,
            error: null,
          });
          return response.data.provider;
        }
      } catch (error) {
        console.log(
          'Error fetching provider from API, falling back to mock data:',
          error.message
        );
      }

      // Fallback to mock data
      const providers = get().providers;

      if (providers.length === 0) {
        await get().fetchProviders();
      }

      const provider = get().providers.find(
        (p) => p.id.toString() === providerId.toString() || p._id === providerId
      );

      if (provider) {
        set({
          currentProvider: provider,
          isLoading: false,
          error: null,
        });
        return provider;
      }

      set({
        isLoading: false,
        error: 'Provider not found',
      });
      return null;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch provider',
      });
      return null;
    }
  },

  // Fetch providers for a specific service
  fetchProvidersForService: async (serviceId) => {
    try {
      set({ isLoading: true, error: null });

      // Handle "main" as a special case
      if (serviceId === 'main') {
        serviceId = 6; // Use ID 6 for "main" service
      }

      // Try API first
      try {
        const response = await axios.get(
          `${API_URL}/providers/service/${serviceId}`
        );

        if (response.data.success) {
          set({
            providers: response.data.providers,
            isLoading: false,
            error: null,
          });
          return response.data.providers;
        }
      } catch (error) {
        console.log(
          'Error fetching service providers from API, falling back to mock data:',
          error.message
        );
      }

      // Fallback to all providers (in a real app, we would filter by service)
      await get().fetchProviders();
      const providers = get().providers;

      set({
        isLoading: false,
        error: null,
      });

      return providers;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error.response?.data?.message || 'Failed to fetch service providers',
      });
      return [];
    }
  },

  // Add a review to a provider
  addProviderReview: async (providerId, reviewData) => {
    try {
      set({ isLoading: true, error: null });

      // Try API first
      try {
        const response = await axios.post(
          `${API_URL}/providers/${providerId}/reviews`,
          reviewData,
          { withCredentials: true }
        );

        if (response.data.success) {
          // Update current provider if it's the one being reviewed
          if (
            get().currentProvider &&
            get().currentProvider._id === providerId
          ) {
            set({ currentProvider: response.data.provider });
          }

          set({ isLoading: false, error: null });
          return true;
        }
      } catch (error) {
        console.log('Error adding review:', error.message);
        set({
          isLoading: false,
          error: error.response?.data?.message || 'Failed to add review',
        });
        return false;
      }

      // No fallback for adding reviews
      set({
        isLoading: false,
        error: 'Failed to add review',
      });
      return false;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to add review',
      });
      return false;
    }
  },

  // Clear current provider
  clearCurrentProvider: () => {
    set({ currentProvider: null });
  },

  // Clear errors
  clearErrors: () => {
    set({ error: null });
  },
}));
