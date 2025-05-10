import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useUserAddressStore = create((set, get) => ({
    address: null,
    formattedAddress: 'My Address',
    isLoading: false,
    error: null,

    // Fetch user's address
    fetchUserAddress: async () => {
        try {
            set({ isLoading: true, error: null });

            const response = await axios.get(`${API_URL}/users/address`, {
                withCredentials: true
            });

            if (response.data.success) {
                const address = response.data.address;
                let formattedAddress = 'My Address';

                if (address && (address.street || address.city)) {
                    formattedAddress = [
                        address.street,
                        address.city,
                        address.zipCode,
                        address.country
                    ].filter(Boolean).join(', ');
                }

                set({
                    address: address || null,
                    formattedAddress,
                    isLoading: false
                });

                return address;
            }
        } catch (error) {
            console.error('Error fetching user address:', error);
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to fetch address'
            });
            return null;
        }
    },

    // Update user's address
    updateUserAddress: async (addressData) => {
        try {
            set({ isLoading: true, error: null });

            const response = await axios.put(
                `${API_URL}/users/address`,
                { address: addressData },
                { withCredentials: true }
            );

            if (response.data.success) {
                const address = response.data.address;
                let formattedAddress = 'My Address';

                if (address && (address.street || address.city)) {
                    formattedAddress = [
                        address.street,
                        address.city,
                        address.zipCode,
                        address.country
                    ].filter(Boolean).join(', ');
                }

                set({
                    address: address || null,
                    formattedAddress,
                    isLoading: false
                });

                return address;
            }
        } catch (error) {
            console.error('Error updating user address:', error);
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to update address'
            });
            return null;
        }
    },

    // Set address without API call (for local updates)
    setAddressLocally: (addressData, formatted = null) => {
        let formattedAddress = formatted;

        if (!formatted && addressData && (addressData.street || addressData.city)) {
            formattedAddress = [
                addressData.street,
                addressData.city,
                addressData.zipCode,
                addressData.country
            ].filter(Boolean).join(', ');
        } else if (!formatted) {
            formattedAddress = 'My Address';
        }

        set({
            address: addressData,
            formattedAddress
        });
    },

    // Clear address
    clearAddress: () => {
        set({
            address: null,
            formattedAddress: 'My Address'
        });
    },

    // Clear errors
    clearErrors: () => {
        set({ error: null });
    }
}));