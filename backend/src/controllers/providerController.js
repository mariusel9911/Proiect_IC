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

        // Create deep copy of service to avoid modifying the original
        const processedService = {
          ...service.toObject(),
          options: service.options.map((option) => {
            // Find if provider has a custom option for this service option
            const providerOption = offering.options.find(
              (po) => po.optionId.toString() === option._id.toString()
            );

            if (providerOption) {
              // Provider has custom option - use provider's price but keep service's other properties
              return {
                ...option,
                price: `€${providerOption.price}`, // Format provider price
                priceValue: Number(providerOption.price), // Add raw numeric price for calculations
                // You can override other properties if needed
                description: providerOption.description || option.description,
              };
            }

            // No custom option - add priceValue to service default option
            const defaultPrice = option.price.replace('€', '');
            return {
              ...option,
              priceValue: Number(defaultPrice),
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
    }).select('-reviews');

    // Create formatted provider data with service-specific information
    const formattedProviders = providers.map((provider) => {
      // Find the specific service offering for this service
      const serviceOffering = provider.serviceOfferings.find(
        (offering) => offering.service.toString() === serviceId
      );

      // Process options with price formatting
      const processedOptions = [];

      if (
        serviceOffering &&
        serviceOffering.options &&
        serviceOffering.options.length > 0
      ) {
        // Map service options to find matches
        service.options.forEach((serviceOption) => {
          // Find if provider has a custom option for this service option
          const providerOption = serviceOffering.options.find(
            (po) => po.optionId.toString() === serviceOption._id.toString()
          );

          if (providerOption) {
            // Provider has custom option - use provider's price but service's icon
            processedOptions.push({
              _id: providerOption.optionId,
              id: providerOption.optionId,
              name: providerOption.name,
              price: `€${providerOption.price}`, // Format provider price
              priceValue: Number(providerOption.price), // Add raw numeric price for calculations
              icon: serviceOption.icon, // Keep service icon
              description: providerOption.description,
            });
          } else {
            // Provider doesn't have custom option - use service default
            const defaultPrice = serviceOption.price.replace('€', '');
            processedOptions.push({
              ...serviceOption,
              // Add raw numeric price for calculations
              priceValue: Number(defaultPrice),
            });
          }
        });
      } else {
        // No custom options - use service defaults
        service.options.forEach((option) => {
          const defaultPrice = option.price.replace('€', '');
          processedOptions.push({
            ...option,
            // Add raw numeric price for calculations
            priceValue: Number(defaultPrice),
          });
        });
      }

      return {
        _id: provider._id,
        name: provider.name,
        title: provider.title,
        description: serviceOffering?.description || provider.description,
        email: provider.email,
        phone: provider.phone,
        type: provider.type,
        // price: provider.price,
        location: provider.location,
        rating: provider.rating,
        isPopular: provider.isPopular,
        isVerified: provider.isVerified,
        image: provider.image,
        // Use processed options
        options: processedOptions,
        availability: serviceOffering?.availability || provider.availability,
        // Add reference to service
        service: {
          _id: service._id,
          name: service.name,
          description: service.description,
          type: service.type,
          options: processedOptions, // Include processed options in service too
        },
      };
    });

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

// Update provider
// In providerController.js
export const updateProvider = async (req, res) => {
  try {
    console.log('=== UPDATE PROVIDER START ===');
    console.log('Provider ID:', req.params.providerId);
    console.log('User ID:', req.userId);
    console.log('User object:', req.user);
    console.log('Is Admin?', req.user?.isAdmin);
    console.log('Update data:', JSON.stringify(req.body, null, 2));

    const { providerId } = req.params;
    const updates = req.body;

    // Find the provider
    const provider = await Provider.findById(providerId);
    console.log('Provider found:', provider ? 'Yes' : 'No');

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }

    console.log('Provider user ID:', provider.user);
    console.log('Current user ID:', req.userId);
    console.log('Is owner?', provider.user?.toString() === req.userId);

    // Check if the provider belongs to the current user or if user is admin
    if (provider.user?.toString() !== req.userId && !req.user?.isAdmin) {
      console.log('Authorization check failed');
      return res.status(403).json({
        success: false,
        message:
          'Unauthorized: You do not have permission to update this provider',
      });
    }

    console.log('Authorization passed, proceeding with update...');

    // Handle service offerings update if provided
    if (updates.services || updates.serviceOptions) {
      console.log('Processing service offerings update...');
      const serviceOfferings = [...provider.serviceOfferings];

      // ... rest of the service offerings update logic ...
    }

    console.log('Updating provider...');
    const updatedProvider = await Provider.findByIdAndUpdate(
      providerId,
      updates,
      { new: true, runValidators: true }
    );

    console.log('Provider updated successfully');

    res.status(200).json({
      success: true,
      message: 'Provider updated successfully',
      provider: updatedProvider,
    });

    console.log('=== UPDATE PROVIDER END ===');
  } catch (error) {
    console.error('=== UPDATE PROVIDER ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    // If it's a Mongoose validation error, log the details
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }

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
