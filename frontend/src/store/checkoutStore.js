import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCheckoutStore = create(
    persist(
        (set, get) => ({
            selectedService: null,
            selectedOptions: {},
            address: {
                street: '',
                city: '',
                zipCode: '',
                country: ''
            },
            scheduledDate: null,
            timeSlot: { start: '09:00', end: '12:00' },
            paymentMethod: 'card',
            cardDetails: {
                name: '',
                cardNumber: '',
                expiryDate: '',
                cvv: ''
            },

            // Set selected service
            setSelectedService: (service) => {
                set({ selectedService: service });
            },

            // Update selected options (add, remove, change quantity)
            updateSelectedOption: (optionId, quantity) => {
                const currentOptions = get().selectedOptions;

                if (quantity <= 0) {
                    // Remove option if quantity is 0 or less
                    const { [optionId]: _, ...remainingOptions } = currentOptions;
                    set({ selectedOptions: remainingOptions });
                } else {
                    // Add or update option
                    set({
                        selectedOptions: {
                            ...currentOptions,
                            [optionId]: quantity
                        }
                    });
                }
            },

            // Calculate total price of selected options
            calculateTotal: () => {
                const { selectedService, selectedOptions } = get();

                if (!selectedService || !selectedService.options) return 0;

                return selectedService.options.reduce((total, option) => {
                    const quantity = selectedOptions[option.id] || 0;
                    const price = parseInt(option.price.replace('€', '')) || 0;
                    return total + (price * quantity);
                }, 0);
            },

            // Calculate tax (20%)
            calculateTax: () => {
                return Math.round(get().calculateTotal() * 0.2);
            },

            // Calculate grand total (total + tax)
            calculateGrandTotal: () => {
                return get().calculateTotal() + get().calculateTax();
            },

            // Check if any options are selected
            hasSelectedOptions: () => {
                return Object.values(get().selectedOptions).some(quantity => quantity > 0);
            },

            // Set address information
            setAddress: (addressData) => {
                set({ address: { ...get().address, ...addressData } });
            },

            // Set scheduled date and time
            setSchedule: (date, timeSlot) => {
                set({
                    scheduledDate: date,
                    timeSlot: timeSlot || get().timeSlot
                });
            },

            // Set payment method
            setPaymentMethod: (method) => {
                set({ paymentMethod: method });
            },

            // Update card details
            updateCardDetails: (cardData) => {
                set({ cardDetails: { ...get().cardDetails, ...cardData } });
            },

            // Validate card details
            validateCardDetails: () => {
                const { name, cardNumber, expiryDate, cvv } = get().cardDetails;

                // Basic validation
                return (
                    name.trim() !== '' &&
                    cardNumber.replace(/\s/g, '').length === 16 &&
                    /^\d{2}\/\d{2}$/.test(expiryDate) &&
                    /^\d{3,4}$/.test(cvv)
                );
            },

            // Clear checkout data
            clearCheckout: () => {
                set({
                    selectedService: null,
                    selectedOptions: {},
                    address: {
                        street: '',
                        city: '',
                        zipCode: '',
                        country: ''
                    },
                    scheduledDate: null,
                    timeSlot: { start: '09:00', end: '12:00' },
                    cardDetails: {
                        name: '',
                        cardNumber: '',
                        expiryDate: '',
                        cvv: ''
                    }
                });
            }
        }),
        {
            name: 'cleaning-checkout-storage', // name for localStorage
            partialize: (state) => ({
                // Only persist these fields
                selectedService: state.selectedService,
                selectedOptions: state.selectedOptions,
                address: state.address,
                scheduledDate: state.scheduledDate,
                timeSlot: state.timeSlot,
                paymentMethod: state.paymentMethod
                // We don't persist card details for security reasons
            })
        }
    )
);