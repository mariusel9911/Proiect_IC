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
                    error: null
                });
            }
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to fetch services'
            });
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
                    error: null
                });
                return response.data.service;
            }
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to fetch service'
            });
            return null;
        }
    },

    // Search services
    searchServices: async (query) => {
        try {
            set({ isLoading: true, error: null });

            const response = await axios.get(`${API_URL}/services/search?query=${query}`);

            if (response.data.success) {
                set({
                    services: response.data.services,
                    isLoading: false,
                    error: null
                });
                return response.data.services;
            }
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Search failed'
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
    }
}));