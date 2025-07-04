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

      const response = await axios.put(
        `${API_URL}/users/update-profile`,
        profileData,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Get the authStore's setState function directly
        const authState = useAuthStore.getState();

        // Update the user in the auth store
        useAuthStore.setState({
          user: {
            ...authState.user,
            ...response.data.user,
          },
        });

        set({
          isLoading: false,
          success: 'Profile updated successfully',
        });

        return response.data.user;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to update profile',
      });
      throw error;
    }
  },

  requestPasswordReset: async (email) => {
    try {
      set({ isLoading: true, error: null, success: null });

      // Use the same endpoint as the forgot password page
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
      });

      // Check for success response (some APIs return 200 without success flag)
      if (response.status === 200) {
        set({
          isLoading: false,
          success: 'Password reset email sent successfully',
        });
        return true;
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      set({
        isLoading: false,
        error:
          error.response?.data?.message ||
          'Failed to send password reset email',
      });
      throw error;
    }
  },

  deleteUserAccount: async (password) => {
    try {
      set({ isLoading: true, error: null, success: null });

      const response = await axios.delete(`${API_URL}/users/delete-account`, {
        data: { password },
        withCredentials: true,
      });

      if (response.data.success) {
        set({
          isLoading: false,
          success: 'Account deleted successfully',
        });
        return true;
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to delete account';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  clearMessages: () => {
    set({ error: null, success: null });
  },
}));
