const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, enum: ['create', 'update', 'delete'] },
  purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase' },
  changes: { type: Object },
  at: { type: Date, default: Date.now }
}, { timestamps: true });
module.exports = mongoose.model('AuditLog', schema);
