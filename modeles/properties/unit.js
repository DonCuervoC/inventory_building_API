const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
    required: true,
    index: true
  },
  available: {
    type: Boolean,
    default: true,
    required: true,
    index: true
  },
  number: {
    type: String,
    required: true,
    index: true
  },
  property: {
    type: String,
    ref: 'Property',
    required: true,
    index: true
  },
  photos: {
    type: [String]
  },
  description: {
    type: String,
    required: true,
  },
  tenants: [
    {
      type: String,
      ref: 'User',
      index: true
    }
  ],
  inventory: [
    {
      type: String,
      ref: 'Inventory',
      index: true
    }
  ],
  rooms: [
    {
      type: String,
      ref: 'Room', // Relación con el modelo Room
      index: true
    }
  ],
  price: {
    type: Number,
    validate: {
      validator: (value) => value >= 0,
      message: 'Price must be a positive number'
    }
  },
  condition: {
    type: String,
    enum: ['new', 'renovated', 'good', 'bad'],
    required: true,
  },
  repairs: [
    {
      date: {
        type: Date,
      },
      description: {
        type: String,
      }
    }
  ]
});

module.exports = mongoose.model('Unit', unitSchema);
