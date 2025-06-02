import { Provider } from '../models/provider.model.js';
import { Service } from '../models/service.model.js';
import { User } from '../models/user.model.js';

// Get all providers
export const getAllProviders = async (req, res) => {
  try {
    const { type, search } = req.query;

    let query = { isActive: true };

    if (type) {
      query.type = type;
    }

    if (search) {
      query = {
        ...query,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const providers = await Provider.find(query)
      .populate('serviceOfferings.service', 'name type')
      .select('-reviews');

    res.status(200).json({
      success: true,
      count: providers.length,
      providers,
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching providers',
    });
  }
};

// Get provider by ID
// In providerController.js - getProviderById
export const getProviderById = async (req, res) => {
  try {
    const { providerId } = req.params;

    const provider = await Provider.findById(providerId)
      .populate('serviceOfferings.service', 'name description type options')
      .populate('reviews.user', 'name');

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }

    // Process service offerings to properly merge custom prices with service options
    const processedServiceOfferings = provider.serviceOfferings.map(
      (offering) => {
        const service = offering.service;

        // Check if service exists and has options
        if (!service || !service.options) {
          console.error(
            'Service or service options missing for offering:',
            offering
          );
          return offering;
        }

        // Create deep copy of service to avoid modifying the original
        const processedService = {
          ...service.toObject(),
          options: service.options.map((option) => {
            // Find if provider has a custom option for this service option
            const providerOption = offering.options.find(
              (po) =>
                po.optionId && po.optionId.toString() === option._id.toString()
            );

            if (providerOption) {
              // Make sure all required fields are present
              return {
                _id: option._id,
                name: providerOption.name || option.name,
                icon: option.icon, // Always use service's icon
                price: providerOption.price
                  ? `€${providerOption.price}`
                  : option.price,
                description: providerOption.description || option.description,
                priceValue:
                  providerOption.price ||
                  parseFloat(option.price.replace('€', '')),
              };
            }

            // No custom option - use service defaults
            return {
              ...option,
              priceValue: parseFloat(option.price.replace('€', '') || '0'),
            };
          }),
        };

        return {
          ...offering.toObject(),
          service: processedService,
        };
      }
    );

    // Replace original serviceOfferings with processed ones
    const processedProvider = {
      ...provider.toObject(),
      serviceOfferings: processedServiceOfferings,
    };

    res.status(200).json({
      success: true,
      provider: processedProvider,
    });
  } catch (error) {
    console.error('Error fetching provider:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching provider',
    });
  }
};

