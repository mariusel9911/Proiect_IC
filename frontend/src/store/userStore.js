import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useUserStore = create((set, get) => ({
    isLoading: false,
    error: null,
    success: null,

    updateUserProfile: async (profileData) => {
        try {
            set({ isLoading: true, error: null, success: null });

            const response = await axios.put(`${API_URL}/users/update-profile`, profileData, {
                withCredentials: true
            });

            if (response.data.success) {
                // Get the authStore's setState function directly
                const authState = useAuthStore.getState();

                // Update the user in the auth store
                useAuthStore.setState({
                    user: {
                        ...authState.user,
                        ...response.data.user
                    }
                });

                set({
                    isLoading: false,
                    success: 'Profile updated successfully'
                });

                return response.data.user;
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to update profile'
            });
            throw error;
        }
    },

    clearMessages: () => {
        set({ error: null, success: null });
    }
}));