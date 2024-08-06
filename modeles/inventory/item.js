const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString(),
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['element', 'appliance', 'furniture', 'lighting', 'electrical'],
        required: true,
        index: true
    },
    category: {
        type: String, // e.g., bed, sofa, fridge, etc.
        required: true,
        index: true
    },
    creationDate: {
        type: Date,
        default: Date.now
    },
    description: String,
    condition: {
        type: String,
        index: true
    },
    photos: [String],
    notes: [String],
    property: {
        type: [String],
        ref: 'Property',
        index: true
    },
    totalQuantity: {
        type: Number,
        required: true,
        default: 0
    },
    assignedQuantity: {
        type: Number,
        default: 0
    },
    availableQuantity: {
        type: Number,
        required: true,
        default: 0
    },
    codes: [
        {
            _id: false,
            reference: {
                type: String,
                required: true
            },
            isAssigned: {
                type: Boolean,
                default: false
            },
            assignedTo:{
                type: String,
                ref: 'Unit',
            },
            condition: {
                type: String,
                enum: ['new', 'good', 'bad'],
                required: true,
            },
        }
    ]
});

// // Ensure that either property or unit is set, but not both
ItemSchema.pre('save', function (next) {
    // if (!this.property) {
    //     return next(new Error('Item must belong to a property.'));
    // }
    if (this.totalQuantity < this.assignedQuantity) {
        return next(new Error('Total quantity cannot be less than assigned quantity.'));
    }
    next();
});

const Item = mongoose.model('Item', ItemSchema);

module.exports = Item;
