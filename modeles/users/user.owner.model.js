const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    address: {
        street: {
            type: String,
            required: true
        },
        apartment: {
            type: String,
            //required: true
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
    companyName: {
        type: String,
        required: true
    },
    roles: {
        type: Array,
        required: true,
        default: ['owner']
    },
    properties: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property',
            required: true
        }
    ],
    appointments: [
        {
            type: String,
            ref: 'Appointment',
            required: true
        }
    ],
    customer_square_id: {
        type: String
    },
    subscription_status: {
        type: String,
        enum: ["active", "inactive"],
        default: "inactive",
        required: true
    },
    payments: {
        type: Array
    },
    isActive: {
        type: Boolean,
        required: true,
        // default: false 
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Correction : Ajout d'un index unique sur le champ email
ownerSchema.index({ email: 1 }, { unique: true });

// Modèle Owner basé sur le schéma
const Owner = mongoose.model('owners', ownerSchema);

module.exports = Owner;