// Get providers for a specific service
export const getProvidersForService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // First, get the service to have access to default options
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    // Find providers that offer this service
    const providers = await Provider.find({
      'serviceOfferings.service': serviceId,
      isActive: true,
    }).populate('serviceOfferings.service', 'name description type options');

    // Create formatted provider data with service-specific information
    const formattedProviders = providers
      .map((provider) => {
        try {
          // Find the specific service offering for this service
          const serviceOffering = provider.serviceOfferings?.find(
            (offering) =>
              offering?.service &&
              offering.service._id &&
              offering.service._id.toString() === serviceId
          );

          if (!serviceOffering) {
            return null;
          }

          // Process options with price formatting - with added null checks
          const processedOptions =
            service.options
              ?.map((serviceOption) => {
                if (!serviceOption || !serviceOption._id) {
                  return null; // Skip invalid options
                }

                try {
                  // Find if provider has a custom option for this service option
                  const providerOption =
                    serviceOffering.options &&
                    serviceOffering.options.length > 0
                      ? serviceOffering.options.find(
                          (po) =>
                            po &&
                            po.optionId &&
                            serviceOption._id &&
                            po.optionId.toString() ===
                              serviceOption._id.toString()
                        )
                      : null;

                  if (providerOption) {
                    // Use provider's custom price
                    return {
                      _id: serviceOption._id,
                      id: serviceOption._id,
                      name: serviceOption.name,
                      icon: serviceOption.icon || '🧹', // Default icon if missing
                      price: `€${providerOption.price}`, // Format price with Euro symbol
                      priceValue: Number(providerOption.price) || 0,
                      description: serviceOption.description || '',
                    };
                  } else {
                    // Use default service price
                    const defaultPrice = serviceOption.price
                      ? serviceOption.price.replace('€', '')
                      : '0';
                    return {
                      ...serviceOption.toObject(),
                      id: serviceOption._id,
                      priceValue: Number(defaultPrice) || 0,
                    };
                  }
                } catch (optionError) {
                  console.error(
                    `Error processing option for ${provider.name}:`,
                    optionError
                  );
                  return null;
                }
              })
              .filter(Boolean) || []; // Remove nulls and handle missing options array

          return {
            _id: provider._id,
            name: provider.name || 'Unnamed Provider',
            title: provider.title || '',
            description:
              serviceOffering.description || provider.description || '',
            email: provider.email || '',
            phone: provider.phone || '',
            type: provider.type || 'person',
            location: provider.location || {},
            rating: provider.rating || 0,
            isPopular: provider.isPopular || false,
            isVerified: provider.isVerified || false,
            image: provider.image || '/api/placeholder/80/80',
            options: processedOptions,
            availability:
              serviceOffering.availability || provider.availability || [],
            service: {
              _id: service._id,
              name: service.name,
              description: service.description,
              type: service.type,
              options: processedOptions,
            },
          };
        } catch (providerError) {
          console.error(
            `Error processing provider ${provider?.name || 'unknown'}:`,
            providerError
          );
          return null;
        }
      })
      .filter((provider) => provider !== null);

    res.status(200).json({
      success: true,
      count: formattedProviders.length,
      providers: formattedProviders,
    });
  } catch (error) {
    console.error('Error fetching service providers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service providers',
    });
  }
};
// Create a new provider
export const createProvider = async (req, res) => {
  try {
    const {
      name,
      title,
      description,
      email,
      phone,
      type,
      services,
      // price,
      location,
      availability,
      serviceOptions,
    } = req.body;

    // Check if a provider with this email already exists
    const existingProvider = await Provider.findOne({ email });
    if (existingProvider) {
      return res.status(400).json({
        success: false,
        message: 'A provider with this email already exists',
      });
    }

    // Validate that services exist and build serviceOfferings
    const serviceOfferings = [];

    if (services && services.length > 0) {
      for (const serviceData of services) {
        const serviceId =
          typeof serviceData === 'object' ? serviceData.id : serviceData;

        // Verify the service exists
        const service = await Service.findById(serviceId);
        if (!service) {
          return res.status(400).json({
            success: false,
            message: `Service with ID ${serviceId} not found`,
          });
        }

        // Get service-specific options if provided
        const options = [];
        if (serviceOptions && serviceOptions[serviceId]) {
          for (const option of serviceOptions[serviceId]) {
            // Verify the option exists in the service
            const serviceOption = service.options.id(option.optionId);
            if (!serviceOption) {
              return res.status(400).json({
                success: false,
                message: `Option with ID ${option.optionId} not found in service ${service.name}`,
              });
            }

            options.push({
              optionId: option.optionId,
              name: option.name || serviceOption.name,
              price:
                option.price || parseInt(serviceOption.price.replace('€', '')),
              description: option.description || serviceOption.description,
            });
          }
        }

        // Add to service offerings
        serviceOfferings.push({
          service: serviceId,
          options: options,
          description:
            typeof serviceData === 'object' ? serviceData.description : null,
          availability:
            typeof serviceData === 'object' ? serviceData.availability : null,
        });
      }
    }

    // Create the provider
    const provider = new Provider({
      name,
      title,
      description,
      email,
      phone,
      type,
      serviceOfferings,
      // price: price || 'FREE',
      location,
      availability,
      user: req.userId,
    });

    await provider.save();

    // Update the user to mark them as a provider
    await User.findByIdAndUpdate(req.userId, { isProvider: true });

    res.status(201).json({
      success: true,
      message: 'Provider created successfully',
      provider,
    });
  } catch (error) {
    console.error('Error creating provider:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating provider',
    });
  }
};
// In providerController.js - updateProvider
export const updateProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const updates = req.body;

    console.log('Updating provider:', providerId);
    console.log('Updates received:', JSON.stringify(updates, null, 2));
    console.log('User ID from token:', req.userId);

    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }

    // Find user to check if admin
    const user = await User.findById(req.userId);
    const isAdmin = user?.isAdmin || false;

    // Check permissions - handle case where provider.user might be undefined
    const isOwner = provider.user && provider.user.toString() === req.userId;

    console.log('Is admin:', isAdmin);
    console.log('Is owner:', isOwner);
    console.log('Provider user:', provider.user);

    // Only allow update if admin or owner
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          'Unauthorized: You do not have permission to update this provider',
      });
    }

    // Handle service offerings update
    if (updates.services && updates.serviceOptions) {
      const serviceOfferings = [];

      for (const serviceId of updates.services) {
        const service = await Service.findById(serviceId);
        if (!service) {
          console.log(`Service ${serviceId} not found, skipping...`);
          continue;
        }

        const serviceOffering = {
          service: serviceId,
          options: [],
        };

        // Get custom options for this service
        const customOptions = updates.serviceOptions[serviceId] || [];

        // Map custom options to the correct format
        for (const customOption of customOptions) {
          // Verify this option exists in the service
          const serviceOption = service.options.find(
            (opt) => opt._id.toString() === customOption.optionId
          );

          if (serviceOption) {
            serviceOffering.options.push({
              optionId: serviceOption._id,
              name: serviceOption.name, // Use service name
              price: customOption.price, // Use custom price
              description: serviceOption.description, // Use service description
            });
          }
        }

        serviceOfferings.push(serviceOffering);
      }

      updates.serviceOfferings = serviceOfferings;
      delete updates.services;
      delete updates.serviceOptions;
    }

    const updatedProvider = await Provider.findByIdAndUpdate(
      providerId,
      updates,
      { new: true, runValidators: true }
    ).populate('serviceOfferings.service', 'name description type options');

    res.status(200).json({
      success: true,
      message: 'Provider updated successfully',
      provider: updatedProvider,
    });
  } catch (error) {
    console.error('Error updating provider:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating provider',
    });
  }
};
// Add a review to provider
export const addProviderReview = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Rating and comment are required',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const provider = await Provider.findById(providerId);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }

    // Check if user already reviewed this provider
    const alreadyReviewed = provider.reviews.find(
      (review) => review.user.toString() === req.userId
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this provider',
      });
    }

    // Add the review
    const review = {
      user: req.userId,
      rating: Number(rating),
      comment,
    };

    provider.reviews.push(review);

    // Recalculate average rating
    const totalRating = provider.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    provider.rating = (totalRating / provider.reviews.length).toFixed(1);

    await provider.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      provider,
    });
  } catch (error) {
    console.error('Error adding provider review:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding review',
    });
  }
};

// In providerController.js
export const deleteProvider = async (req, res) => {
  try {
    const { providerId } = req.params;

    console.log('=== DELETE PROVIDER START ===');
    console.log('Provider ID:', providerId);
    console.log('User:', req.user);
    console.log('Is Admin?', req.user?.isAdmin);

    // Find the provider first
    const provider = await Provider.findById(providerId);

    if (!provider) {
      console.log('Provider not found');
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }

    // Check if user has permission to delete
    if (!req.user?.isAdmin) {
      console.log('Not admin - cannot delete');
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required to delete providers',
      });
    }

    // Delete the provider
    await Provider.findByIdAndDelete(providerId);

    console.log('Provider deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Provider deleted successfully',
    });

    console.log('=== DELETE PROVIDER END ===');
  } catch (error) {
    console.error('=== DELETE PROVIDER ERROR ===');
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting provider',
    });
  }
};
