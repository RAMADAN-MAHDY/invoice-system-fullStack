const mongoose = require('mongoose');
module.exports = mongoose.model('PurchaseBackup', new mongoose.Schema({}, { strict: false, timestamps: true }));
