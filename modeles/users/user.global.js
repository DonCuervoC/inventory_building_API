const mongoose = require('mongoose');

// Subscription scheme (common for all user types)
const subscriptionSchema = new mongoose.Schema({
    customerSubscriptionId: {
        type: String
    },
    subscriptionStatus: {
        type: String,
        enum: ["active", "inactive"],
        default: "inactive",
        required: true
    },
    payments: [{
        amount: {
            type: Number
        },
        date: {
            type: Date
        },
        status: {
            type: String
        }
    }]
}, { _id: false });



// Global scheme for all user types
const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString(),
        required: true
    },
    email: { // all users
        type: String,
        required: true,
        unique: true
    },
    firstName: { // all users
        type: String,
        required: true
    },
    lastName: { // all users
        type: String 
    },
    password: { // all users
        type: String,
        required: true
    },
    phone: { // all users
        type: String,
        required: true
    },
    avatar: { // all users
        type: String 
    },
    address: { // all users
        street: {
            type: String,
            required: true
        },
        apartment: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        province: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        }
    },
    companyName: { // admin, owner, maintenance
        type: String,
        required: true
    },
    roles: {
        type: [String],
        enum: ['admin', 'owner', 'tenant', 'maintenance', 'master'],
        required: true
    },
    properties: [{ // owner, admin, maintenence, super
        type: String,
        ref: 'Property'
    }],
    appointments: [{ // owner, admin, super
        type: String,
        ref: 'Appointment'
    }],
    units: [{ // maintenance
        type: String,
        ref: 'Units'
    }],
    contracts: [{ // tenant
        type: String,
        ref: 'Contract'
    }],
    customerData: [subscriptionSchema], // owner
    isActive: { // all users
        type: Boolean,
        required: true,
        default: true
    },
    creationDate: { // all users
        type: Date,
        default: Date.now
    }, 
    moveInDate: { // tenant
        type: Date 
    },
    allConditionsAccepted: {
        type: Boolean,
        default: false
    },
    authDetails: { // Object for authentication and verification details
        loginAttempts: {
            type: Number,
            default: 0,
            required: true
        },
        verificationCode: {
            type: String,
            default: null
        },
        verificationAttempts: {
            type: Number,
            default: 0
        },
        verificationCodeExpiration: {
            type: Date,
            default: null
        },
        
    }
});

// Index
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ roles: 1 });
userSchema.index({ properties: 1 });
userSchema.index({ appointments: 1 });
userSchema.index({ units: 1 });
userSchema.index({ contracts: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
