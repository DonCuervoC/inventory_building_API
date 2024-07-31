const mongoose = require('mongoose');

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

const ownerSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString(),
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
            type: String,
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
    customerData: [subscriptionSchema], // Array containing the subscription scheme
    isActive: {
        type: Boolean,
        required: true,
        default: true 
    },
    date: {
        type: Date,
        default: Date.now
    }
});


ownerSchema.index({ email: 1 }, { unique: true });
ownerSchema.index({ appointments: 1 });
ownerSchema.index({ properties: 1 });
ownerSchema.index({ roles: 1 }); 


const Owner = mongoose.model('owners', ownerSchema);

async function createIndexes() {
    await Owner.syncIndexes();
    console.log('Indexes created');
}

createIndexes().catch(err => console.log(err));

module.exports = Owner;
