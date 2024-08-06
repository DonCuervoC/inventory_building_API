const mongoose = require('mongoose');

// Esquema para Room
const roomsSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString(),
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    photos: [
        {
            type: String
        }
    ],
    isActive: {
        type: Boolean,
        default: false,
        index: true
    },
    unit: {
        type: String,
        ref: 'Unit', // Referencia al modelo de unidad
        required: true,
        index: true
    },
    property: {
        type: String,
        ref: 'Property', // Referencia al modelo de propiedad
        required: true,
        index: true
    },
    items: [
        {
            itemId: {
                type: String,
                ref: 'Item',
                index: true
            },
            reference: {
                type: String,
                index: true,
            },
        }
    ],
    notes: [String],
});

const Room = mongoose.model('Room', roomsSchema);

module.exports = Room;
