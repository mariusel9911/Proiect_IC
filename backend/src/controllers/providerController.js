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

    res.status(200).json({
      success: true,
      provider,
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

      return {
        _id: provider._id,
        name: provider.name,
        title: provider.title,
        description: serviceOffering?.description || provider.description,
        email: provider.email,
        phone: provider.phone,
        type: provider.type,
        price: provider.price,
        location: provider.location,
        rating: provider.rating,
        isPopular: provider.isPopular,
        isVerified: provider.isVerified,
        image: provider.image,
        // Include service-specific options and availability
        options: serviceOffering?.options || [],
        availability: serviceOffering?.availability || provider.availability,
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
      price,
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
      price: price || 'FREE',
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
export const updateProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const updates = req.body;

    const provider = await Provider.findById(providerId);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }

    // Check if the provider belongs to the current user or if user is admin
    if (provider.user.toString() !== req.userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          'Unauthorized: You do not have permission to update this provider',
      });
    }

    // Handle service offerings update if provided
    if (updates.services || updates.serviceOptions) {
      const serviceOfferings = [...provider.serviceOfferings];

      // Handle updated or new services
      if (updates.services) {
        for (const serviceData of updates.services) {
          const serviceId =
            typeof serviceData === 'object' ? serviceData.id : serviceData;

          // Check if this service already exists in offerings
          const existingIndex = serviceOfferings.findIndex(
            (offering) => offering.service.toString() === serviceId
          );

          if (existingIndex === -1) {
            // Add new service
            serviceOfferings.push({
              service: serviceId,
              options: [],
              description:
                typeof serviceData === 'object'
                  ? serviceData.description
                  : null,
              availability:
                typeof serviceData === 'object'
                  ? serviceData.availability
                  : null,
            });
          } else if (typeof serviceData === 'object') {
            // Update existing service
            if (serviceData.description) {
              serviceOfferings[existingIndex].description =
                serviceData.description;
            }
            if (serviceData.availability) {
              serviceOfferings[existingIndex].availability =
                serviceData.availability;
            }
          }
        }
      }

      // Handle service options updates
      if (updates.serviceOptions) {
        for (const [serviceId, options] of Object.entries(
          updates.serviceOptions
        )) {
          // Find the service offering
          const offeringIndex = serviceOfferings.findIndex(
            (offering) => offering.service.toString() === serviceId
          );

          if (offeringIndex !== -1) {
            // Update or add options
            for (const option of options) {
              const optionIndex = serviceOfferings[
                offeringIndex
              ].options.findIndex(
                (o) => o.optionId.toString() === option.optionId
              );

              if (optionIndex !== -1) {
                // Update existing option
                serviceOfferings[offeringIndex].options[optionIndex] = {
                  ...serviceOfferings[offeringIndex].options[optionIndex],
                  ...option,
                };
              } else {
                // Add new option
                serviceOfferings[offeringIndex].options.push(option);
              }
            }
          }
        }
      }

      // Replace the updates.services with our processed serviceOfferings
      delete updates.services;
      delete updates.serviceOptions;
      updates.serviceOfferings = serviceOfferings;
    }

    const updatedProvider = await Provider.findByIdAndUpdate(
      providerId,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Provider updated successfully',
      provider: updatedProvider,
    });
  } catch (error) {
    console.error('Error updating provider:', error);
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
