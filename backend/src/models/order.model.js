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

const paymentDetailsSchema = new mongoose.Schema({
    // Common payment fields
    transactionId: String,
    timestamp: Date,

    // PayPal specific fields
    paypalOrderId: String,
    paypalPayerId: String,
    paypalCapture: {
        id: String,
        status: String,
    },

    // Card specific fields (if you want to store tokenized card info later)
    cardLast4: String,
    cardBrand: String,
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
            enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
            enum: ['card', 'paypal', 'cash'],
            default: 'card',
        },
        paymentDetails: paymentDetailsSchema,
    },
    { timestamps: true }
);

// Add a method to update status based on payment status
orderSchema.methods.updateStatusBasedOnPayment = function () {
    // If payment is completed, move to confirmed status
    if (this.paymentStatus === 'completed' && this.status === 'pending') {
        this.status = 'confirmed';
    }

    // If payment failed, keep in pending
    if (this.paymentStatus === 'failed') {
        this.status = 'pending';
    }

    // If payment refunded, set to cancelled
    if (this.paymentStatus === 'refunded') {
        this.status = 'cancelled';
    }
};

// Middleware to auto-update status when payment status changes
orderSchema.pre('save', function (next) {
    // If payment status is being modified
    if (this.isModified('paymentStatus')) {
        this.updateStatusBasedOnPayment();
    }
    next();
});

export const Order = mongoose.model('Order', orderSchema);