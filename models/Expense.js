const mongoose = require('mongoose');
// المصروفات
const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Expense', expenseSchema);