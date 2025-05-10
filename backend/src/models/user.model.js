import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    street: String,
    city: String,
    zipCode: String,
    country: String,
    coordinates: {
        lat: Number,
        lng: Number
    }
});

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isProvider: {
        type: Boolean,
        default: false
    },
    address: addressSchema,
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
}, {timestamps: true});

export const User = mongoose.model('User', userSchema);