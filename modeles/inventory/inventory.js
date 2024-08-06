const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString(),
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ["entry", "exit"],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    creationDate: {
        type: Date,
        default: Date.now
    },
    conditionOfProperty: {
        type: String,
        required: true,
        index: true
    },
    remarks: String,
    photos: [String],
    createdBy: {
        type: String,
        ref: 'User',
        index: true
    },
    signedByOwner: {
        type: String,
        ref: 'User',
        index: true
    },
    signedByTenant: {
        type: String,
        ref: 'User',
        index: true
    },
    property: {
        type: String,
        ref: 'Property',
        index: true
    },
    unit: {
        type: String,
        ref: 'Unit',
        index: true
    },
    items: [{
        item: {
            type: String,
            ref: 'Item',
            index: true
        },
        quantity: {
            type: Number,
            default: 0
        },
        condition: {
            type: String,
            enum: ['new', 'good', 'bad'],
            required: true
        }
    }],
    notes: [String]
});


// Pre-hook para validaciones adicionales
InventorySchema.pre('save', function(next) {
    if (this.items.some(item => !item.item)) {
        return next(new Error('All items in inventory must have a valid reference.'));
    }
    next();
});


const Inventory = mongoose.model('Inventory', InventorySchema);

module.exports = Inventory;
