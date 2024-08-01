const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
    required: true,
    index: true
  },
  owners: [
    {
      type: String,
      ref: 'User',
      required: true,
      index: true
    }
  ],
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
  name: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ["residential", "commercial"],
    required: true,
    index: true
  },
  units: [
    {
      type: String,
      ref: 'units',
      index: true
    }
  ],
  description: {
    type: String,
    required: true
  },
  tenants: [
    {
      type: String,
      ref: 'User',
      index: true
    }
  ],
  photos: [
    {
      type: String
    }
  ],
  workers: [
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
  contracts: [
    {
      type: String,
      ref: 'Contract',
      index: true,
    }
  ]
});

const Property = mongoose.model('Properties', propertySchema);

module.exports = Property;
