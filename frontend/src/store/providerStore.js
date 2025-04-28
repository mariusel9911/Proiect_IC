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
      } else {
        throw new Error(
          'Failed to fetch providers: API returned no success flag'
        );
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch providers',
        providers: [],
      });
      return [];
    }
  },

  // Fetch a single provider by ID
  fetchProviderById: async (providerId) => {
    try {
      set({ isLoading: true, error: null });

      const response = await axios.get(`${API_URL}/providers/${providerId}`);

      if (response.data.success) {
        set({
          currentProvider: response.data.provider,
          isLoading: false,
          error: null,
        });
        return response.data.provider;
      } else {
        throw new Error(
          'Failed to fetch provider: API returned no success flag'
        );
      }
    } catch (error) {
      console.error('Error fetching provider:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch provider',
        currentProvider: null,
      });
      return null;
    }
  },

  // Fetch providers for a specific service
  fetchProvidersForService: async (serviceId) => {
    try {
      set({ isLoading: true, error: null });

      console.log(`Fetching providers for service ID: ${serviceId}`);

      const response = await axios.get(
        `${API_URL}/providers/service/${serviceId}`
      );

      if (response.data.success) {
        console.log(
          `Received ${response.data.providers.length} providers for service`
        );

        // Format prices consistently
        const formatPrice = (price) => {
          if (!price && price !== 0) return '€0';

          if (typeof price === 'string' && price.includes('€')) {
            return price;
          }

          return `€${price}`;
        };

        // Ensure each provider has the necessary properties for the UI
        const formattedProviders = response.data.providers.map((provider) => {
          // Extract options from the provider
          let options = [];
          if (provider.options) {
            options = provider.options;
          }

          // Format the options to ensure they have _id/id, price as string with € symbol
          if (options && options.length > 0) {
            options = options.map((option) => ({
              _id: option.optionId || option._id || option.id,
              id: option.optionId || option._id || option.id,
              name: option.name,
              price: formatPrice(option.price),
              description: option.description,
              icon: option.icon || '🧹', // Default icon
            }));
          }

          return {
            ...provider,
            options,
            // Add references needed by your UI components
            serviceId: serviceId,
          };
        });

        console.log('Formatted providers:', formattedProviders);

        set({
          providers: formattedProviders,
          isLoading: false,
          error: null,
        });
        return formattedProviders;
      } else {
        throw new Error(
          'Failed to fetch providers: API returned no success flag'
        );
      }
    } catch (error) {
      console.error(
        'Error fetching service providers from API:',
        error.message
      );
      console.error('Error details:', error);

      set({
        providers: [],
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

      const response = await axios.post(
        `${API_URL}/providers/${providerId}/reviews`,
        reviewData,
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update current provider if it's the one being reviewed
        if (get().currentProvider && get().currentProvider._id === providerId) {
          set({ currentProvider: response.data.provider });
        }

        set({ isLoading: false, error: null });
        return true;
      } else {
        throw new Error('Failed to add review: API returned no success flag');
      }
    } catch (error) {
      console.error('Error adding review:', error);
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
