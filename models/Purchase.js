const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['purchase', 'adjustment'], default: 'purchase' },
  reason: { type: String, default: '' },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', index: true },
  modelNumber: { type: String },
  name: { type: String },
  quantity: { type: Number, min: 0 },
  price: { type: Number, min: 0 },
  supplier: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
