import { Provider } from '../models/provider.model.js';
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
            .populate('services', 'name type')
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
            .populate('services', 'name description type options')
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

        const providers = await Provider.find({
            services: serviceId,
            isActive: true,
        }).select('-reviews');

        res.status(200).json({
            success: true,
            count: providers.length,
            providers,
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
        } = req.body;

        // Check if a provider with this email already exists
        const existingProvider = await Provider.findOne({ email });
        if (existingProvider) {
            return res.status(400).json({
                success: false,
                message: 'A provider with this email already exists',
            });
        }

        // Create the provider
        const provider = new Provider({
            name,
            title,
            description,
            email,
            phone,
            type,
            services,
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
            (sum, item) => sum + item.rating,
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

// Seed initial providers (for development)
// export const seedProviders = async (req, res) => {
//     try {
//         // Check if providers already exist
//         const count = await Provider.countDocuments();
//         if (count > 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Providers already exist in the database',
//             });
//         }
//
//         // Get a service to associate with the providers
//         const serviceId = req.body.serviceId;
//
//         if (!serviceId) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Service ID is required for seeding providers',
//             });
//         }
//
//         const providers = [
//             {
//                 name: 'John Smith',
//                 title: 'Professional Cleaning Expert',
//                 description:
//                     'Experienced professional with 10+ years in the cleaning industry',
//                 email: 'john.smith@example.com',
//                 phone: '+1234567890',
//                 type: 'person',
//                 services: [serviceId],
//                 price: 'FREE',
//                 rating: 4.8,
//                 isPopular: true,
//                 isVerified: true,
//                 image: '/api/placeholder/80/80',
//                 location: {
//                     city: 'New York',
//                     country: 'USA',
//                 },
//             },
//             {
//                 name: 'ABC Cleaning Solutions',
//                 title: 'Enterprise Cleaning Services',
//                 description:
//                     'Leading company providing comprehensive cleaning solutions for homes and offices',
//                 email: 'info@abccleaning.example.com',
//                 phone: '+1987654321',
//                 type: 'company',
//                 services: [serviceId],
//                 price: 'FREE',
//                 rating: 4.5,
//                 isVerified: true,
//                 image: '/api/placeholder/80/80',
//                 location: {
//                     city: 'Boston',
//                     country: 'USA',
//                 },
//             },
//             {
//                 name: 'Clean & Fresh',
//                 title: 'Eco-friendly Cleaning',
//                 description:
//                     'Specialized in eco-friendly cleaning solutions for environmentally conscious clients',
//                 email: 'contact@cleanfresh.example.com',
//                 phone: '+1122334455',
//                 type: 'company',
//                 services: [serviceId],
//                 price: 'FREE',
//                 rating: 4.7,
//                 isPopular: true,
//                 isVerified: true,
//                 image: '/api/placeholder/80/80',
//                 location: {
//                     city: 'San Francisco',
//                     country: 'USA',
//                 },
//             },
//         ];
//
//         await Provider.insertMany(providers);
//
//         res.status(201).json({
//             success: true,
//             message: 'Providers seeded successfully',
//             count: providers.length,
//         });
//     } catch (error) {
//         console.error('Error seeding providers:', error);
//         res.status(500).json({
//             success: false,
//             message: error.message || 'Error seeding providers',
//         });
//     }
// };