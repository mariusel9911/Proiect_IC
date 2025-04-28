import { useState, useEffect } from 'react';

/**
 * Custom hook to process provider options and merge them with service options
 */
export const useProviderOptions = (provider, service) => {
    const [processedOptions, setProcessedOptions] = useState([]);
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        if (!provider || !service) {
            setProcessedOptions([]);
            setIsProcessing(false);
            return;
        }

        try {
            setIsProcessing(true);
            console.log('Processing provider options:', provider);
            console.log('Service data:', service);

            let options = [];

            // Find the specific service offering for this service
            let serviceOffering = null;

            // Case 1: Provider from the API call to getProviderById - serviceOfferings is an array
            if (provider.serviceOfferings && Array.isArray(provider.serviceOfferings)) {
                // When we have a provider with serviceOfferings array
                serviceOffering = provider.serviceOfferings.find(
                    offering => offering.service._id === service._id ||
                        offering.service === service._id
                );
            }

            // Case 2: Provider from API call to getProvidersForService which may have flattened structure
            else if (provider.options && Array.isArray(provider.options)) {
                // This is a flattened provider with options already processed for this specific service
                options = provider.options;
            }

            // If we found a service offering with options, process it
            if (serviceOffering && serviceOffering.options && serviceOffering.options.length > 0) {
                options = service.options.map(serviceOption => {
                    // Find if this service option has a custom price from provider
                    const providerOption = serviceOffering.options.find(
                        po => po.optionId.toString() === serviceOption._id.toString()
                    );

                    if (providerOption) {
                        // Format price with € symbol
                        const formattedPrice = `€${providerOption.price}`;

                        return {
                            ...serviceOption,
                            price: formattedPrice,
                            priceValue: Number(providerOption.price),
                            description: providerOption.description || serviceOption.description
                        };
                    }

                    // No custom option from provider, use service default
                    // But add priceValue for consistent calculations
                    const defaultPrice = serviceOption.price.replace('€', '');
                    return {
                        ...serviceOption,
                        priceValue: Number(defaultPrice)
                    };
                });
            }
            // If we already have processed options, use them
            else if (options.length === 0 && service.options) {
                // No provider options found, use service defaults
                options = service.options.map(option => {
                    const defaultPrice = option.price.replace('€', '');
                    return {
                        ...option,
                        priceValue: Number(defaultPrice)
                    };
                });
            }

            console.log('Processed options:', options);
            setProcessedOptions(options);
            setIsProcessing(false);
        } catch (error) {
            console.error('Error processing provider options:', error);
            // Fallback to service options
            if (service && service.options) {
                const fallbackOptions = service.options.map(option => {
                    const defaultPrice = option.price.replace('€', '');
                    return {
                        ...option,
                        priceValue: Number(defaultPrice)
                    };
                });
                setProcessedOptions(fallbackOptions);
            } else {
                setProcessedOptions([]);
            }
            setIsProcessing(false);
        }
    }, [provider, service]);

    return { processedOptions, isProcessing };
};