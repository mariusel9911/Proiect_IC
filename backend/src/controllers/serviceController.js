import { Service } from '../models/service.model.js';

// Get all services for homepage
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });
    res.status(200).json({
      success: true,
      services,
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
    });
  }
};

// Get a single service by ID
export const getServiceById = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service',
    });
  }
};

// In serviceController.js
export const createService = async (req, res) => {
  try {
    const { name, description, type, price, options } = req.body;

    // Validate required fields
    if (!name || !description || !type || !options || !Array.isArray(options)) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if user is admin
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required',
      });
    }

    const serviceData = {
      name,
      description,
      type,
      price: price || 'FREE',
      options,
    };
    console.log(JSON.stringify(serviceData, null, 2));

    const service = new Service(serviceData);

    await service.save();

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service,
    });
  } catch (error) {
    // If it's a Mongoose validation error, log the details
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error creating service',
    });
  }
};

// Update a service (admin only)
export const updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const updates = req.body;

    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required',
      });
    }

    const service = await Service.findByIdAndUpdate(serviceId, updates, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      service,
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service',
    });
  }
};

// Delete a service (admin only)
export const deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required',
      });
    }

    const service = await Service.findByIdAndDelete(serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting service',
    });
  }
};

// Search services
export const searchServices = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const services = await Service.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { type: { $regex: query, $options: 'i' } },
            { 'options.name': { $regex: query, $options: 'i' } },
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      services,
    });
  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching services',
    });
  }
};

// Seed initial services (for development)
// export const seedServices = async (req, res) => {
//     try {
//         // Check if services already exist
//         const count = await Service.countDocuments();
//         if (count > 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Services already exist in the database',
//             });
//         }
//
//         const services = [
//             {
//                 name: 'Residential Cleaning',
//                 description: 'Professional cleaning services for your home',
//                 type: 'DOMESTIC CLEANING',
//                 price: 'FREE',
//                 options: [
//                     {
//                         name: 'Bathroom Cleaning',
//                         icon: '🛁',
//                         price: '€25',
//                         description:
//                             'Complete bathroom cleaning including toilets, showers, and sinks',
//                     },
//                     {
//                         name: 'Kitchen Cleaning',
//                         icon: '🍳',
//                         price: '€30',
//                         description:
//                             'Deep cleaning of kitchen appliances, countertops, and cabinets',
//                     },
//                     {
//                         name: 'Living Room',
//                         icon: '🛋️',
//                         price: '€20',
//                         description:
//                             'Dusting and vacuuming of living room furniture and floors',
//                     },
//                     {
//                         name: 'Bedroom Cleaning',
//                         icon: '🛏️',
//                         price: '€18',
//                         description: 'Cleaning and organizing bedrooms',
//                     },
//                     {
//                         name: 'Window Cleaning',
//                         icon: '🪟',
//                         price: '€15',
//                         description: 'Interior and exterior window cleaning',
//                     },
//                 ],
//             },
//             {
//                 name: 'Office Cleaning',
//                 description: 'Professional cleaning services for commercial spaces',
//                 type: 'COMMERCIAL CLEANING',
//                 price: 'FREE',
//                 options: [
//                     {
//                         name: 'Desk Cleaning',
//                         icon: '💼',
//                         price: '€10',
//                         description: 'Cleaning and sanitizing desks and workstations',
//                     },
//                     {
//                         name: 'Meeting Room',
//                         icon: '👥',
//                         price: '€30',
//                         description: 'Cleaning and preparing meeting rooms',
//                     },
//                     {
//                         name: 'Floor Cleaning',
//                         icon: '🧹',
//                         price: '€40',
//                         description: 'Cleaning and polishing floors',
//                     },
//                     {
//                         name: 'Bathroom Maintenance',
//                         icon: '🚽',
//                         price: '€35',
//                         description: 'Complete cleaning of office bathrooms',
//                     },
//                 ],
//             },
//             {
//                 name: 'Deep Cleaning',
//                 description: 'Intensive cleaning service for all spaces',
//                 type: 'SPECIALIZED CLEANING',
//                 price: 'FREE',
//                 options: [
//                     {
//                         name: 'Carpet Cleaning',
//                         icon: '🧶',
//                         price: '€50',
//                         description: 'Deep stain removal and sanitizing of carpets',
//                     },
//                     {
//                         name: 'Appliance Cleaning',
//                         icon: '🧊',
//                         price: '€40',
//                         description: 'Detailed cleaning of household appliances',
//                     },
//                     {
//                         name: 'Move-in/Move-out',
//                         icon: '📦',
//                         price: '€100',
//                         description: 'Complete cleaning for moving in or out of property',
//                     },
//                 ],
//             },
//         ];
//
//         await Service.insertMany(services);
//
//         res.status(201).json({
//             success: true,
//             message: 'Services seeded successfully',
//             count: services.length,
//         });
//     } catch (error) {
//         console.error('Error seeding services:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error seeding services',
//         });
//     }
// };
