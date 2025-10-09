const mongoose = require('mongoose');

const saleInvoiceSchema = new mongoose.Schema({
  modelNumber: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SaleInvoice', saleInvoiceSchema);
