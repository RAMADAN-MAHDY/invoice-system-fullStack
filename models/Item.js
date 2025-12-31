const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  modelNumber: {
    type: String,
    required: true,
    trim: true,
  },
  customer: {
    type: String,
    required: false,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Item', itemSchema);
