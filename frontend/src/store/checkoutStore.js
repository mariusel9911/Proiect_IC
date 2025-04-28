import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCheckoutStore = create(
    persist(
        (set, get) => ({
            selectedService: null,
            selectedOptions: {},
            selectedProvider: null,
            address: {
                street: '',
                city: '',
                zipCode: '',
                country: '',
            },
            scheduledDate: null,
            timeSlot: { start: '09:00', end: '12:00' },
            paymentMethod: 'card',
            cardDetails: {
                name: '',
                cardNumber: '',
                expiryDate: '',
                cvv: '',
            },

            // Set selected service
            setSelectedService: (service) => {
                set({
                    selectedService: service,
                    // Clear previously selected options when changing service
                    selectedOptions: {},
                });
            },

            // Set selected provider
            setSelectedProvider: (provider) => {
                set({ selectedProvider: provider });
            },

            // Update selected options (add, remove, change quantity)
            updateSelectedOption: (optionId, quantity) => {
                // Make sure optionId is a string to match MongoDB ObjectId format
                const id = String(optionId);
                const currentOptions = get().selectedOptions;

                if (quantity <= 0) {
                    // Remove option if quantity is 0 or less
                    const { [id]: _, ...remainingOptions } = currentOptions;
                    set({ selectedOptions: remainingOptions });
                } else {
                    // Add or update option
                    set({
                        selectedOptions: {
                            ...currentOptions,
                            [id]: quantity,
                        },
                    });
                }
            },

            // Calculate total price of selected options
            calculateTotal: () => {
                const { selectedService, selectedOptions } = get();

                if (!selectedService || !selectedService.options) return 0;

                return selectedService.options.reduce((total, option) => {
                    const optionId = option._id || option.id;
                    const quantity = selectedOptions[optionId] || 0;

                    // Handle different price formats
                    let price = 0;

                    // If priceValue exists (added by our updated backend), use it
                    if (option.priceValue !== undefined) {
                        price = option.priceValue;
                    } else if (option.price) {
                        // Otherwise parse from price string
                        // Remove € symbol and any non-numeric characters except decimal point
                        const priceString = option.price.toString().replace(/[^0-9.]/g, '');
                        price = parseFloat(priceString) || 0;
                    }

                    return total + price * quantity;
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
                return Object.values(get().selectedOptions).some(
                    (quantity) => quantity > 0
                );
            },

            // Set address information
            setAddress: (addressData) => {
                set({ address: { ...get().address, ...addressData } });
            },

            // Set scheduled date and time
            setSchedule: (date, timeSlot) => {
                set({
                    scheduledDate: date,
                    timeSlot: timeSlot || get().timeSlot,
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

            // Prepare order data for API submission
            prepareOrderData: () => {
                const {
                    selectedService,
                    selectedProvider,
                    selectedOptions,
                    calculateTotal,
                    calculateTax,
                    calculateGrandTotal,
                    address,
                    scheduledDate,
                    timeSlot,
                    paymentMethod,
                } = get();

                if (!selectedService || !selectedService.options) {
                    console.error('No service selected or service has no options');
                    return null;
                }

                // Create a set of valid option IDs from the current service
                const validOptionIds = new Set(
                    selectedService.options.map((option) =>
                        String(option._id || option.id)
                    )
                );

                console.log(
                    'Valid option IDs for this service:',
                    Array.from(validOptionIds)
                );

                // Filter selected options to only include options from the current service
                const validSelectedOptions = Object.entries(selectedOptions)
                    .filter(([optionId, quantity]) => {
                        const isValid =
                            validOptionIds.has(String(optionId)) && quantity > 0;
                        if (!isValid && quantity > 0) {
                            console.warn(
                                `Filtering out option ID ${optionId} as it's not part of the current service`
                            );
                        }
                        return isValid;
                    })
                    .map(([optionId, quantity]) => {
                        // Find the option details for this ID
                        const option = selectedService.options.find(
                            (opt) => String(opt._id || opt.id) === String(optionId)
                        );

                        // Get price value (either from priceValue property or by parsing price string)
                        let price = 0;
                        if (option) {
                            if (option.priceValue !== undefined) {
                                price = option.priceValue;
                            } else if (option.price) {
                                const priceString = option.price.toString().replace(/[^0-9.]/g, '');
                                price = parseFloat(priceString) || 0;
                            }
                        }

                        return {
                            optionId,
                            quantity,
                            price // Include price in order data
                        };
                    });

                return {
                    serviceId: selectedService._id || selectedService.id,
                    providerId: selectedProvider?._id,
                    selectedOptions: validSelectedOptions,
                    totalAmount: calculateTotal(),
                    tax: calculateTax(),
                    grandTotal: calculateGrandTotal(),
                    address,
                    scheduledDate,
                    timeSlot,
                    paymentMethod,
                };
            },

            // Clear checkout data
            clearCheckout: () => {
                set({
                    selectedService: null,
                    selectedOptions: {},
                    selectedProvider: null,
                    address: {
                        street: '',
                        city: '',
                        zipCode: '',
                        country: '',
                    },
                    scheduledDate: null,
                    timeSlot: { start: '09:00', end: '12:00' },
                    cardDetails: {
                        name: '',
                        cardNumber: '',
                        expiryDate: '',
                        cvv: '',
                    },
                });
            },
        }),
        {
            name: 'cleaning-checkout-storage', // name for localStorage
            partialize: (state) => ({
                // Only persist these fields
                selectedService: state.selectedService,
                selectedOptions: state.selectedOptions,
                selectedProvider: state.selectedProvider,
                address: state.address,
                scheduledDate: state.scheduledDate,
                timeSlot: state.timeSlot,
                paymentMethod: state.paymentMethod,
                // We don't persist card details for security reasons
            }),
        }
    )
);