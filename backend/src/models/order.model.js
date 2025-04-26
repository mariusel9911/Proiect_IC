import mongoose from 'mongoose';

const selectedOptionSchema = new mongoose.Schema({
  optionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service.options',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    selectedOptions: [selectedOptionSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    address: {
      street: String,
      city: String,
      zipCode: String,
      country: String,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      start: String,
      end: String,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      default: 'card',
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
