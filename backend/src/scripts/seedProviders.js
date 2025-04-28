import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Use MONGO_URI instead of MONGODB_URI to match your .env file
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI environment variable is not set');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB...');

// Enhanced connection options
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 30000,
    });
    console.log('MongoDB connected successfully');
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    return false;
  }
};

// Define schemas for seeding
const optionSchema = new mongoose.Schema({
  name: String,
  icon: String,
  price: String,
  description: String,
});

const serviceSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    type: String,
    price: String,
    options: [optionSchema],
    isActive: Boolean,
  },
  { timestamps: true }
);

const providerServiceSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  options: [
    {
      optionId: mongoose.Schema.Types.ObjectId,
      name: String,
      price: Number,
      description: String,
    },
  ],
  description: String,
  availability: [
    {
      day: String,
      startTime: String,
      endTime: String,
    },
  ],
});

const providerSchema = new mongoose.Schema(
  {
    name: String,
    title: String,
    description: String,
    email: String,
    phone: String,
    type: String,
    serviceOfferings: [providerServiceSchema],
    price: String,
    location: {
      address: String,
      city: String,
      zipCode: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    rating: Number,
    isPopular: Boolean,
    isVerified: Boolean,
    image: String,
    isActive: Boolean,
  },
  { timestamps: true }
);

// Create models
const Service = mongoose.model('Service', serviceSchema);
const Provider = mongoose.model('Provider', providerSchema);

const seedProviders = async () => {
  try {
    console.log('Starting provider seeding process...');

    // First get service IDs for reference
    console.log('Fetching services...');
    const services = await Service.find({});

    if (services.length === 0) {
      console.error('No services found. Please create services first.');
      return false;
    }

    console.log(`Found ${services.length} services.`);
    console.log('Service IDs:');
    services.forEach((service) => {
      console.log(`- ${service.name} (${service._id}): ${service.type}`);
    });

    // Create sample providers with service-specific offerings
    const providers = [
      {
        name: 'Andrei Murgu',
        title: 'Professional Cleaning Expert',
        description:
          'Experienced professional with 10+ years in the cleaning industry',
        email: 'andrei.murgu@example.com',
        phone: '+1234567890',
        type: 'person',
        price: 'FREE',
        rating: 4.8,
        isPopular: true,
        isVerified: true,
        isActive: true,
        serviceOfferings: services.map((service) => ({
          service: service._id,
          description:
            service.type === 'DOMESTIC CLEANING'
              ? 'Specialized in residential cleaning with attention to detail'
              : service.type === 'COMMERCIAL CLEANING'
              ? 'Expert in commercial cleaning and office maintenance'
              : 'Experienced in specialized deep cleaning techniques',
          options: service.options.map((option) => ({
            optionId: option._id,
            name: option.name,
            price: parseInt(option.price.replace('€', '')),
            description: option.description,
          })),
        })),
      },
      {
        name: 'Clean & Fresh',
        title: 'Eco-friendly Cleaning',
        description:
          'Specialized in eco-friendly cleaning solutions for environmentally conscious clients',
        email: 'contact@cleanfresh.example.com',
        phone: '+1122334455',
        type: 'company',
        price: 'FREE',
        rating: 4.7,
        isPopular: true,
        isVerified: true,
        isActive: true,
        serviceOfferings: services.map((service) => ({
          service: service._id,
          description:
            service.type === 'DOMESTIC CLEANING'
              ? 'Eco-friendly home cleaning with all-natural products'
              : service.type === 'COMMERCIAL CLEANING'
              ? 'Green cleaning solutions for businesses and commercial spaces'
              : 'Premium deep cleaning with environmental considerations',
          options: service.options.map((option) => ({
            optionId: option._id,
            name: option.name,
            // Slightly higher pricing for the company
            price: parseInt(option.price.replace('€', '')) + 5,
            description: option.description,
          })),
        })),
      },
      {
        name: 'ABC Cleaning Solutions',
        title: 'Enterprise Cleaning Services',
        description:
          'Leading company providing comprehensive cleaning solutions for homes and offices',
        email: 'info@abccleaning.example.com',
        phone: '+1987654321',
        type: 'company',
        price: 'FREE',
        rating: 4.5,
        isVerified: true,
        isActive: true,
        serviceOfferings: services.map((service) => ({
          service: service._id,
          description:
            service.type === 'DOMESTIC CLEANING'
              ? 'Premium residential cleaning services with a satisfaction guarantee'
              : service.type === 'COMMERCIAL CLEANING'
              ? 'Professional commercial cleaning with industry-standard protocols'
              : 'Specialized cleaning services for difficult situations',
          options: service.options.map((option) => ({
            optionId: option._id,
            name: option.name,
            // Different pricing strategy for this company
            price: parseInt(option.price.replace('€', '')) + 10,
            description: option.description,
          })),
        })),
      },
    ];

    // Remove any existing providers first
    console.log('Deleting existing providers...');
    await Provider.deleteMany({});
    console.log('Deleted existing providers');

    // Insert new providers
    console.log('Creating new providers...');
    const result = await Provider.insertMany(providers);
    console.log(
      `Providers seeded successfully. Created ${result.length} providers.`
    );

    // Log some information about created providers
    console.log('\nProvider details:');
    for (const provider of result) {
      console.log(`- ${provider.name} (${provider.type})`);
      console.log(`  Services: ${provider.serviceOfferings.length}`);
    }

    return true;
  } catch (error) {
    console.error('Error during provider seeding:', error);
    return false;
  }
};

const main = async () => {
  try {
    // Connect to MongoDB
    const connected = await connectToMongoDB();
    if (!connected) {
      console.error('Failed to connect to MongoDB. Exiting...');
      process.exit(1);
    }

    // Run the seed function
    const success = await seedProviders();

    // Close the MongoDB connection
    console.log('Closing database connection...');
    await mongoose.connection.close();
    console.log('Database connection closed');

    if (success) {
      console.log('Seeding completed successfully!');
      process.exit(0);
    } else {
      console.error('Seeding failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    try {
      await mongoose.connection.close();
    } catch (err) {
      // Ignore errors on close
    }
    process.exit(1);
  }
};

// Run the main function
main();
